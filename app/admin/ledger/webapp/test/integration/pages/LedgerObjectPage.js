sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.samanvay.admin.ledger',
            componentId: 'LedgerObjectPage',
            contextPath: '/Ledger'
        },
        CustomPageDefinitions
    );
});