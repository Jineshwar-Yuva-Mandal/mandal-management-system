sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.samanvay.admin.courses',
            componentId: 'MandalCoursesObjectPage',
            contextPath: '/MandalCourses'
        },
        CustomPageDefinitions
    );
});