sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/admin/courses/test/integration/FirstJourney',
		'com/samanvay/admin/courses/test/integration/pages/MandalCoursesList',
		'com/samanvay/admin/courses/test/integration/pages/MandalCoursesObjectPage'
    ],
    function(JourneyRunner, opaJourney, MandalCoursesList, MandalCoursesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/admin/courses') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMandalCoursesList: MandalCoursesList,
					onTheMandalCoursesObjectPage: MandalCoursesObjectPage
                }
            },
            opaJourney.run
        );
    }
);