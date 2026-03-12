sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.samanvay.admin.members',
            componentId: 'MembersList',
            contextPath: '/Members'
        },
        CustomPageDefinitions
    );
});