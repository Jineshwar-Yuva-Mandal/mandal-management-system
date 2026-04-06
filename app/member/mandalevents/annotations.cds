using MemberService as service from '../../../srv/services/member-service';

// ═══════════════════════════════════════════════════
// Mandal Events — Read-only list + detail
// ═══════════════════════════════════════════════════
annotate service.MandalEvents with @(
    Capabilities.DeleteRestrictions : { Deletable: false },
    Capabilities.UpdateRestrictions : { Updatable: false },
    UI.HeaderInfo : {
        TypeName       : 'Event',
        TypeNamePlural : 'Events',
        Title          : { $Type: 'UI.DataField', Value: title },
        Description    : { $Type: 'UI.DataField', Value: description },
    },

    UI.Identification : [
        {
            $Type  : 'UI.DataFieldForAction',
            Action : 'MemberService.rsvpYes',
            Label  : '{i18n>Attending}',
            Inline : false,
            Criticality : #Positive,
        },
        {
            $Type  : 'UI.DataFieldForAction',
            Action : 'MemberService.rsvpNo',
            Label  : '{i18n>NotAttending}',
            Inline : false,
            Criticality : #Negative,
        },
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : title,
            Label : '{i18n>Event}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : event_date,
            Label : '{i18n>Date}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : start_time,
            Label : 'Start',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : end_time,
            Label : '{i18n>End}',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : location,
            Label : '{i18n>Location}',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : has_fine,
            Label : '{i18n>FineApplicable}',
            @UI.Importance : #Low,
        },
    ],

    UI.SelectionFields : [
        event_date,
        has_fine,
    ],

    UI.HeaderFacets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#EventQuick',
            Label  : 'Event Info',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Fine Config',
            ID : 'FineConfig',
            Target : '@UI.FieldGroup#FineConfig1',
        },
    ],

    UI.FieldGroup #EventQuick : {
        Data : [
            { $Type: 'UI.DataField', Value: event_date, Label: 'Date' },
            {
                $Type : 'UI.DataField',
                Value : start_time,
                Label : '{i18n>StartTime}',
            },
            {
                $Type : 'UI.DataField',
                Value : end_time,
                Label : '{i18n>EndTime}',
            },
        ]
    },

    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'AttendanceFacet',
            Target : 'attendance/@UI.LineItem#EventAttendance',
            Label  : 'Attendance',
        },
    ],

    UI.FieldGroup #EventDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: title,       Label: 'Title' },
            { $Type: 'UI.DataField', Value: description,  Label: 'Description' },
            { $Type: 'UI.DataField', Value: event_date,   Label: 'Date' },
            { $Type: 'UI.DataField', Value: start_time,   Label: 'Start Time' },
            { $Type: 'UI.DataField', Value: end_time,     Label: 'End Time' },
            { $Type: 'UI.DataField', Value: location,     Label: 'Location' },
        ],
    },

    UI.FieldGroup #FineConfig : {
        Data : [
            { $Type: 'UI.DataField', Value: has_fine,      Label: 'Fine Applicable' },
            { $Type: 'UI.DataField', Value: fine_amount,   Label: 'Fine Amount' },
            { $Type: 'UI.DataField', Value: fine_deadline,  Label: 'Fine Deadline' },
        ],
    },
    UI.FieldGroup #FineConfig1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : has_fine,
                Label : '{i18n>Applicable}',
            },
            {
                $Type : 'UI.DataField',
                Value : fine_amount,
                Label : '{i18n>Amount}',
            },
            {
                $Type : 'UI.DataField',
                Value : fine_deadline,
                Label : '{i18n>Deadline}',
            },
        ],
    },
);

// ─── Side effects: refresh attendance after RSVP ───
annotate service.MandalEvents with actions {
    rsvpYes @(
        Common.SideEffects : {
            TargetEntities : [attendance],
        }
    );
    rsvpNo @(
        Common.SideEffects : {
            TargetEntities : [attendance],
        }
    );
};

// ─── Attendance sub-table ───
annotate service.MyAttendance with @(
    UI.LineItem #EventAttendance : [
        {
            $Type : 'UI.DataField',
            Value : user.full_name,
            Label : 'Member',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : rsvp_status,
            Label : 'RSVP',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : status,
            Label : 'Attendance',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : remarks,
            Label : 'Remarks',
            @UI.Importance : #Medium,
        },
    ]
);