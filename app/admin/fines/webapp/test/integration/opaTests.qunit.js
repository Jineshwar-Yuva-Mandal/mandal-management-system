sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/admin/fines/test/integration/FirstJourney',
		'com/samanvay/admin/fines/test/integration/pages/MemberFinesList',
		'com/samanvay/admin/fines/test/integration/pages/MemberFinesObjectPage'
    ],
    function(JourneyRunner, opaJourney, MemberFinesList, MemberFinesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/admin/fines') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMemberFinesList: MemberFinesList,
					onTheMemberFinesObjectPage: MemberFinesObjectPage
                }
            },
            opaJourney.run
        );
    }
);