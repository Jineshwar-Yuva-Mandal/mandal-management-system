sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/admin/positions/test/integration/FirstJourney',
		'com/samanvay/admin/positions/test/integration/pages/MandalPositionsList',
		'com/samanvay/admin/positions/test/integration/pages/MandalPositionsObjectPage'
    ],
    function(JourneyRunner, opaJourney, MandalPositionsList, MandalPositionsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/admin/positions') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMandalPositionsList: MandalPositionsList,
					onTheMandalPositionsObjectPage: MandalPositionsObjectPage
                }
            },
            opaJourney.run
        );
    }
);