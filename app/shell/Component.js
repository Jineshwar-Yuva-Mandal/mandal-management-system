sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/BusyDialog",
    "sap/tnt/NavigationListItem"
], function (UIComponent, JSONModel, BusyDialog, NavigationListItem) {
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
            "admin/mandal/webapp",
            "admin/appaccess/webapp"
        ],

        /** Map admin app webapp paths to app_key values used in AppAccessGrants */
        _appPathToKey: {
            "admin/members/webapp":            "members",
            "admin/joinrequests/webapp":        "joinrequests",
            "admin/positions/webapp":           "positions",
            "admin/eventsandattendance/webapp": "eventsandattendance",
            "admin/courses/webapp":             "courses",
            "admin/fines/webapp":               "fines",
            "admin/ledger/webapp":              "ledger",
            "admin/mandal/webapp":              "mandal",
            "admin/appaccess/webapp":           "appaccess"
        },

        /** All admin nav items in sidebar order */
        _adminNavItems: [
            { appKey: "members",            text: "Members",              icon: "sap-icon://group",                                 key: "admin/members/webapp/index.html" },
            { appKey: "joinrequests",       text: "Join Requests",        icon: "sap-icon://add-employee",                          key: "admin/joinrequests/webapp/index.html" },
            { appKey: "positions",          text: "Positions",            icon: "sap-icon://org-chart",                             key: "admin/positions/webapp/index.html" },
            { appKey: "eventsandattendance",text: "Events & Attendance",  icon: "sap-icon://calendar",                              key: "admin/eventsandattendance/webapp/index.html" },
            { appKey: "courses",            text: "Courses",              icon: "sap-icon://education",                             key: "admin/courses/webapp/index.html" },
            { appKey: "fines",              text: "Fines",                icon: "sap-icon://money-bills",                           key: "admin/fines/webapp/index.html" },
            { appKey: "ledger",             text: "Financial Ledger",     icon: "sap-icon://accounting-document-verification",      key: "admin/ledger/webapp/index.html" },
            { appKey: "mandal",             text: "Mandal Settings",      icon: "sap-icon://action-settings",                       key: "admin/mandal/webapp/index.html" },
            { appKey: "appaccess",          text: "App Access",           icon: "sap-icon://key-user-settings",                     key: "admin/appaccess/webapp/index.html" }
        ],

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            var oModel = new JSONModel({
                authenticated: false,
                authView: "login",
                isAdmin: false,
                adminAppAccess: {
                    members: false,
                    joinrequests: false,
                    positions: false,
                    eventsandattendance: false,
                    courses: false,
                    fines: false,
                    ledger: false,
                    mandal: false,
                    appaccess: false
                },
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
                    { key: "member/myprofile/webapp/index.html",           title: "My Profile",       desc: "View and edit your profile",     icon: "sap-icon://account" },
                    { key: "member/mandalevents/webapp/index.html",       title: "Events",           desc: "View upcoming events",           icon: "sap-icon://appointment" },
                    { key: "member/courseassignments/webapp/index.html",   title: "My Courses",       desc: "Track course progress",          icon: "sap-icon://curriculum" },
                    { key: "member/myfines/webapp/index.html",            title: "My Fines",         desc: "View fines and payments",        icon: "sap-icon://money-bills" },
                    { key: "member/memberdirectory/webapp/index.html",    title: "Member Directory", desc: "Browse mandal members",          icon: "sap-icon://contacts" },
                    { key: "member/ledger/webapp/index.html",             title: "Ledger",           desc: "View financial records",         icon: "sap-icon://monitor-payments" }
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
                        console.error('Auth config missing — SUPABASE_URL or SUPABASE_ANON_KEY not set on server.'); // eslint-disable-line no-console
                        oModel.setProperty("/authenticated", false);
                        return;
                    }
                    // Create Supabase client (CDN may be blocked by tracking prevention)
                    if (!window.supabase) {
                        console.warn('Supabase SDK not loaded (CDN blocked?). Auth unavailable.'); // eslint-disable-line no-console
                        oModel.setProperty("/authenticated", false);
                        return;
                    }
                    that._supabase = window.supabase.createClient(sUrl, sKey);
                    that._checkSession(oModel);
                })
                .catch(function (err) {
                    console.error('Failed to reach backend for auth config:', err); // eslint-disable-line no-console
                    oModel.setProperty("/authenticated", false);
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
                    // Store user's platform role and ID for profile/admin check
                    oModel.setProperty("/userRole", oUserData.role || "member");
                    oModel.setProperty("/userId", oUserData.ID);
                    // User exists — check memberships via member service
                    that._supabaseToken = sToken;
                    return fetch("./api/member/MyMandals?$expand=mandal", {
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
                    var bIsAdmin = aMemberships.some(function (m) { return m.is_admin; }) || oModel.getProperty("/userRole") === "mandal_admin" || oModel.getProperty("/userRole") === "platform_admin";
                    oModel.setProperty("/isAdmin", bIsAdmin);

                    // Store admin mandal ID for direct navigation
                    var oAdminMembership = aMemberships.find(function (m) { return m.is_admin; });
                    if (oAdminMembership) {
                        oModel.setProperty("/adminMandalId", oAdminMembership.mandal_ID);
                    }

                    // Fetch user's position titles for profile display (scoped to admin's mandal)
                    var sMandalFilter = oAdminMembership ? " and mandal_ID eq " + oAdminMembership.mandal_ID : "";
                    fetch("./api/member/MyPositions?$expand=position&$filter=(valid_to eq null or valid_to ge " + new Date().toISOString().slice(0, 10) + ")" + sMandalFilter, {
                        headers: { "Authorization": "Bearer " + sToken }
                    }).then(function (r) {
                        if (!r.ok) return { value: [] };
                        return r.json();
                    }).then(function (oPosResult) {
                        var aPositions = (oPosResult.value || []);
                        if (aPositions.length > 0) {
                            var sRoles = aPositions.map(function (p) { return p.position?.name || ""; }).filter(Boolean).join(", ");
                            if (sRoles) oModel.setProperty("/profile/role", sRoles);
                        } else if (bIsAdmin) {
                            oModel.setProperty("/profile/role", "Admin");
                        }
                    }).catch(function () { /* keep default */ });

                    // Set per-app admin access
                    if (bIsAdmin) {
                        // Full admins see all admin apps
                        var oAccess = {};
                        Object.values(that._appPathToKey).forEach(function (k) { oAccess[k] = true; });
                        oModel.setProperty("/adminAppAccess", oAccess);
                        that._populateAdminNav(oAccess);
                        oModel.setProperty("/authenticated", true);
                        that._hideBusy();
                        that._navigateTo("mainShellPage");
                    } else {
                        // Regular member — check for app access grants
                        fetch("./api/member/MyAppGrants", {
                            headers: { "Authorization": "Bearer " + that._supabaseToken }
                        }).then(function (r) {
                            if (!r.ok) return { value: [] };
                            return r.json();
                        }).then(function (oGrants) {
                            var aGrants = oGrants.value || [];
                            var oAccess = {};
                            Object.values(that._appPathToKey).forEach(function (k) { oAccess[k] = false; });
                            aGrants.forEach(function (g) { oAccess[g.app_key] = true; });
                            var bHasAnyGrant = aGrants.length > 0;
                            oModel.setProperty("/adminAppAccess", oAccess);
                            that._populateAdminNav(oAccess);
                            oModel.setProperty("/isAdmin", bHasAnyGrant);
                            oModel.setProperty("/authenticated", true);
                            that._hideBusy();
                            that._navigateTo("mainShellPage");
                        }).catch(function () {
                            oModel.setProperty("/adminAppAccess", {});
                            oModel.setProperty("/authenticated", true);
                            that._hideBusy();
                            that._navigateTo("mainShellPage");
                        });
                    }
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
        },

        /**
         * Dynamically populate admin sidebar nav items based on access map.
         * Only adds NavigationListItems for apps the user has access to.
         * Also filters the /adminApps tiles on the welcome page.
         */
        _populateAdminNav: function (oAccess) {
            var oView = this.getRootControl();
            if (!oView) return;
            var oAdminGroup = oView.byId("adminNavGroup");
            if (!oAdminGroup) return;

            // Clear existing items
            oAdminGroup.removeAllItems();

            // Add only accessible apps
            this._adminNavItems.forEach(function (oItem) {
                if (oAccess[oItem.appKey]) {
                    oAdminGroup.addItem(new NavigationListItem({
                        text: oItem.text,
                        icon: oItem.icon,
                        key: oItem.key
                    }));
                }
            });

            // Filter welcome page admin tiles to only show accessible apps
            var aAllApps = this.getModel().getProperty("/adminApps") || [];
            var that = this;
            var aFiltered = aAllApps.filter(function (oApp) {
                // oApp.key is like "admin/members/webapp/index.html"
                // Extract path without /index.html to look up in _appPathToKey
                var sPath = oApp.key.replace("/index.html", "");
                var sAppKey = that._appPathToKey[sPath];
                return sAppKey && oAccess[sAppKey];
            });
            this.getModel().setProperty("/adminApps", aFiltered);
        }
    });
});
