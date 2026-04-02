using AdminService as service from '../../../srv/services/admin-service';

// ── Virtual fields for status display ──
extend projection service.MemberFines with {
    virtual null as statusCriticality : Integer,
    virtual null as statusText        : String
};

// ═══════════════════════════════════════════════════
// MemberFines — List Report + Object Page
// ═══════════════════════════════════════════════════
annotate service.MemberFines with @(
    UI.HeaderInfo : {
        TypeName       : 'Fine',
        TypeNamePlural : 'Fines',
        Title          : { $Type: 'UI.DataField', Value: user.full_name },
        Description    : { $Type: 'UI.DataField', Value: event.title },
    },

    // ─── List Report ───
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : user.full_name,
            Label : 'Member',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : event.title,
            Label : 'Event',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : amount,
            Label : 'Fine Amount',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : status,
            Criticality : statusCriticality,
            Label : 'Status',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : due_date,
            Label : 'Due Date',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : paid_amount,
            Label : 'Paid',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : payment_mode,
            Label : 'Payment Mode',
            @UI.Importance : #Low,
        },
    ],

    UI.SelectionFields : [
        status,
    ],

    // ─── Header Facets ───
    UI.HeaderFacets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#StatusHeader',
            Label  : 'Status',
        },
    ],

    UI.FieldGroup #StatusHeader : {
        Data : [
            { $Type: 'UI.DataField', Value: status,  Criticality: statusCriticality, Label: 'Status' },
            { $Type: 'UI.DataField', Value: amount,  Label: 'Fine Amount' },
            { $Type: 'UI.DataField', Value: due_date, Label: 'Due Date' },
        ]
    },

    // ─── Object Page Sections ───
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'FineDetailsFacet',
            Target : '@UI.FieldGroup#FineDetails',
            Label  : 'Fine Details',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'PaymentFacet',
            Target : '@UI.FieldGroup#PaymentDetails',
            Label  : 'Payment Details',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'VerificationFacet',
            Target : '@UI.FieldGroup#VerificationDetails',
            Label  : 'Verification',
        },
    ],

    UI.FieldGroup #FineDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: user.full_name, Label: 'Member' },
            { $Type: 'UI.DataField', Value: user.phone,     Label: 'Phone' },
            { $Type: 'UI.DataField', Value: event.title,    Label: 'Event' },
            { $Type: 'UI.DataField', Value: event.event_date, Label: 'Event Date' },
            { $Type: 'UI.DataField', Value: amount,          Label: 'Fine Amount (₹)' },
            { $Type: 'UI.DataField', Value: due_date,        Label: 'Due Date' },
        ]
    },

    UI.FieldGroup #PaymentDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: paid_amount,       Label: 'Paid Amount (₹)' },
            { $Type: 'UI.DataField', Value: paid_date,         Label: 'Payment Date' },
            { $Type: 'UI.DataField', Value: payment_mode,      Label: 'Payment Mode' },
            { $Type: 'UI.DataField', Value: payment_reference, Label: 'Transaction Reference' },
        ]
    },

    UI.FieldGroup #VerificationDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: verified_by.full_name, Label: 'Verified By' },
            { $Type: 'UI.DataField', Value: verified_at,           Label: 'Verified At' },
            { $Type: 'UI.DataField', Value: verification_remarks,  Label: 'Remarks' },
            { $Type: 'UI.DataField', Value: ledger_entry_ID,       Label: 'Ledger Entry' },
        ]
    },

    // ─── Action buttons on Object Page header ───
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'AdminService.approveFine',
            Label : 'Verify Payment',
            Criticality : #Positive,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'AdminService.rejectFine',
            Label : 'Reject Payment',
            Criticality : #Negative,
        },
    ],
);

// ─── Action parameter labels ───
annotate service.MemberFines actions {
    approveFine(
        remarks @UI.MultiLineText @Common.Label: 'Remarks'
    );
    rejectFine(
        remarks @UI.MultiLineText @Common.Label: 'Remarks'
    );
};

// ─── Fines are auto-created, read-only entity ───
annotate service.MemberFines with @(
    Capabilities.InsertRestrictions: { Insertable: false },
    Capabilities.DeleteRestrictions: { Deletable: false },
    Capabilities.UpdateRestrictions: { Updatable: false },
);

// ─── Hide virtual/internal fields ───
annotate service.MemberFines with {
    statusCriticality @UI.Hidden;
    statusText        @UI.Hidden;
};