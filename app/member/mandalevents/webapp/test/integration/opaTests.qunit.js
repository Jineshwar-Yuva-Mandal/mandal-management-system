sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/member/mandalevents/test/integration/FirstJourney',
		'com/samanvay/member/mandalevents/test/integration/pages/MandalEventsList',
		'com/samanvay/member/mandalevents/test/integration/pages/MandalEventsObjectPage'
    ],
    function(JourneyRunner, opaJourney, MandalEventsList, MandalEventsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/member/mandalevents') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMandalEventsList: MandalEventsList,
					onTheMandalEventsObjectPage: MandalEventsObjectPage
                }
            },
            opaJourney.run
        );
    }
);