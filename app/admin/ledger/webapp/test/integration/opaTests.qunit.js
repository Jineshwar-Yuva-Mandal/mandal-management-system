sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/admin/ledger/test/integration/FirstJourney',
		'com/samanvay/admin/ledger/test/integration/pages/LedgerList',
		'com/samanvay/admin/ledger/test/integration/pages/LedgerObjectPage'
    ],
    function(JourneyRunner, opaJourney, LedgerList, LedgerObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/admin/ledger') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheLedgerList: LedgerList,
					onTheLedgerObjectPage: LedgerObjectPage
                }
            },
            opaJourney.run
        );
    }
);