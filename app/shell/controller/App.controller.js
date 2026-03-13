sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
], function (Controller, Fragment) {
    "use strict";

    return Controller.extend("com.samanvay.shell.controller.App", {

        onInit: function () {
            this._fnPostMessage = this._onPostMessage.bind(this);
            window.addEventListener("message", this._fnPostMessage);

            // Event delegation for card clicks
            this._fnCardClick = this._onCardClick.bind(this);
            document.addEventListener("click", this._fnCardClick);
        },

        _onCardClick: function (oEvent) {
            // Walk up from click target to find a .samanvayCard element
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

        /* ── Header actions ── */

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
            // Extend with real logic as needed
            if (sAction === "signout") {
                // sign-out logic
            }
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
            // Deselect so it doesn't stay highlighted
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
                        } catch (e) {
                            that.onHomePress();
                        }
                    }, 300);
                } catch (e) {
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

            // Resolve title from app registry
            var sTitle = this._resolveAppTitle(sKey);
            oModel.setProperty("/appTitle", sTitle);

            if (sKey.charAt(0) === "#") {
                oAppFrame.setContent(
                    "<div class='samanvayPlaceholder'>" +
                    "<h2>" + sTitle + "</h2>" +
                    "<p>Coming soon</p></div>"
                );
            } else {
                oAppFrame.setContent(
                    "<iframe class='samanvayIframe' src='./" + sKey + "'></iframe>"
                );
            }

            oNavContainer.to(this.byId("appPage"));
        },

        /* ── Listen for back messages from embedded apps ── */

        _resolveAppTitle: function (sKey) {
            var oModel = this.getView().getModel();
            var aAll = (oModel.getProperty("/adminApps") || []).concat(oModel.getProperty("/memberApps") || []);
            for (var i = 0; i < aAll.length; i++) {
                if (aAll[i].key === sKey) {
                    return aAll[i].title;
                }
            }
            // Fallback: derive from key
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
