sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, Fragment, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.samanvay.shell.controller.App", {

        onInit: function () {
            this._fnPostMessage = this._onPostMessage.bind(this);
            window.addEventListener("message", this._fnPostMessage);

            this._fnCardClick = this._onCardClick.bind(this);
            document.addEventListener("click", this._fnCardClick);
        },

        _showBusy: function (sText) {
            this.getOwnerComponent()._showBusy(sText);
        },

        _hideBusy: function () {
            this.getOwnerComponent()._hideBusy();
        },

        _onCardClick: function (oEvent) {
            var oEl = oEvent.target;
            while (oEl && !oEl.classList.contains("samanvayCard")) {
                oEl = oEl.parentElement;
            }
            if (!oEl || !oEl.id) return;

            var oControl = sap.ui.getCore().byId(oEl.id);
            if (oControl) {
                var sKey = oControl.data("appKey");
                if (sKey) {
                    this._openApp(sKey);
                }
            }
        },

        /* ═══════════════════════════════════════════
           ── Auth: Login / Signup
           ═══════════════════════════════════════════ */

        onAuthToggle: function () {
            var oModel = this.getView().getModel();
            var bSignup = !oModel.getProperty("/auth/isSignup");
            oModel.setProperty("/auth/isSignup", bSignup);
            oModel.setProperty("/auth/errorMessage", "");
            oModel.setProperty("/auth/subtitle", bSignup ? "Create a new account" : "Sign in to your account");
            oModel.setProperty("/auth/submitText", bSignup ? "Sign Up" : "Sign In");
            oModel.setProperty("/auth/toggleText", bSignup
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up");
        },

        onAuthSubmit: function () {
            var oModel = this.getView().getModel();
            var bSignup = oModel.getProperty("/auth/isSignup");
            oModel.setProperty("/auth/errorMessage", "");
            oModel.setProperty("/auth/busy", true);
            this._showBusy(bSignup ? "Creating your account…" : "Signing you in…");

            if (bSignup) {
                this._doSignup(oModel);
            } else {
                this._doLogin(oModel);
            }
        },

        _doLogin: function (oModel) {
            var that = this;
            var sEmail = (oModel.getProperty("/auth/email") || "").trim().toLowerCase();
            var sPassword = oModel.getProperty("/auth/password") || "";

            if (!sEmail || !sPassword) {
                oModel.setProperty("/auth/errorMessage", "Please enter email and password.");
                oModel.setProperty("/auth/busy", false);
                this._hideBusy();
                return;
            }

            var oSupabase = this.getOwnerComponent().getSupabase();
            if (!oSupabase) {
                oModel.setProperty("/auth/errorMessage", "Auth service not available.");
                oModel.setProperty("/auth/busy", false);
                this._hideBusy();
                return;
            }

            oSupabase.auth.signInWithPassword({ email: sEmail, password: sPassword })
                .then(function (result) {
                    oModel.setProperty("/auth/busy", false);
                    if (result.error) {
                        that._hideBusy();
                        oModel.setProperty("/auth/errorMessage", result.error.message);
                        return;
                    }
                    oModel.setProperty("/auth/password", "");
                    that.getOwnerComponent()._onAuthenticated(oModel, result.data.user);
                });
        },

        _doSignup: function (oModel) {
            var that = this;
            var sEmail = (oModel.getProperty("/auth/email") || "").trim().toLowerCase();
            var sPassword = oModel.getProperty("/auth/password") || "";
            var sConfirm = oModel.getProperty("/auth/confirmPassword") || "";
            var sFullName = (oModel.getProperty("/auth/fullName") || "").trim();
            var sPhone = (oModel.getProperty("/auth/phone") || "").trim();

            if (!sEmail || !sPassword || !sFullName) {
                oModel.setProperty("/auth/errorMessage", "Please fill in all required fields.");
                oModel.setProperty("/auth/busy", false);
                this._hideBusy();
                return;
            }
            if (sPassword.length < 6) {
                oModel.setProperty("/auth/errorMessage", "Password must be at least 6 characters.");
                oModel.setProperty("/auth/busy", false);
                this._hideBusy();
                return;
            }
            if (sPassword !== sConfirm) {
                oModel.setProperty("/auth/errorMessage", "Passwords do not match.");
                oModel.setProperty("/auth/busy", false);
                this._hideBusy();
                return;
            }

            var oSupabase = this.getOwnerComponent().getSupabase();
            if (!oSupabase) {
                oModel.setProperty("/auth/errorMessage", "Auth service not available.");
                oModel.setProperty("/auth/busy", false);
                this._hideBusy();
                return;
            }

            oSupabase.auth.signUp({
                email: sEmail,
                password: sPassword,
                options: { data: { full_name: sFullName, phone: sPhone } }
            }).then(function (result) {
                if (result.error) {
                    oModel.setProperty("/auth/errorMessage", result.error.message);
                    oModel.setProperty("/auth/busy", false);
                    that._hideBusy();
                    return;
                }
                // Create platform user record via standard OData POST
                return fetch("./api/public/NewUser", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: sEmail, full_name: sFullName, phone: sPhone })
                }).then(function (resp) {
                    if (!resp.ok) {
                        // User may already exist from a prior attempt — continue if we have a session
                        if (result.data.session) {
                            that.getOwnerComponent()._onAuthenticated(oModel, result.data.user);
                            return;
                        }
                        return resp.json().then(function (body) {
                            var sMsg = (body.error && body.error.message) || "Registration failed.";
                            throw new Error(sMsg);
                        });
                    }
                    oModel.setProperty("/auth/busy", false);
                    oModel.setProperty("/auth/password", "");
                    oModel.setProperty("/auth/confirmPassword", "");

                    // Auto-confirmed — proceed directly (no email verification step)
                    if (result.data.session) {
                        that.getOwnerComponent()._onAuthenticated(oModel, result.data.user);
                    } else {
                        that._hideBusy();
                        oModel.setProperty("/auth/isSignup", false);
                        oModel.setProperty("/auth/subtitle", "Sign in to your account");
                        oModel.setProperty("/auth/submitText", "Sign In");
                        oModel.setProperty("/auth/toggleText", "Don't have an account? Sign Up");
                        oModel.setProperty("/auth/email", sEmail);
                    }
                });
            }).catch(function (err) {
                oModel.setProperty("/auth/errorMessage", err.message || "Signup failed.");
                oModel.setProperty("/auth/busy", false);
                that._hideBusy();
            });
        },

        /* ═══════════════════════════════════════════
           ── Onboarding: Create / Join Mandal
           ═══════════════════════════════════════════ */

        onGoToCreateMandal: function () {
            this.getView().getModel().setProperty("/authView", "createMandal");
            this.getOwnerComponent()._navigateTo("createMandalPage");
        },

        onGoToJoinMandal: function () {
            var that = this;
            var oModel = this.getView().getModel();
            oModel.setProperty("/joinMandal/busy", true);
            oModel.setProperty("/joinMandal/errorMessage", "");
            oModel.setProperty("/joinMandal/successMessage", "");
            oModel.setProperty("/authView", "joinMandal");
            this.getOwnerComponent()._navigateTo("joinMandalPage");
            this._showBusy("Loading mandals…");

            // Fetch mandals
            fetch("./api/public/BrowseMandals")
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    var aMandals = oData.value || [];
                    oModel.setProperty("/joinMandal/mandals", aMandals);
                    oModel.setProperty("/joinMandal/allMandals", aMandals);
                    oModel.setProperty("/joinMandal/busy", false);
                    that._hideBusy();
                })
                .catch(function () {
                    oModel.setProperty("/joinMandal/errorMessage", "Failed to load mandals.");
                    oModel.setProperty("/joinMandal/busy", false);
                    that._hideBusy();
                });
        },

        onBackToOnboarding: function () {
            this.getView().getModel().setProperty("/authView", "onboarding");
            this.getOwnerComponent()._navigateTo("onboardingPage");
        },

        /* ── Create Mandal ── */

        onCreateMandalSubmit: function () {
            var oModel = this.getView().getModel();
            var sName = (oModel.getProperty("/createMandal/name") || "").trim();
            var sArea = (oModel.getProperty("/createMandal/area") || "").trim();
            var sCity = (oModel.getProperty("/createMandal/city") || "").trim();
            var sState = (oModel.getProperty("/createMandal/state") || "").trim();

            if (!sName || !sCity || !sState) {
                oModel.setProperty("/createMandal/errorMessage", "Please fill in mandal name, city, and state.");
                return;
            }

            oModel.setProperty("/createMandal/errorMessage", "");
            oModel.setProperty("/createMandal/busy", true);
            this._showBusy("Creating your mandal…");

            var sEmail = oModel.getProperty("/profile/email") || "";
            var sCreatorName = oModel.getProperty("/profile/name") || "";

            var that = this;
            fetch("./api/public/createMandal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: sName, area: sArea, city: sCity, state: sState,
                    creatorEmail: sEmail, creatorName: sCreatorName, creatorPhone: "",
                    authId: sEmail
                })
            })
            .then(function (r) {
                if (!r.ok) return r.json().then(function (e) { throw new Error(e.error?.message || "Failed"); });
                return r.json();
            })
            .then(function () {
                oModel.setProperty("/createMandal/busy", false);
                // Reset form
                oModel.setProperty("/createMandal/name", "");
                oModel.setProperty("/createMandal/area", "");
                oModel.setProperty("/createMandal/city", "");
                oModel.setProperty("/createMandal/state", "");
                oModel.setProperty("/authView", "login");
                MessageToast.show("Mandal created successfully!");
                // Re-run full auth flow to set session cookie + resolve updated membership
                var oSupabase = that.getOwnerComponent().getSupabase();
                oSupabase.auth.getSession().then(function (result) {
                    var oSession = result.data?.session;
                    if (oSession) {
                        that.getOwnerComponent()._onAuthenticated(oModel, oSession.user);
                    }
                });
            })
            .catch(function (err) {
                oModel.setProperty("/createMandal/errorMessage", err.message || "Failed to create mandal.");
                oModel.setProperty("/createMandal/busy", false);
                that._hideBusy();
            });
        },

        /* ── Join Mandal ── */

        onMandalSearch: function (oEvent) {
            var sQuery = (oEvent.getParameter("newValue") || "").toLowerCase();
            var oModel = this.getView().getModel();
            var aAll = oModel.getProperty("/joinMandal/allMandals") || [];
            if (!sQuery) {
                oModel.setProperty("/joinMandal/mandals", aAll);
                return;
            }
            var aFiltered = aAll.filter(function (m) {
                return (m.name || "").toLowerCase().indexOf(sQuery) >= 0
                    || (m.city || "").toLowerCase().indexOf(sQuery) >= 0
                    || (m.area || "").toLowerCase().indexOf(sQuery) >= 0;
            });
            oModel.setProperty("/joinMandal/mandals", aFiltered);
        },

        onJoinMandalRequest: function (oEvent) {
            var oSource = oEvent.getSource();
            var sMandalId = oSource.data("mandalId");
            var sMandalName = oSource.data("mandalName");
            var oModel = this.getView().getModel();
            var that = this;

            // Find the mandal object from loaded list
            var aMandals = oModel.getProperty("/joinMandal/allMandals") || [];
            var oMandal = aMandals.find(function (m) { return m.ID === sMandalId; }) || {};

            // Initialize detail model
            oModel.setProperty("/joinDetail", {
                mandalId: sMandalId,
                mandalName: sMandalName,
                hasJoiningFee: !!oMandal.has_joining_fee,
                joiningFee: oMandal.joining_fee || 0,
                paymentQrUrl: "",
                paymentUpiId: oMandal.payment_upi_id || "",
                paymentMode: "",
                paidAmount: "",
                paymentReference: "",
                remarks: "",
                fields: [],
                step: 1,
                totalSteps: oMandal.has_joining_fee ? 2 : 1,
                busy: true,
                errorMessage: "",
                successMessage: ""
            });

            // Navigate to detail page
            this.getOwnerComponent()._navigateTo("joinMandalDetailPage");

            // Fetch QR code if mandal has joining fee
            if (oMandal.has_joining_fee) {
                fetch("./api/public/getPaymentQr(mandalId=" + sMandalId + ")")
                    .then(function (r) { return r.json(); })
                    .then(function (oData) {
                        if (oData.value) {
                            oModel.setProperty("/joinDetail/paymentQrUrl", oData.value);
                        }
                    })
                    .catch(function () { /* No QR uploaded — leave empty */ });
            }

            // Fetch field configuration for this mandal
            fetch("./api/public/FieldConfig?$filter=mandal_ID eq " + sMandalId + "&$expand=field&$orderby=sequence asc")
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    var aConfigs = (oData.value || []).filter(function (fc) {
                        return fc.requirement !== "hidden";
                    });
                    var aFields = aConfigs.map(function (fc) {
                        return {
                            field_name: fc.field_name || (fc.field && fc.field.field_name) || "",
                            label: fc.custom_label || (fc.field && fc.field.label) || fc.field_name || "",
                            requirement: fc.requirement,
                            value: ""
                        };
                    });
                    oModel.setProperty("/joinDetail/fields", aFields);
                    oModel.setProperty("/joinDetail/busy", false);
                })
                .catch(function () {
                    // No field config — still allow join
                    oModel.setProperty("/joinDetail/fields", []);
                    oModel.setProperty("/joinDetail/busy", false);
                });
        },

        onBackToJoinMandalList: function () {
            this.getOwnerComponent()._navigateTo("joinMandalPage");
        },

        onQrImageError: function () {
            this.getView().getModel().setProperty("/joinDetail/paymentQrUrl", "");
        },

        // Step 1 "Next" — validate fields, then either go to step 2 or submit directly
        onJoinDetailStep1Next: function () {
            var oModel = this.getView().getModel();
            var oDetail = oModel.getProperty("/joinDetail") || {};
            oModel.setProperty("/joinDetail/errorMessage", "");

            // Validate required fields
            var aFields = oDetail.fields || [];
            var aMissing = aFields.filter(function (f) { return f.requirement === "required" && !f.value; });
            if (aMissing.length > 0) {
                oModel.setProperty("/joinDetail/errorMessage",
                    "Please fill in: " + aMissing.map(function (f) { return f.label; }).join(", "));
                return;
            }

            if (oDetail.hasJoiningFee) {
                // Go to step 2 (payment)
                oModel.setProperty("/joinDetail/step", 2);
            } else {
                // No payment needed — submit directly
                this.onSubmitJoinRequest();
            }
        },

        onJoinDetailStepBack: function () {
            this.getView().getModel().setProperty("/joinDetail/step", 1);
            this.getView().getModel().setProperty("/joinDetail/errorMessage", "");
        },

        onSubmitJoinRequest: function () {
            var oModel = this.getView().getModel();
            var oDetail = oModel.getProperty("/joinDetail") || {};
            var that = this;

            oModel.setProperty("/joinDetail/errorMessage", "");
            oModel.setProperty("/joinDetail/successMessage", "");

            // Validate required fields
            var aFields = oDetail.fields || [];
            var aMissing = aFields.filter(function (f) { return f.requirement === "required" && !f.value; });
            if (aMissing.length > 0) {
                oModel.setProperty("/joinDetail/errorMessage",
                    "Please fill in: " + aMissing.map(function (f) { return f.label; }).join(", "));
                return;
            }

            // Validate payment if joining fee required
            if (oDetail.hasJoiningFee) {
                if (!oDetail.paymentMode) {
                    oModel.setProperty("/joinDetail/errorMessage", "Please select a payment mode.");
                    return;
                }
                if (!oDetail.paidAmount || parseFloat(oDetail.paidAmount) <= 0) {
                    oModel.setProperty("/joinDetail/errorMessage", "Please enter a valid payment amount.");
                    return;
                }
            }

            oModel.setProperty("/joinDetail/busy", true);
            this._showBusy("Submitting your join request…");

            var sEmail = oModel.getProperty("/profile/email") || "";
            var sName = oModel.getProperty("/profile/name") || "";
            var sPhone = oModel.getProperty("/profile/phone") || "";

            // Build the join request payload
            var oPayload = {
                mandal_ID: oDetail.mandalId,
                requester_name: sName,
                requester_email: sEmail,
                requester_phone: sPhone,
                status: oDetail.hasJoiningFee ? "payment_done" : "submitted",
                fee_amount: oDetail.joiningFee || 0,
                remarks: oDetail.remarks || ""
            };

            // Add payment details if applicable
            if (oDetail.hasJoiningFee) {
                oPayload.paid_amount = parseFloat(oDetail.paidAmount);
                oPayload.paid_date = new Date().toISOString().slice(0, 10);
                oPayload.payment_mode = oDetail.paymentMode;
                oPayload.payment_reference = oDetail.paymentReference || "";
            }

            fetch("./api/public/JoinRequests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oPayload)
            })
            .then(function (r) {
                if (!r.ok) return r.json().then(function (e) { throw new Error(e.error?.message || "Failed"); });
                return r.text().then(function (t) { return t ? JSON.parse(t) : {}; });
            })
            .then(function () {
                oModel.setProperty("/joinDetail/busy", false);
                oModel.setProperty("/joinDetail/successMessage",
                    "Your request to join \"" + oDetail.mandalName + "\" has been submitted! The mandal admin will review it.");
                that._hideBusy();
            })
            .catch(function (err) {
                oModel.setProperty("/joinDetail/errorMessage", err.message || "Failed to submit join request.");
                oModel.setProperty("/joinDetail/busy", false);
                that._hideBusy();
            });
        },

        /* ═══════════════════════════════════════════
           ── Header actions
           ═══════════════════════════════════════════ */

        onMenuButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        onHomePress: function () {
            this.byId("navContainer").backToTop();
            this.byId("sideNav").setSelectedKey("");
        },

        /* ── Profile popover ── */

        onAvatarPress: function (oEvent) {
            var oSource = oEvent.getParameter("avatar");
            if (!this._pProfilePopover) {
                this._pProfilePopover = Fragment.load({
                    id: this.getView().getId(),
                    name: "com.samanvay.shell.view.ProfilePopover",
                    controller: this
                }).then(function (oPopover) {
                    this.getView().addDependent(oPopover);
                    return oPopover;
                }.bind(this));
            }
            this._pProfilePopover.then(function (oPopover) {
                oPopover.openBy(oSource);
            });
        },

        onProfileMenuAction: function (oEvent) {
            var sAction = oEvent.getSource().data("action");
            this.byId("profilePopover").close();

            if (sAction === "signout") {
                this._doSignOut();
            }
        },

        onSignOutPress: function () {
            this._doSignOut();
        },

        _doSignOut: function () {
            var oModel = this.getView().getModel();
            var oSupabase = this.getOwnerComponent().getSupabase();

            if (oSupabase) {
                oSupabase.auth.signOut();
            }

            // Clear server session cookie
            fetch("./auth/logout", { method: "POST" });

            // Reset state
            oModel.setProperty("/authenticated", false);
            oModel.setProperty("/isAdmin", false);
            oModel.setProperty("/profile/name", "");
            oModel.setProperty("/profile/initials", "");
            oModel.setProperty("/profile/role", "");
            oModel.setProperty("/profile/email", "");
            oModel.setProperty("/auth/email", "");
            oModel.setProperty("/auth/password", "");
            oModel.setProperty("/auth/errorMessage", "");

            // Navigate auth view back to login
            oModel.setProperty("/authView", "login");
            this.getOwnerComponent()._navigateTo("loginPage");
            // Navigate main nav back to welcome
            this.byId("navContainer").backToTop();

            MessageToast.show("Signed out.");
        },

        /* ── Side navigation ── */

        onNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();
            if (!sKey || sKey.startsWith("http") || sKey.startsWith("mailto:")) {
                return;
            }
            this._openApp(sKey);
        },

        onFixedNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sUrl = oItem.getKey();
            if (sUrl) {
                if (sUrl.startsWith("mailto:")) {
                    var oLink = document.createElement("a");
                    oLink.href = sUrl;
                    oLink.click();
                } else {
                    window.open(sUrl, "_blank", "noopener");
                }
            }
            this.byId("sideNav").setSelectedKey("");
        },

        /* ── Welcome tile press ── */

        onTilePress: function (oEvent) {
            var sKey = oEvent.getSource().data("appKey");
            if (sKey) {
                this._openApp(sKey);
            }
        },

        /* ── App page back button ── */

        onAppBackPress: function () {
            var oIframe = document.querySelector(".samanvayIframe");
            if (oIframe && oIframe.contentWindow) {
                try {
                    var sUrlBefore = oIframe.contentWindow.location.href;
                    oIframe.contentWindow.history.back();
                    var that = this;
                    setTimeout(function () {
                        try {
                            var sUrlAfter = oIframe.contentWindow.location.href;
                            if (sUrlAfter === sUrlBefore) {
                                that.onHomePress();
                            }
                        } catch (_e) {
                            that.onHomePress();
                        }
                    }, 300);
                } catch (_e) {
                    this.onHomePress();
                }
            } else {
                this.onHomePress();
            }
        },

        /* ── Core app opening logic ── */

        _openApp: function (sKey) {
            var oModel = this.getView().getModel();
            var oNavContainer = this.byId("navContainer");
            var oAppFrame = this.byId("appFrame");

            var sTitle = this._resolveAppTitle(sKey);
            oModel.setProperty("/appTitle", sTitle);

            if (sKey.charAt(0) === "#") {
                oAppFrame.setContent(
                    "<div class='samanvayPlaceholder'>" +
                    "<h2>" + sTitle + "</h2>" +
                    "<p>Coming soon</p></div>"
                );
            } else {
                var sUrl = "./" + sKey;
                // Mandal Settings: skip list, go directly to object page
                if (sKey.indexOf("admin/mandal/") !== -1) {
                    var sMandalId = oModel.getProperty("/adminMandalId");
                    if (sMandalId) {
                        sUrl += "#/Mandal(ID=" + sMandalId + ",IsActiveEntity=true)";
                    }
                }
                // My Profile: skip list, go directly to own profile object page
                if (sKey.indexOf("member/myprofile/") !== -1) {
                    var sUserId = oModel.getProperty("/userId");
                    if (sUserId) {
                        sUrl += "#/MyProfile(ID=" + sUserId + ",IsActiveEntity=true)";
                    }
                }
                oAppFrame.setContent(
                    "<iframe class='samanvayIframe' src='" + sUrl + "'></iframe>"
                );
            }

            oNavContainer.to(this.byId("appPage"));
        },

        _resolveAppTitle: function (sKey) {
            var oModel = this.getView().getModel();
            var aAll = (oModel.getProperty("/adminApps") || []).concat(oModel.getProperty("/memberApps") || []);
            for (var i = 0; i < aAll.length; i++) {
                if (aAll[i].key === sKey) {
                    return aAll[i].title;
                }
            }
            var s = sKey.replace(/#member-/, "").replace(/admin\/|\/.*/g, "").replace(/-/g, " ");
            return s.charAt(0).toUpperCase() + s.slice(1);
        },

        _onPostMessage: function (oEvent) {
            if (oEvent.data === "app-back") {
                this.onHomePress();
            }
        },

        onExit: function () {
            window.removeEventListener("message", this._fnPostMessage);
            document.removeEventListener("click", this._fnCardClick);
        }
    });
});
