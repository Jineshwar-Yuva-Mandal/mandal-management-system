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
            { $Type: 'UI.DataField', Value: recorded_by.full_name, Label: 'Recorded By' },
            { $Type: 'UI.DataField', Value: recorded_at,       Label: 'Recorded At' },
            { $Type: 'UI.DataField', Value: remarks,           Label: 'Remarks' },
        ]
    },

    // ─── Action buttons on Object Page header ───
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'AdminService.markFinePaid',
            Label : 'Mark as Paid',
            Criticality : #Positive,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'AdminService.waiveFine',
            Label : 'Waive Fine',
            Criticality : #Negative,
        },
    ],
);

// ─── Action parameter labels ───
annotate service.MemberFines actions {
    markFinePaid(
        payment_mode @Common.Label: 'Payment Mode',
        payment_reference @Common.Label: 'Transaction Reference',
        remarks @UI.MultiLineText @Common.Label: 'Remarks'
    );
    waiveFine(
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