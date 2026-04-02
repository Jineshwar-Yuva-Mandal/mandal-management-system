sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.samanvay.member.myfines',
            componentId: 'MyFinesObjectPage',
            contextPath: '/MyFines'
        },
        CustomPageDefinitions
    );
});