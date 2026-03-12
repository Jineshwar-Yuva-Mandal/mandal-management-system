sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.samanvay.admin.positions',
            componentId: 'MandalPositionsList',
            contextPath: '/MandalPositions'
        },
        CustomPageDefinitions
    );
});