sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/member/myprofile/test/integration/FirstJourney',
		'com/samanvay/member/myprofile/test/integration/pages/MyProfileList',
		'com/samanvay/member/myprofile/test/integration/pages/MyProfileObjectPage'
    ],
    function(JourneyRunner, opaJourney, MyProfileList, MyProfileObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/member/myprofile') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMyProfileList: MyProfileList,
					onTheMyProfileObjectPage: MyProfileObjectPage
                }
            },
            opaJourney.run
        );
    }
);