sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/member/courseassignments/test/integration/FirstJourney',
		'com/samanvay/member/courseassignments/test/integration/pages/MyCourseAssignmentsList',
		'com/samanvay/member/courseassignments/test/integration/pages/MyCourseAssignmentsObjectPage'
    ],
    function(JourneyRunner, opaJourney, MyCourseAssignmentsList, MyCourseAssignmentsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/member/courseassignments') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMyCourseAssignmentsList: MyCourseAssignmentsList,
					onTheMyCourseAssignmentsObjectPage: MyCourseAssignmentsObjectPage
                }
            },
            opaJourney.run
        );
    }
);