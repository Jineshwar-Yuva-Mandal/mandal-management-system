sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
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
                profile: {
                    name: "Admin User",
                    initials: "A",
                    role: "Administrator"
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

            this._loadAdminApps(oModel);
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
                        // Read the first crossNavigation inbound
                        var oInbounds = (oManifest["sap.app"].crossNavigation || {}).inbounds || {};
                        var oInbound = oInbounds[Object.keys(oInbounds)[0]] || {};
                        var sTitle = oInbound.title || oManifest["sap.app"].title || "";
                        var sSubTitle = oInbound.subTitle || "";
                        var sIcon = oInbound.icon || "";

                        return {
                            manifestPath: sPath,
                            title: sTitle,
                            subTitle: sSubTitle,
                            icon: sIcon
                        };
                    })
                    .then(function (oData) {
                        // If title/subTitle contain {{key}}, resolve from i18n
                        var bNeedsI18n = /\{\{/.test(oData.title) || /\{\{/.test(oData.subTitle);
                        if (!bNeedsI18n) {
                            return oData;
                        }
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
        }
    });
});
