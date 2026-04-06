using MemberService as service from '../../../srv/services/member-service';

// ═══════════════════════════════════════════════════
// My Fines — Read-only list + detail
// ═══════════════════════════════════════════════════
annotate service.MyFines with @(
    Capabilities.DeleteRestrictions : { Deletable: false },
    Capabilities.UpdateRestrictions : { Updatable: false },
    UI.HeaderInfo : {
        TypeName       : 'Fine',
        TypeNamePlural : 'Fines',
        Title          : { $Type: 'UI.DataField', Value: event.title },
        Description    : { $Type: 'UI.DataField', Value: status },
    },

    UI.Identification : [
        {
            $Type  : 'UI.DataFieldForAction',
            Action : 'MemberService.payFine',
            Label  : 'Pay Fine',
            Inline : false,
        },
    ],

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
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#PaymentQR',
            Label  : 'Scan to Pay',
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
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'PaymentDetailsFacet',
            Target : '@UI.FieldGroup#PaymentDetails',
            Label  : 'Payment Details',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'VerificationFacet',
            Target : '@UI.FieldGroup#Verification',
            Label  : 'Verification',
        },
    ],

    UI.FieldGroup #PaymentQR : {
        Data : [
            {
                $Type : 'UI.DataField',
                Value : payment_qr_url,
                Label : 'Scan to Pay',
            },
        ],
    },

    UI.FieldGroup #FineDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: event.title,     Label: 'Event' },
            { $Type: 'UI.DataField', Value: amount,           Label: 'Fine Amount' },
            { $Type: 'UI.DataField', Value: status,           Label: 'Status' },
            { $Type: 'UI.DataField', Value: due_date,         Label: 'Due Date' },
        ],
    },

    UI.FieldGroup #PaymentDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: paid_amount,        Label: 'Paid Amount' },
            { $Type: 'UI.DataField', Value: paid_date,           Label: 'Paid Date' },
            { $Type: 'UI.DataField', Value: payment_mode,        Label: 'Payment Mode' },
            { $Type: 'UI.DataField', Value: payment_reference,   Label: 'Payment Reference' },
        ],
    },

    UI.FieldGroup #Verification : {
        Data : [
            { $Type: 'UI.DataField', Value: verified_by.full_name, Label: 'Verified By' },
            { $Type: 'UI.DataField', Value: verified_at,            Label: 'Verified At' },
            { $Type: 'UI.DataField', Value: verification_remarks,   Label: 'Remarks' },
        ],
    },
);

// ─── Hide internal fields / image annotation ───
annotate service.MyFines with {
    payment_qr_url @UI.Hidden @UI.IsImageURL;
};

// ─── Side effects: refresh fine details after payment ───
annotate service.MyFines with actions {
    payFine @(
        Common.SideEffects : {
            TargetProperties : ['status', 'paid_amount', 'paid_date', 'payment_mode', 'payment_reference'],
        }
    );
};