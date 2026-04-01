using AdminService as service from '../../../srv/services/admin-service';

// Add virtual fields for human-readable status text and criticality
extend projection service.JoinRequests with {
    virtual null as statusText        : String,
    virtual null as statusCriticality  : Integer
};

annotate service.JoinRequests with @(
    UI.HeaderInfo : {
        TypeName       : 'Membership Request',
        TypeNamePlural : 'Membership Requests',
        Title          : { $Type: 'UI.DataField', Value: requester_name },
        Description    : { $Type: 'UI.DataField', Value: requester_email },
    },

    // ─── List Report ───
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : requester_name,
            Label : '{i18n>RequesterName}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : requester_email,
            Label : '{i18n>Email}',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : requester_phone,
            Label : '{i18n>Phone}',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : status,
            Criticality : statusCriticality,
            Label : '{i18n>Status}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : paid_amount,
            Label : '{i18n>PaidAmount}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : payment_verified,
            Label : '{i18n>PaymentVerified}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : createdAt,
            Label : '{i18n>RequestDate}',
            @UI.Importance : #Medium,
        },
    ],

    UI.SelectionFields : [
        status,
    ],

    // ─── Header Facets (key info at the top of Object Page) ───
    UI.HeaderFacets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#StatusInfo',
            Label  : '{i18n>Status}',
        },
    ],

    UI.FieldGroup #StatusInfo : {
        Data : [
            { $Type: 'UI.DataField', Value: status, Criticality: statusCriticality, Label: '{i18n>Status}' },
            { $Type: 'UI.DataField', Value: createdAt, Label: '{i18n>RequestDate}' },
        ]
    },

    // ─── Object Page Sections ───
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'RequesterInfoFacet',
            Target : '@UI.FieldGroup#RequesterInfo',
            Label  : '{i18n>RequesterInfo}',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'PaymentDetailsFacet',
            Target : '@UI.FieldGroup#PaymentDetails',
            Label  : '{i18n>PaymentDetails}',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'ApprovalsFacet',
            Target : 'approvals/@UI.LineItem#Approvals',
            Label  : '{i18n>ApprovalHistory}',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'RemarksFacet',
            Target : '@UI.FieldGroup#Remarks',
            Label  : '{i18n>Remarks}',
        },
    ],

    UI.FieldGroup #RequesterInfo : {
        Data : [
            { $Type: 'UI.DataField', Value: requester_name,  Label: '{i18n>RequesterName}' },
            { $Type: 'UI.DataField', Value: requester_email, Label: '{i18n>Email}' },
            { $Type: 'UI.DataField', Value: requester_phone, Label: '{i18n>Phone}' },
            { $Type: 'UI.DataField', Value: user.full_name,  Label: '{i18n>LinkedUser}' },
        ]
    },

    UI.FieldGroup #PaymentDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: fee_amount,       Label: '{i18n>FeeAmount}' },
            { $Type: 'UI.DataField', Value: paid_amount,       Label: '{i18n>PaidAmount}' },
            { $Type: 'UI.DataField', Value: paid_date,         Label: '{i18n>PaymentDate}' },
            { $Type: 'UI.DataField', Value: payment_mode,      Label: '{i18n>PaymentMode}' },
            { $Type: 'UI.DataField', Value: payment_reference,    Label: '{i18n>PaymentReference}' },
            { $Type: 'UI.DataField', Value: payment_verified,     Label: '{i18n>PaymentVerified}' },
            { $Type: 'UI.DataField', Value: payment_verified_by.full_name, Label: '{i18n>Verifier}' },
        ]
    },

    UI.FieldGroup #Remarks : {
        Data : [
            { $Type: 'UI.DataField', Value: remarks, Label: '{i18n>Remarks}' },
        ]
    },
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'AdminService.approveMembership',
            Label : '{i18n>Approve}',
            Criticality : #Positive,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'AdminService.rejectMembership',
            Label : '{i18n>Reject}',
            Criticality : #Negative,
        },
    ],
);

// ─── Action parameter annotations ───
annotate service.JoinRequests actions {
    approveMembership(
        remarks  @UI.MultiLineText @Common.Label: '{i18n>Remarks}'
    );
    rejectMembership(
        remarks  @UI.MultiLineText @Common.Label: '{i18n>Remarks}'
    );
};

// ─── Approval history table ───
annotate service.JoinApprovals with @(
    UI.LineItem #Approvals : [
        {
            $Type : 'UI.DataField',
            Value : approver.full_name,
            Label : '{i18n>Approver}',
        },
        {
            $Type : 'UI.DataField',
            Value : decision,
            Label : '{i18n>Decision}',
        },
        {
            $Type : 'UI.DataField',
            Value : decided_at,
            Label : '{i18n>DecidedAt}',
        },
        {
            $Type : 'UI.DataField',
            Value : remarks,
            Label : '{i18n>Remarks}',
        },
    ]
);

// ─── Status filter value list ───
annotate service.JoinRequests with {
    status @(
        Common.Label : '{i18n>Status}',
        Common.Text : statusText,
        Common.TextArrangement : #TextOnly,
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'JoinRequestStatusValues',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : status,
                    ValueListProperty : 'code',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
    )
};

annotate service.JoinRequests with {
    statusText        @UI.Hidden;
    statusCriticality @UI.Hidden;
};

annotate service.JoinRequestStatusValues with {
    code @Common.Text : value  @Common.TextArrangement : #TextOnly;
};

