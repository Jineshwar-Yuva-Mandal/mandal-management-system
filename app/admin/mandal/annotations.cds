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
  ]
);

// ═══════════════════════════════════════════════════════
// Mandal Settings — Object Page
// ═══════════════════════════════════════════════════════

annotate service.Mandal with @(
  UI.HeaderFacets: [
    { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#AdminInfo', Label: 'Admin' }
  ],
  UI.FieldGroup#AdminInfo: {
    Data: [
      { $Type: 'UI.DataField', Value: admin.full_name, Label: 'Primary Admin' },
      { $Type: 'UI.DataField', Value: admin.email, Label: 'Admin Email' }
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
      Label : 'Joining Fee & Payment',
      Facets: [
        { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#JoiningFee', Label: 'Fee Configuration' },
        { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#PaymentDetails', Label: 'Payment Details' }
      ]
    },
    {
      $Type : 'UI.ReferenceFacet',
      ID    : 'FieldConfigSection',
      Target: 'fieldConfigs/@UI.LineItem#FieldConfig',
      Label : 'Registration Form Fields'
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
  },
  UI.FieldGroup#PaymentDetails: {
    Data: [
      { $Type: 'UI.DataField', Value: payment_upi_id, Label: 'UPI ID' },
      { $Type: 'UI.DataField', Value: payment_qr, Label: 'Payment QR Code' }
    ]
  }
);

// ─── Hide helper media type fields ───
annotate service.Mandal with {
  logo_type       @UI.Hidden;
  logo_name       @UI.Hidden;
  payment_qr_type @UI.Hidden;
  payment_qr_name @UI.Hidden;
};

// ═══════════════════════════════════════════════════════
// MemberFieldConfig — Registration form field configuration
// ═══════════════════════════════════════════════════════

annotate service.MemberFieldConfig with @(
  UI.HeaderInfo: {
    TypeName       : 'Field Configuration',
    TypeNamePlural : 'Field Configurations',
    Title          : { $Type: 'UI.DataField', Value: field_name },
    Description    : { $Type: 'UI.DataField', Value: requirement }
  },
  UI.LineItem#FieldConfig: [
    { $Type: 'UI.DataField', Value: sequence, Label: 'Order' },
    { $Type: 'UI.DataField', Value: field.field_name, Label: 'Field' },
    { $Type: 'UI.DataField', Value: field.label, Label: 'Default Label' },
    { $Type: 'UI.DataField', Value: custom_label, Label: 'Custom Label' },
    { $Type: 'UI.DataField', Value: requirement, Label: 'Requirement', Criticality: requirementCriticality }
  ],
  UI.Facets: [
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'FieldConfigDetails',
      Label : 'Field Details',
      Facets: [
        { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#FieldConfigMain', Label: 'Configuration' }
      ]
    }
  ],
  UI.FieldGroup#FieldConfigMain: {
    Data: [
      { $Type: 'UI.DataField', Value: field_ID, Label: 'Field' },
      { $Type: 'UI.DataField', Value: field_name, Label: 'Field Name' },
      { $Type: 'UI.DataField', Value: custom_label, Label: 'Custom Label (override)' },
      { $Type: 'UI.DataField', Value: requirement, Label: 'Requirement' },
      { $Type: 'UI.DataField', Value: sequence, Label: 'Display Order' }
    ]
  }
);

// ─── ValueHelp: link field_ID to ProtectedFieldList (User fields only) ───
annotate service.MemberFieldConfig with {
  field @(
    Common.Text: field.label,
    Common.TextArrangement: #TextOnly,
    Common.ValueList: {
      Label         : 'User Fields',
      CollectionPath: 'ProtectedFieldList',
      Parameters    : [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: field_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'field_name' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'label' }
      ]
    }
  );
  requirement @(
    Common.Text: requirement,
    Common.TextArrangement: #TextOnly
  );
};