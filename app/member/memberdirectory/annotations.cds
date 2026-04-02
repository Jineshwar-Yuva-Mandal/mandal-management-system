using MemberService as service from '../../../srv/services/member-service';

// ═══════════════════════════════════════════════════
// Member Directory — Read-only list (no object page)
// ═══════════════════════════════════════════════════
annotate service.MemberDirectory with @(
    UI.HeaderInfo : {
        TypeName       : 'Member',
        TypeNamePlural : 'Members',
        Title          : { $Type: 'UI.DataField', Value: full_name },
    },

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : profile_picture,
            Label : ' ',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : full_name,
            Label : 'Name',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : email,
            Label : 'Email',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : phone,
            Label : 'Phone',
            @UI.Importance : #High,
        },
    ],

    UI.SelectionFields : [
        full_name,
    ],
);

// ─── Hide helper fields ───
annotate service.MemberDirectory with {
    profile_picture_type @UI.Hidden;
    profile_picture_name @UI.Hidden;
};