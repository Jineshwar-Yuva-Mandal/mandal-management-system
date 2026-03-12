sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/admin/mandal/test/integration/FirstJourney',
		'com/samanvay/admin/mandal/test/integration/pages/MandalList',
		'com/samanvay/admin/mandal/test/integration/pages/MandalObjectPage'
    ],
    function(JourneyRunner, opaJourney, MandalList, MandalObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/admin/mandal') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMandalList: MandalList,
					onTheMandalObjectPage: MandalObjectPage
                }
            },
            opaJourney.run
        );
    }
);