sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/samanvay/admin/members/test/integration/FirstJourney',
		'com/samanvay/admin/members/test/integration/pages/MembersList',
		'com/samanvay/admin/members/test/integration/pages/MembersObjectPage'
    ],
    function(JourneyRunner, opaJourney, MembersList, MembersObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/samanvay/admin/members') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMembersList: MembersList,
					onTheMembersObjectPage: MembersObjectPage
                }
            },
            opaJourney.run
        );
    }
);