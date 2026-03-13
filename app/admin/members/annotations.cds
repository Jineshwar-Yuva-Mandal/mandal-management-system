using AdminService as service from '../../../srv/admin-service';
annotate service.Members with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : profile_picture,
            Label : ' ',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : full_name,
            Label : '{i18n>Name}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : father_name,
            Label : '{i18n>FathersName}',
        },
        {
            $Type : 'UI.DataField',
            Value : email,
            Label : '{i18n>Email}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : phone,
            Label : '{i18n>Phone}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : dob,
            Label : '{i18n>Dob}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : education,
            Label : 'Highest Education',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : gotra,
            Label : '{i18n>Gotra}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : profession,
            Label : '{i18n>Profession}',
            @UI.Importance : #High,
        },
    ],
    UI.Facets : [
        {
            $Type : 'UI.CollectionFacet',
            ID : 'group1',
            Facets : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>BasicIdentity}',
                    ID : 'i18nBasicIdentity',
                    Target : '@UI.FieldGroup#i18nBasicIdentity',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>PersonalDetails}',
                    ID : 'i18nPersonalDetails',
                    Target : '@UI.FieldGroup#i18nPersonalDetails',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>FamilyDetails}',
                    ID : 'i18nFamilyDetails',
                    Target : '@UI.FieldGroup#i18nFamilyDetails',
                },
            ],
            Label : 'Personal Details',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>EducationProfession}',
            ID : 'i18nEducationProfession',
            Target : '@UI.FieldGroup#i18nEducationProfession',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Memberships}',
            ID : 'i18nMemberships',
            Target : 'memberships/@UI.LineItem#i18nMemberships',
        },
    ],
    UI.FieldGroup #i18nBasicIdentity : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : email,
                Label : '{i18n>Email}',
            },
            {
                $Type : 'UI.DataField',
                Value : phone,
                Label : '{i18n>Phone}',
            },
            {
                $Type : 'UI.DataField',
                Value : alternate_phone,
                Label : '{i18n>AlternatePhone}',
            },
            {
                $Type : 'UI.DataField',
                Value : whatsapp_number,
                Label : '{i18n>Whatsapp}',
            },
        ],
    },
    UI.FieldGroup #i18nPersonalDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : blood_group,
                Label : '{i18n>BloodGroup}',
            },
            {
                $Type : 'UI.DataField',
                Value : dob,
                Label : '{i18n>Dob}',
            },
            {
                $Type : 'UI.DataField',
                Value : gender,
                Label : '{i18n>Gender}',
            },
            {
                $Type : 'UI.DataField',
                Value : marital_status,
                Label : '{i18n>MaritalStatus}',
            },
            {
                $Type : 'UI.DataField',
                Value : mother_tongue,
                Label : '{i18n>MotherTongue}',
            },
        ],
    },
    UI.FieldGroup #i18nFamilyDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : family_members_in_mandal,
                Label : '{i18n>FamilyMembersInMandal}',
            },
            {
                $Type : 'UI.DataField',
                Value : father_name,
                Label : '{i18n>FathersName}',
            },
            {
                $Type : 'UI.DataField',
                Value : num_children,
                Label : '{i18n>Children}',
            },
            {
                $Type : 'UI.DataField',
                Value : spouse_name,
                Label : '{i18n>Spouse}',
            },
            {
                $Type : 'UI.DataField',
                Value : mother_name,
                Label : '{i18n>MothersName}',
            },
        ],
    },
    UI.FieldGroup #i18nEducationProfession : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : designation,
                Label : '{i18n>Designation}',
            },
            {
                $Type : 'UI.DataField',
                Value : education,
                Label : '{i18n>Education}',
            },
            {
                $Type : 'UI.DataField',
                Value : organization,
                Label : '{i18n>Organisation}',
            },
            {
                $Type : 'UI.DataField',
                Value : profession,
                Label : '{i18n>Profession}',
            },
            {
                $Type : 'UI.DataField',
                Value : annual_income,
                Label : '{i18n>AnnualIncome}',
            },
        ],
    },
    UI.DataPoint #profile_picture : {
        $Type : 'UI.DataPointType',
        Value : profile_picture,
        Title : 'profile_picture',
    },
    UI.HeaderFacets : [
        
    ],
    UI.FieldGroup #i18nMemberProfile : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : profile_picture,
                Label : 'profile_picture',
            },
            {
                $Type : 'UI.DataField',
                Value : full_name,
                Label : 'full_name',
            },
            {
                $Type : 'UI.DataField',
                Value : email,
                Label : 'email',
            },
        ],
    },
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : full_name,
        },
        TypeName : '',
        TypeNamePlural : '',
        Description : {
            $Type : 'UI.DataField',
            Value : role,
        },
        ImageUrl : profile_picture,
        Initials : full_name,
    },
);

annotate service.MyMandals with @(
    UI.LineItem #i18nMemberships : [
        {
            $Type : 'UI.DataField',
            Value : mandal.logo,
            Label : ' ',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : mandal.name,
            Label : '{i18n>Mandal}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : mandal.area,
            Label : '{i18n>Area}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : user.city,
            Label : '{i18n>City}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : mandal.state,
            Label : '{i18n>State}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : joined_date,
            Label : '{i18n>JoiningDate}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : left_date,
            Label : '{i18n>ExitDate}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : membership_status,
            Label : '{i18n>MembershipStatus}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : remarks,
            Label : '{i18n>Remarks}',
            @UI.Importance : #High,
        },
    ]
);

