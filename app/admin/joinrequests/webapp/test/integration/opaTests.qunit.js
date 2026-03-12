sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/admin/joinrequests/test/integration/FirstJourney',
		'com/samanvay/admin/joinrequests/test/integration/pages/JoinRequestsList',
		'com/samanvay/admin/joinrequests/test/integration/pages/JoinRequestsObjectPage'
    ],
    function(JourneyRunner, opaJourney, JoinRequestsList, JoinRequestsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/admin/joinrequests') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheJoinRequestsList: JoinRequestsList,
					onTheJoinRequestsObjectPage: JoinRequestsObjectPage
                }
            },
            opaJourney.run
        );
    }
);