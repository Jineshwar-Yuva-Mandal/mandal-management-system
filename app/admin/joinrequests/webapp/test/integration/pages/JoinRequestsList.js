sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.samanvay.admin.joinrequests',
            componentId: 'JoinRequestsList',
            contextPath: '/JoinRequests'
        },
        CustomPageDefinitions
    );
});