using MemberService as service from '../../../srv/services/member-service';
using from '@sap/cds/common';


// ═══════════════════════════════════════════════════
// My Profile — Editable personal details
// ═══════════════════════════════════════════════════
annotate service.MyProfile with @(
    UI.HeaderInfo : {
        Title          : { $Type: 'UI.DataField', Value: full_name },
        TypeName       : 'Profile',
        TypeNamePlural : 'Profiles',
        Description    : { $Type: 'UI.DataField', Value: email },
        ImageUrl       : profile_picture_url,
        Initials       : full_name,
    },

    UI.HeaderFacets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#ContactInfo',
        },
    ],

    UI.FieldGroup #ContactInfo : {
        Data : [
            { $Type: 'UI.DataField', Value: phone,           Label: '{i18n>Phone}' },
            { $Type: 'UI.DataField', Value: whatsapp_number, Label: '{i18n>Whatsapp1}' },
            { $Type: 'UI.DataField', Value: city,            Label: '{i18n>City}' },
        ]
    },

    UI.FieldGroup #ProfilePicUpload : {
        Data : [
            { $Type: 'UI.DataField', Value: profile_picture, Label: 'Upload Picture' },
        ]
    },

    // ─── Object Page Facets ───
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'ProfilePictureFacet',
            Label  : 'Profile Picture',
            Target : '@UI.FieldGroup#ProfilePicUpload',
            ![@UI.Hidden] : IsActiveEntity,
        },
        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'PersonalInfo',
            Label  : 'Personal Details',
            Facets : [
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : 'Basic Identity',
                    ID     : 'BasicIdentity',
                    Target : '@UI.FieldGroup#BasicIdentity',
                },
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : 'Personal',
                    ID     : 'Personal',
                    Target : '@UI.FieldGroup#Personal',
                },
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : 'Family',
                    ID     : 'Family',
                    Target : '@UI.FieldGroup#Family',
                },
            ],
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'AddressFacet',
            Label  : 'Address',
            Target : '@UI.FieldGroup#Address',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'EducationFacet',
            Label  : 'Education & Profession',
            Target : '@UI.FieldGroup#Education',
        },
        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'CulturalInfo',
            Label  : 'Religious & Cultural',
            Facets : [
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : 'Religious Details',
                    ID     : 'Religious',
                    Target : '@UI.FieldGroup#Religious',
                },
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : 'Skills & Interests',
                    ID     : 'Skills',
                    Target : '@UI.FieldGroup#Skills',
                },
            ],
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'HealthFacet',
            Label  : 'Health & Emergency',
            Target : '@UI.FieldGroup#Health',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'MembershipsFacet',
            Label  : 'Memberships',
            Target : 'memberships/@UI.LineItem#MyMemberships',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'PositionsFacet',
            Label  : 'Positions',
            Target : 'positionAssignments/@UI.LineItem#MyPositions',
        },
    ],

    // ─── Field Groups ───
    UI.FieldGroup #BasicIdentity : {
        Data : [
            { $Type: 'UI.DataField', Value: first_name,      Label: '{i18n>FirstName}' },
            { $Type: 'UI.DataField', Value: middle_name,     Label: '{i18n>MiddleName}' },
            { $Type: 'UI.DataField', Value: last_name,       Label: '{i18n>LastName}' },
            { $Type: 'UI.DataField', Value: email,           Label: '{i18n>Email}' },
            { $Type: 'UI.DataField', Value: phone,           Label: '{i18n>Phone}' },
            { $Type: 'UI.DataField', Value: alternate_phone, Label: '{i18n>AlternatePhone}' },
            { $Type: 'UI.DataField', Value: whatsapp_number, Label: '{i18n>Whatsapp1}' },
        ],
    },

    UI.FieldGroup #Personal : {
        Data : [
            { $Type: 'UI.DataField', Value: dob,            Label: '{i18n>DateOfBirth}' },
            { $Type: 'UI.DataField', Value: gender,          Label: '{i18n>Gender}' },
            { $Type: 'UI.DataField', Value: marital_status,  Label: 'Marital Status' },
            { $Type: 'UI.DataField', Value: blood_group,     Label: 'Blood Group' },
            { $Type: 'UI.DataField', Value: nationality,     Label: 'Nationality' },
            { $Type: 'UI.DataField', Value: mother_tongue,   Label: 'Mother Tongue' },
        ],
    },

    UI.FieldGroup #Family : {
        Data : [
            { $Type: 'UI.DataField', Value: father_name,               Label: 'Father Name' },
            { $Type: 'UI.DataField', Value: mother_name,               Label: 'Mother Name' },
            { $Type: 'UI.DataField', Value: spouse_name,               Label: 'Spouse Name' },
            { $Type: 'UI.DataField', Value: num_children,              Label: 'Children' },
            { $Type: 'UI.DataField', Value: family_members_in_mandal,  Label: 'Family in Mandal' },
        ],
    },

    UI.FieldGroup #Address : {
        Data : [
            { $Type: 'UI.DataField', Value: address_line1,  Label: 'Address Line 1' },
            { $Type: 'UI.DataField', Value: address_line2,  Label: 'Address Line 2' },
            { $Type: 'UI.DataField', Value: city,            Label: 'City' },
            { $Type: 'UI.DataField', Value: state,           Label: 'State' },
            { $Type: 'UI.DataField', Value: pincode,         Label: 'Pincode' },
            { $Type: 'UI.DataField', Value: country_code,    Label: 'Country' },
        ],
    },

    UI.FieldGroup #Education : {
        Data : [
            { $Type: 'UI.DataField', Value: education,     Label: 'Education' },
            { $Type: 'UI.DataField', Value: profession,    Label: 'Profession' },
            { $Type: 'UI.DataField', Value: organization,  Label: 'Organization' },
            { $Type: 'UI.DataField', Value: designation,   Label: 'Designation' },
            { $Type: 'UI.DataField', Value: annual_income, Label: 'Annual Income' },
        ],
    },

    UI.FieldGroup #Religious : {
        Data : [
            { $Type: 'UI.DataField', Value: gotra,            Label: 'Gotra' },
            { $Type: 'UI.DataField', Value: nakshatra,         Label: 'Nakshatra' },
            { $Type: 'UI.DataField', Value: rashi,             Label: 'Rashi' },
            { $Type: 'UI.DataField', Value: kuldevi,           Label: 'Kuldevi' },
            { $Type: 'UI.DataField', Value: native_place,      Label: 'Native Place' },
            { $Type: 'UI.DataField', Value: previous_mandal,   Label: 'Previous Mandal' },
            { $Type: 'UI.DataField', Value: reference_member,  Label: 'Reference Member' },
        ],
    },

    UI.FieldGroup #Skills : {
        Data : [
            { $Type: 'UI.DataField', Value: skills,              Label: 'Skills' },
            { $Type: 'UI.DataField', Value: hobbies,             Label: 'Hobbies' },
            { $Type: 'UI.DataField', Value: volunteer_interests, Label: 'Volunteer Interests' },
            { $Type: 'UI.DataField', Value: languages_known,     Label: 'Languages Known' },
        ],
    },

    UI.FieldGroup #Health : {
        Data : [
            { $Type: 'UI.DataField', Value: emergency_contact_name,     Label: 'Emergency Contact' },
            { $Type: 'UI.DataField', Value: emergency_contact_phone,    Label: 'Emergency Phone' },
            { $Type: 'UI.DataField', Value: emergency_contact_relation, Label: 'Relation' },
            { $Type: 'UI.DataField', Value: medical_conditions,         Label: 'Medical Conditions' },
            { $Type: 'UI.DataField', Value: dietary_preference,         Label: 'Dietary Preference' },
        ],
    },
);

