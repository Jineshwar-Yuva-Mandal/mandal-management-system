using AdminService as service from '../../../srv/services/admin-service';

// ═══════════════════════════════════════════════════════
// Mandal Settings — List Report (admin sees only their mandal)
// ═══════════════════════════════════════════════════════

annotate service.Mandal with @(
  UI.HeaderInfo: {
    TypeName      : 'Mandal',
    TypeNamePlural: 'Mandals',
    Title         : { $Type: 'UI.DataField', Value: name },
    Description   : { $Type: 'UI.DataField', Value: city }
  },
  UI.SelectionFields: [ name ],
  UI.LineItem: [
    { $Type: 'UI.DataField', Value: name, Label: 'Mandal Name' },
    { $Type: 'UI.DataField', Value: area, Label: 'Area' },
    { $Type: 'UI.DataField', Value: city, Label: 'City' },
    { $Type: 'UI.DataField', Value: state, Label: 'State' },
    { $Type: 'UI.DataField', Value: has_joining_fee, Label: 'Joining Fee?' },
    { $Type: 'UI.DataField', Value: joining_fee, Label: 'Fee Amount' }
  ],
    UI.DataPoint #currentAdhyakshName : {
        $Type : 'UI.DataPointType',
        Value : currentAdhyakshName,
        Title : '{i18n>Adhyaksh}',
    },
    UI.DataPoint #currentMantriName : {
        $Type : 'UI.DataPointType',
        Value : currentMantriName,
        Title : '{i18n>Mantri}',
    },
);

// ═══════════════════════════════════════════════════════
// Mandal Settings — Object Page
// ═══════════════════════════════════════════════════════

annotate service.Mandal with @(
  UI.HeaderFacets: [
    {
        $Type : 'UI.ReferenceFacet',
        ID : 'currentAdhyakshName',
        Target : '@UI.DataPoint#currentAdhyakshName',
    },
    {
        $Type : 'UI.ReferenceFacet',
        ID : 'currentMantriName',
        Target : '@UI.DataPoint#currentMantriName',
    },
  ],
  UI.Identification: [
    {
      $Type : 'UI.DataFieldForAction',
      Action : 'AdminService.changeAdhyaksh',
      Label : 'Change Adhyaksh',
      Criticality : #Negative,
    },
    {
      $Type : 'UI.DataFieldForAction',
      Action : 'AdminService.changeMantri',
      Label : 'Change Mantri',
      Criticality : #Critical,
    }
  ],
  UI.FieldGroup#AdminInfo: {
    Data: [
      { $Type: 'UI.DataField', Value: currentAdhyakshName, Label: 'Current Adhyaksh' },
      { $Type: 'UI.DataField', Value: currentAdhyakshEmail, Label: 'Adhyaksh Email' },
      { $Type: 'UI.DataField', Value: currentMantriName, Label: 'Current Mantri' },
      { $Type: 'UI.DataField', Value: currentMantriEmail, Label: 'Mantri Email' }
    ]
  },
  UI.Facets: [
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'GeneralInfo',
      Label : 'General Information',
      Facets: [
        { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#GeneralDetails', Label: 'Location' }
      ]
    },
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'JoiningFeeConfig',
      Label : 'Joining Fee',
      Facets: [
        { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#JoiningFee', Label: 'Fee Configuration' }
      ]
    }
  ],
  UI.FieldGroup#GeneralDetails: {
    Data: [
      { $Type: 'UI.DataField', Value: name, Label: 'Mandal Name' },
      { $Type: 'UI.DataField', Value: area, Label: 'Area / Locality' },
      { $Type: 'UI.DataField', Value: city, Label: 'City' },
      { $Type: 'UI.DataField', Value: state, Label: 'State' },
      { $Type: 'UI.DataField', Value: logo, Label: 'Mandal Logo' }
    ]
  },
  UI.FieldGroup#JoiningFee: {
    Data: [
      { $Type: 'UI.DataField', Value: has_joining_fee, Label: 'Charge Joining Fee?' },
      { $Type: 'UI.DataField', Value: joining_fee, Label: 'Fee Amount (₹)' }
    ]
  }
);

// ─── Hide helper media type fields ───
annotate service.Mandal with {
  logo_type       @UI.Hidden;
  logo_name       @UI.Hidden;
  canChangeAdhyaksh @UI.Hidden;
  canChangeMantri   @UI.Hidden;
};

annotate service.Mandal actions {
  changeAdhyaksh @(
    Common.Label : 'Change Adhyaksh',
    Common.IsActionCritical : true,
    Core.OperationAvailable : canChangeAdhyaksh
  )(
    newAdhyakshUserId @(
      Common.Label : 'New Adhyaksh',
      Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Members',
        Parameters : [
          { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: newAdhyakshUserId, ValueListProperty: 'ID' },
          { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'full_name' },
          { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'email' }
        ]
      }
    )
  );

  changeMantri @(
    Common.Label : 'Change Mantri',
    Common.IsActionCritical : true,
    Core.OperationAvailable : canChangeMantri
  )(
    newMantriUserId @(
      Common.Label : 'New Mantri',
      Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Members',
        Parameters : [
          { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: newMantriUserId, ValueListProperty: 'ID' },
          { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'full_name' },
          { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'email' }
        ]
      }
    )
  );
};