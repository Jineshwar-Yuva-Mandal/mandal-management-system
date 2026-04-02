using AdminService as service from '../../../srv/services/admin-service';

// ══════════════════════════════════════════════════════
// AppGrants — App Access Management
// ══════════════════════════════════════════════════════

annotate service.AppGrants with @(
    UI.HeaderInfo : {
        TypeName       : '{i18n>AppAccess}',
        TypeNamePlural : '{i18n>AppAccessGrants}',
        Title          : { $Type: 'UI.DataField', Value: user.full_name },
        Description    : { $Type: 'UI.DataField', Value: app_key },
    },

    UI.LineItem : [
        { $Type: 'UI.DataField', Value: user.full_name,  Label: '{i18n>MemberName}',   @UI.Importance: #High },
        { $Type: 'UI.DataField', Value: user.email,      Label: '{i18n>Email}',        @UI.Importance: #Medium },
        { $Type: 'UI.DataField', Value: app_key,         Label: '{i18n>AppName}',      @UI.Importance: #High },
    ],

    UI.SelectionFields : [ user_ID, app_key ],

    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'GrantDetailsFacet',
            Target : '@UI.FieldGroup#GrantDetails',
            Label  : '{i18n>GrantDetails}',
        },
    ],

    UI.FieldGroup #GrantDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: user_ID,   Label: '{i18n>Member}' },
            { $Type: 'UI.DataField', Value: app_key,    Label: '{i18n>AppName}' },
        ]
    },
);

annotate service.AppGrants with {
    user @(
        Common.Label : '{i18n>Member}',
        Common.Text  : user.full_name,
        Common.TextArrangement : #TextOnly,
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
    app_key @(
        Common.Label : '{i18n>AppName}',
        Common.ValueListWithFixedValues : true,
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'AvailableApps',
            Parameters : [
                { $Type: 'Common.ValueListParameterInOut',  LocalDataProperty: app_key, ValueListProperty: 'key' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'label' },
            ],
        },
    );
};
