using AdminService as service from '../../../srv/services/admin-service';

// ══════════════════════════════════════════════════════
// MandalPositions — List Report + Object Page
// ══════════════════════════════════════════════════════

annotate service.MandalPositions with @(
    UI.HeaderInfo : {
        TypeName       : '{i18n>Position}',
        TypeNamePlural : '{i18n>Positions}',
        Title          : { $Type: 'UI.DataField', Value: name },
        Description    : { $Type: 'UI.DataField', Value: description },
    },

    UI.LineItem : [
        { $Type: 'UI.DataField', Value: name,        Label: '{i18n>PositionName}',  @UI.Importance: #High },
        { $Type: 'UI.DataField', Value: description,  Label: '{i18n>Description}',   @UI.Importance: #Medium },
    ],

    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'PositionDetailsFacet',
            Target : '@UI.FieldGroup#PositionDetails',
            Label  : '{i18n>PositionDetails}',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'AssignedMembersFacet',
            Target : 'members/@UI.LineItem#AssignedMembers',
            Label  : '{i18n>AssignedMembers}',
        },
    ],

    UI.FieldGroup #PositionDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: name,        Label: '{i18n>PositionName}' },
            { $Type: 'UI.DataField', Value: description,  Label: '{i18n>Description}' },
        ]
    },
);

// ── Position Member Assignments (inline table on Object Page) ──
annotate service.PositionAssignments with @(
    UI.LineItem #AssignedMembers : [
        { $Type: 'UI.DataField', Value: user.full_name,    Label: '{i18n>MemberName}',   @UI.Importance: #High },
        { $Type: 'UI.DataField', Value: user.email,        Label: '{i18n>Email}',        @UI.Importance: #Medium },
        { $Type: 'UI.DataField', Value: user.phone,        Label: '{i18n>Phone}',        @UI.Importance: #Medium },
        { $Type: 'UI.DataField', Value: valid_from,        Label: '{i18n>ValidFrom}',    @UI.Importance: #Medium },
        { $Type: 'UI.DataField', Value: valid_to,          Label: '{i18n>ValidTo}',      @UI.Importance: #Low },
    ],
);

annotate service.PositionAssignments with {
    user @(
        Common.Label : '{i18n>Member}',
        Common.Text  : user.full_name,
        Common.TextArrangement : #TextOnly,
        Common.ValueListWithFixedValues : false,
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Members',
            Parameters : [
                { $Type: 'Common.ValueListParameterInOut',  LocalDataProperty: user_ID,       ValueListProperty: 'ID' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'full_name' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'email' },
            ],
        },
    );
};