// ─── Hide helper fields ───
annotate service.MyProfile with {
    profile_picture_type @UI.Hidden;
    profile_picture_name @UI.Hidden;
    profile_picture_url  @UI.Hidden;
    role                 @UI.Hidden;
    ID                   @UI.Hidden;
};

// ─── Memberships table (read-only) ───
annotate service.MyMandals with @(
    UI.LineItem #MyMemberships : [
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
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : membership_status,
            Label : '{i18n>Status}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : joined_date,
            Label : '{i18n>Joined}',
            @UI.Importance : #High,
        },
    ]
);

// ─── Positions table (read-only) ───
annotate service.MyPositions with @(
    UI.LineItem #MyPositions : [
        {
            $Type : 'UI.DataField',
            Value : position.name,
            Label : '{i18n>Position}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : mandal.name,
            Label : 'Mandal',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : valid_from,
            Label : 'From',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : valid_to,
            Label : 'To',
            @UI.Importance : #High,
        },
    ]
);
annotate service.MyProfile with {
    gender @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'GenderValues',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : gender,
                    ValueListProperty : 'code',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'value',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
    );
    marital_status @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'MaritalStatusValues',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : marital_status,
                    ValueListProperty : 'code',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'value',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
    );
    blood_group @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'BloodGroupValues',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : blood_group,
                    ValueListProperty : 'code',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'value',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
    );
    education @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'EducationValues',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : education,
                    ValueListProperty : 'code',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'value',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
    );
    annual_income @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'AnnualIncomeValues',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : annual_income,
                    ValueListProperty : 'code',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'value',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
    );
    dietary_preference @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'DietaryPrefValues',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : dietary_preference,
                    ValueListProperty : 'code',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'value',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
    );
};

annotate service.GenderValues with {
    code @(
        Common.Text : value,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

annotate service.MaritalStatusValues with {
    code @(
        Common.Text : value,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

annotate service.BloodGroupValues with {
    code @(
        Common.Text : value,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

annotate service.MyProfile with {
    country @(
        Common.Text : country.name,
        Common.Text.@UI.TextArrangement : #TextOnly,
        Common.ValueListWithFixedValues : true,
        Common.ExternalID : country.descr,
)};

annotate service.EducationValues with {
    code @(
        Common.Text : value,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

annotate service.AnnualIncomeValues with {
    code @(
        Common.Text : value,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

annotate service.DietaryPrefValues with {
    code @(
        Common.Text : value,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

annotate service.Countries with {
    name @(
        Common.Text : descr,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

