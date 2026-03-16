sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/BusyDialog"
], function (UIComponent, JSONModel, BusyDialog) {
    "use strict";

    return UIComponent.extend("com.samanvay.shell.Component", {
        metadata: {
            manifest: "json"
        },

        /** Paths to admin apps whose manifest.json we read at startup */
        _adminAppPaths: [
            "admin/members/webapp",
            "admin/joinrequests/webapp",
            "admin/positions/webapp",
            "admin/eventsandattendance/webapp",
            "admin/courses/webapp",
            "admin/fines/webapp",
            "admin/ledger/webapp",
            "admin/mandal/webapp"
        ],

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            var oModel = new JSONModel({
                authenticated: false,
                authView: "login",
                isAdmin: false,
                profile: {
                    name: "",
                    initials: "",
                    role: "",
                    email: ""
                },
                auth: {
                    isSignup: false,
                    email: "",
                    password: "",
                    confirmPassword: "",
                    fullName: "",
                    phone: "",
                    errorMessage: "",
                    busy: false,
                    subtitle: "Sign in to your account",
                    submitText: "Sign In",
                    toggleText: "Don't have an account? Sign Up"
                },
                createMandal: {
                    name: "",
                    area: "",
                    city: "",
                    state: "",
                    errorMessage: "",
                    busy: false
                },
                joinMandal: {
                    mandals: [],
                    allMandals: [],
                    errorMessage: "",
                    successMessage: "",
                    busy: false
                },
                adminApps: [],
                memberApps: [
                    { key: "#member-profile",    title: "My Profile",       desc: "View and edit your profile",   icon: "sap-icon://account" },
                    { key: "#member-mandals",    title: "My Mandals",       desc: "View your mandal memberships", icon: "sap-icon://building" },
                    { key: "#member-events",     title: "Events",           desc: "View upcoming events",         icon: "sap-icon://appointment" },
                    { key: "#member-courses",    title: "My Courses",       desc: "Track course progress",        icon: "sap-icon://curriculum" },
                    { key: "#member-fines",      title: "My Fines",         desc: "View fines and payments",      icon: "sap-icon://money-bills" },
                    { key: "#member-directory",   title: "Member Directory", desc: "Browse mandal members",        icon: "sap-icon://contacts" },
                    { key: "#member-ledger",     title: "Ledger",           desc: "View financial records",       icon: "sap-icon://monitor-payments" }
                ]
            });
            this.setModel(oModel);

            this._initAuth(oModel);
            this._loadAdminApps(oModel);
        },

        _showBusy: function (sText) {
            if (!this._oBusyDialog) {
                this._oBusyDialog = new BusyDialog({ title: "Please Wait" });
            }
            this._oBusyDialog.setText(sText || "");
            this._oBusyDialog.open();
        },

        _hideBusy: function () {
            if (this._oBusyDialog) {
                this._oBusyDialog.close();
            }
        },

        /**
         * Initialize Supabase auth — fetch config, create client, check session.
         */
        _initAuth: function (oModel) {
            var that = this;
            fetch("./api/public/getAuthConfig()")
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    var sUrl = oData.url || oData.value?.url;
                    var sKey = oData.anonKey || oData.value?.anonKey;
                    if (!sUrl || !sKey) {
                        // No Supabase configured — dev mode, skip auth
                        oModel.setProperty("/authenticated", true);
                        oModel.setProperty("/isAdmin", true);
                        oModel.setProperty("/profile/name", "Dev User");
                        oModel.setProperty("/profile/initials", "D");
                        oModel.setProperty("/profile/role", "Developer (no auth)");
                        that._navigateTo("mainShellPage");
                        return;
                    }
                    // Create Supabase client (CDN may be blocked by tracking prevention)
                    if (!window.supabase) {
                        console.warn('Supabase SDK not loaded (CDN blocked?). Auth unavailable.');
                        oModel.setProperty("/authenticated", false);
                        return;
                    }
                    that._supabase = window.supabase.createClient(sUrl, sKey);
                    that._checkSession(oModel);
                })
                .catch(function () {
                    // Backend not reachable — dev mode fallback
                    oModel.setProperty("/authenticated", true);
                    oModel.setProperty("/isAdmin", true);
                    oModel.setProperty("/profile/name", "Dev User");
                    oModel.setProperty("/profile/initials", "D");
                    oModel.setProperty("/profile/role", "Developer (no auth)");
                    that._navigateTo("mainShellPage");
                });
        },

        /**
         * Check if there's an existing Supabase session.
         */
        _checkSession: function (oModel) {
            var that = this;
            this._showBusy("Checking session…");
            this._supabase.auth.getSession().then(function (result) {
                var oSession = result.data?.session;
                if (oSession) {
                    that._onAuthenticated(oModel, oSession.user);
                } else {
                    that._hideBusy();
                }
                // If no session, authenticated stays false → login page shown
            }).catch(function () {
                that._hideBusy();
            });
        },

        /**
         * Called after successful login/signup — load user profile and memberships.
         */
        _onAuthenticated: function (oModel, oSupaUser) {
            var that = this;
            var sEmail = oSupaUser.email;
            var sName = oSupaUser.user_metadata?.full_name || sEmail;

            this._showBusy("Loading your profile…");

            oModel.setProperty("/profile/name", sName);
            oModel.setProperty("/profile/email", sEmail);
            oModel.setProperty("/profile/initials", sName.charAt(0).toUpperCase());
            oModel.setProperty("/profile/role", "Member");

            // Check if user has mandal memberships
            var sToken = null;
            this._supabase.auth.getSession().then(function (result) {
                sToken = result.data?.session?.access_token;
                // Set session cookie so iframed apps are authenticated
                return fetch("./auth/session", {
                    method: "POST",
                    headers: { "Authorization": "Bearer " + sToken }
                });
            }).then(function () {
                return fetch("./api/public/getUserByAuthId(authId='" + encodeURIComponent(sEmail) + "')");
            }).then(function (r) { return r.json(); })
              .then(function (oUser) {
                var oUserData = oUser.value || oUser;
                if (oUserData && oUserData.ID) {
                    // User exists — check memberships via member service
                    that._supabaseToken = sToken;
                    return fetch("./api/member/MyMandals", {
                        headers: { "Authorization": "Bearer " + sToken }
                    }).then(function (r) {
                        if (!r.ok) return { value: [] };
                        return r.json();
                    });
                }
                return { value: [] };
            }).then(function (oResult) {
                var aMemberships = oResult.value || [];
                if (aMemberships.length > 0) {
                    // User has memberships — show dashboard
                    var bIsAdmin = aMemberships.some(function (m) { return m.is_admin; });
                    oModel.setProperty("/isAdmin", bIsAdmin);
                    oModel.setProperty("/authenticated", true);
                    that._hideBusy();
                    that._navigateTo("mainShellPage");
                } else {
                    // User exists but no memberships — show onboarding
                    oModel.setProperty("/authenticated", false);
                    that._hideBusy();
                    that._showOnboarding();
                }
            }).catch(function () {
                // Error checking memberships — show onboarding
                that._hideBusy();
                that._showOnboarding();
            });
        },

        _showOnboarding: function () {
            this.getModel().setProperty("/authView", "onboarding");
            this._navigateTo("onboardingPage");
        },

        /**
         * Navigate the root App container to a page by local ID.
         */
        _navigateTo: function (sPageId) {
            var oView = this.getRootControl();
            if (!oView) return;
            var oApp = oView.byId("shellApp");
            var oPage = oView.byId(sPageId);
            if (oApp && oPage) {
                oApp.to(oPage, "show");
            }
        },

        /**
         * Fetch each admin app's manifest.json and i18n.properties,
         * resolve crossNavigation inbound title/subTitle/icon.
         */
        _loadAdminApps: function (oModel) {
            var aPromises = this._adminAppPaths.map(function (sPath) {
                return fetch("./" + sPath + "/manifest.json")
                    .then(function (r) { return r.json(); })
                    .then(function (oManifest) {
                        var oInbounds = (oManifest["sap.app"].crossNavigation || {}).inbounds || {};
                        var oInbound = oInbounds[Object.keys(oInbounds)[0]] || {};
                        var sTitle = oInbound.title || oManifest["sap.app"].title || "";
                        var sSubTitle = oInbound.subTitle || "";
                        var sIcon = oInbound.icon || "";
                        return { manifestPath: sPath, title: sTitle, subTitle: sSubTitle, icon: sIcon };
                    })
                    .then(function (oData) {
                        var bNeedsI18n = /\{\{/.test(oData.title) || /\{\{/.test(oData.subTitle);
                        if (!bNeedsI18n) return oData;
                        return fetch("./" + oData.manifestPath + "/i18n/i18n.properties")
                            .then(function (r) { return r.text(); })
                            .then(function (sProps) {
                                var oBundle = {};
                                sProps.split("\n").forEach(function (sLine) {
                                    var iEq = sLine.indexOf("=");
                                    if (iEq > 0 && sLine.charAt(0) !== "#") {
                                        oBundle[sLine.substring(0, iEq).trim()] = sLine.substring(iEq + 1).trim();
                                    }
                                });
                                oData.title = oData.title.replace(/\{\{(\w+)\}\}/g, function (_, k) { return oBundle[k] || k; });
                                oData.subTitle = oData.subTitle.replace(/\{\{(\w+)\}\}/g, function (_, k) { return oBundle[k] || k; });
                                return oData;
                            });
                    });
            });

            Promise.all(aPromises).then(function (aApps) {
                var aAdminApps = aApps.map(function (o) {
                    return {
                        key: o.manifestPath + "/index.html",
                        title: o.title,
                        desc: o.subTitle,
                        icon: o.icon || "sap-icon://action-settings"
                    };
                });
                oModel.setProperty("/adminApps", aAdminApps);
            });
        },

        /**
         * Get the Supabase client instance (used by controller).
         */
        getSupabase: function () {
            return this._supabase;
        },

        /**
         * Get the current Supabase access token.
         */
        getAccessToken: function () {
            return this._supabaseToken;
        }
    });
});
