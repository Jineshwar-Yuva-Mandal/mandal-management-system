sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/member/ledger/test/integration/FirstJourney',
		'com/samanvay/member/ledger/test/integration/pages/LedgerList',
		'com/samanvay/member/ledger/test/integration/pages/LedgerObjectPage'
    ],
    function(JourneyRunner, opaJourney, LedgerList, LedgerObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/member/ledger') + '/index.html'
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