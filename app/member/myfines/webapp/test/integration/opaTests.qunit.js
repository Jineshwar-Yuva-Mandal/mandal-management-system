sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/member/myfines/test/integration/FirstJourney',
		'com/samanvay/member/myfines/test/integration/pages/MyFinesList',
		'com/samanvay/member/myfines/test/integration/pages/MyFinesObjectPage'
    ],
    function(JourneyRunner, opaJourney, MyFinesList, MyFinesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/member/myfines') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMyFinesList: MyFinesList,
					onTheMyFinesObjectPage: MyFinesObjectPage
                }
            },
            opaJourney.run
        );
    }
);