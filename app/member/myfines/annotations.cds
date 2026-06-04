using MemberService as service from '../../../srv/services/member-service';

// ═══════════════════════════════════════════════════
// My Fines — Read-only list + detail
// ═══════════════════════════════════════════════════
annotate service.MyFines with @(
    Capabilities.DeleteRestrictions : { Deletable: false },
    Capabilities.UpdateRestrictions : { Updatable: false },
    Capabilities.InsertRestrictions : { Insertable: false },
    UI.HeaderInfo : {
        TypeName       : 'Fine',
        TypeNamePlural : 'Fines',
        Title          : { $Type: 'UI.DataField', Value: event.title },
        Description    : { $Type: 'UI.DataField', Value: status },
    },

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : event.title,
            Label : 'Event',
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
            Value : status,
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
            Value : paid_date,
            Label : 'Paid Date',
            @UI.Importance : #Medium,
        },
    ],

    UI.SelectionFields : [
        status,
    ],

    UI.HeaderFacets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.DataPoint#FineAmount',
            Label  : 'Amount',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.DataPoint#FineStatus',
            Label  : 'Status',
        },
    ],

    UI.DataPoint #FineAmount : {
        Value : amount,
        Title : 'Fine Amount',
    },

    UI.DataPoint #FineStatus : {
        Value : status,
        Title : 'Status',
    },

    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'FineDetailsFacet',
            Target : '@UI.FieldGroup#FineDetails',
            Label  : 'Fine Details',
        },
    ],

    UI.FieldGroup #FineDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: event.title,     Label: 'Event' },
            { $Type: 'UI.DataField', Value: amount,           Label: 'Fine Amount' },
            { $Type: 'UI.DataField', Value: status,           Label: 'Status' },
            { $Type: 'UI.DataField', Value: due_date,         Label: 'Due Date' },
            { $Type: 'UI.DataField', Value: paid_date,        Label: 'Paid Date' },
        ],
    },
);