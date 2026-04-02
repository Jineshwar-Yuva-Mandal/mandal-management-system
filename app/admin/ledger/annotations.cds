using AdminService as service from '../../../srv/services/admin-service';

// ── Virtual fields for display ──
extend projection service.Ledger with {
    virtual null as statusCriticality  : Integer,
    virtual null as directionCriticality : Integer
};

// ═══════════════════════════════════════════════════
// Ledger — List Report + Object Page
// ═══════════════════════════════════════════════════
annotate service.Ledger with @(
    UI.HeaderInfo : {
        TypeName       : 'Ledger Entry',
        TypeNamePlural : 'Ledger Entries',
        Title          : { $Type: 'UI.DataField', Value: description },
        Description    : { $Type: 'UI.DataField', Value: type },
    },

    UI.PresentationVariant : {
        SortOrder : [
            { Property : entry_date, Descending : true },
        ],
        Visualizations : ['@UI.LineItem'],
    },

    // ─── List Report ───
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : entry_date,
            Label : 'Date',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : type,
            Label : 'Type',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : description,
            Label : 'Description',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : direction,
            Criticality : directionCriticality,
            Label : 'Direction',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : amount,
            Label : 'Amount (₹)',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : related_user.full_name,
            Label : 'Related Member',
            @UI.Importance : #Medium,
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
            Value : balance_after,
            Label : '{i18n>Balance}',
            @UI.Importance : #High,
        },
    ],

    UI.SelectionFields : [
        type,
        direction,
        status,
        entry_date,
    ],

    // ─── Header Facets ───
    UI.HeaderFacets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#LedgerHeader',
            Label  : 'Entry Summary',
        },
    ],

    UI.FieldGroup #LedgerHeader : {
        Data : [
            { $Type: 'UI.DataField', Value: direction,  Criticality: directionCriticality, Label: 'Direction' },
            { $Type: 'UI.DataField', Value: amount,     Label: 'Amount (₹)' },
            { $Type: 'UI.DataField', Value: status,     Criticality: statusCriticality, Label: 'Status' },
        ]
    },

    // ─── Object Page Sections ───
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'EntryDetailsFacet',
            Target : '@UI.FieldGroup#EntryDetails',
            Label  : 'Entry Details',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'VerificationFacet',
            Target : '@UI.FieldGroup#Verification',
            Label  : 'Verification',
        },
    ],

    UI.FieldGroup #EntryDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: entry_date,            Label: 'Entry Date' },
            { $Type: 'UI.DataField', Value: type,                  Label: 'Entry Type' },
            { $Type: 'UI.DataField', Value: description,           Label: 'Description' },
            { $Type: 'UI.DataField', Value: direction,             Label: 'Direction' },
            { $Type: 'UI.DataField', Value: amount,                Label: 'Amount (₹)' },
            { $Type: 'UI.DataField', Value: related_user.full_name, Label: 'Related Member' },
            { $Type: 'UI.DataField', Value: recorded_by.full_name, Label: 'Recorded By' },
            { $Type: 'UI.DataField', Value: remarks,               Label: 'Remarks' },
        ]
    },

    UI.FieldGroup #Verification : {
        Data : [
            { $Type: 'UI.DataField', Value: status,                     Criticality: statusCriticality, Label: 'Status' },
            { $Type: 'UI.DataField', Value: verified_by.full_name,      Label: 'Verified By' },
            { $Type: 'UI.DataField', Value: verified_at,                Label: 'Verified At' },
        ]
    },

    // ─── Verify action on Object Page header ───
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'AdminService.verifyEntry',
            Label : 'Verify Entry',
            Criticality : #Positive,
        },
    ],
);

// ─── Action parameter labels ───
annotate service.Ledger actions {
    verifyEntry(
        remarks @UI.MultiLineText @Common.Label: 'Verification Remarks'
    );
};

// ─── Hide virtual fields ───
annotate service.Ledger with {
    statusCriticality    @UI.Hidden;
    directionCriticality @UI.Hidden;
};
annotate service.Ledger with {
    balance_after @Measures.ISOCurrency : '₹'
};

