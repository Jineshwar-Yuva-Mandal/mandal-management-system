sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/member/memberdirectory/test/integration/FirstJourney',
		'com/samanvay/member/memberdirectory/test/integration/pages/MemberDirectoryList',
		'com/samanvay/member/memberdirectory/test/integration/pages/MemberDirectoryObjectPage'
    ],
    function(JourneyRunner, opaJourney, MemberDirectoryList, MemberDirectoryObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/member/memberdirectory') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMemberDirectoryList: MemberDirectoryList,
					onTheMemberDirectoryObjectPage: MemberDirectoryObjectPage
                }
            },
            opaJourney.run
        );
    }
);