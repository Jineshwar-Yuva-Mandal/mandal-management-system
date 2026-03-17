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
    },
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : user.profile_picture,
            Label : ' ',
            @UI.Importance : #Low,
        },
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
            Value : paid_date,
            Label : '{i18n>PaymentDate}',
            @UI.Importance : #Low,
        },
        {
            $Type : 'UI.DataField',
            Value : payment_verified,
            Label : '{i18n>PaymentVerified}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : payment_verified_by.full_name,
            Label : '{i18n>Verifier}',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : payment_verified_by.profile_picture,
            Label : ' ',
            @UI.Importance : #Low,
        },
    ],
    UI.SelectionFields : [
        status,
    ],
);
annotate service.JoinRequests with {
    status @(
        Common.Label : '{i18n>PaymentStatus}',
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

