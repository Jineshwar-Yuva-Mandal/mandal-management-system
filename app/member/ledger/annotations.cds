using MemberService as service from '../../../srv/services/member-service';

// ═══════════════════════════════════════════════════
// Ledger — Read-only financial records list
// ═══════════════════════════════════════════════════
annotate service.Ledger with @(
    UI.HeaderInfo : {
        TypeName       : 'Ledger Entry',
        TypeNamePlural : 'Ledger Entries',
        Title          : { $Type: 'UI.DataField', Value: description },
        Description    : { $Type: 'UI.DataField', Value: type },
    },

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
            Value : amount,
            Label : 'Amount',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : direction,
            Label : 'Direction',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : status,
            Label : 'Status',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : balance_after,
            Label : 'Balance',
            @UI.Importance : #Medium,
        },
    ],

    UI.SelectionFields : [
        type,
        direction,
        status,
        entry_date,
    ],

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
            { $Type: 'UI.DataField', Value: entry_date,           Label: 'Date' },
            { $Type: 'UI.DataField', Value: type,                  Label: 'Type' },
            { $Type: 'UI.DataField', Value: description,           Label: 'Description' },
            { $Type: 'UI.DataField', Value: amount,                Label: 'Amount' },
            { $Type: 'UI.DataField', Value: direction,             Label: 'Direction' },
            { $Type: 'UI.DataField', Value: status,                Label: 'Status' },
            { $Type: 'UI.DataField', Value: balance_after,         Label: 'Balance After' },
            { $Type: 'UI.DataField', Value: related_user.full_name, Label: 'Related Member' },
            { $Type: 'UI.DataField', Value: remarks,               Label: 'Remarks' },
        ],
    },

    UI.FieldGroup #Verification : {
        Data : [
            { $Type: 'UI.DataField', Value: recorded_by.full_name, Label: 'Recorded By' },
            { $Type: 'UI.DataField', Value: verified_by.full_name, Label: 'Verified By' },
            { $Type: 'UI.DataField', Value: verified_at,            Label: 'Verified At' },
        ],
    },
);