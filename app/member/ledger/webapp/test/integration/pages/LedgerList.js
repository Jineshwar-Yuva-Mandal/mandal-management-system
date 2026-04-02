sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.samanvay.member.ledger',
            componentId: 'LedgerList',
            contextPath: '/Ledger'
        },
        CustomPageDefinitions
    );
});