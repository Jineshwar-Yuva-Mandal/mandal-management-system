using MemberService as service from '../../../srv/services/member-service';

// ═══════════════════════════════════════════════════
// Mandal Events — Read-only list + detail
// ═══════════════════════════════════════════════════
annotate service.MandalEvents with @(
    UI.HeaderInfo : {
        TypeName       : 'Event',
        TypeNamePlural : 'Events',
        Title          : { $Type: 'UI.DataField', Value: title },
        Description    : { $Type: 'UI.DataField', Value: location },
    },

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : title,
            Label : 'Event',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : event_date,
            Label : 'Date',
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
            Label : 'End',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : location,
            Label : 'Location',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : has_fine,
            Label : 'Fine Applicable',
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
    ],

    UI.FieldGroup #EventQuick : {
        Data : [
            { $Type: 'UI.DataField', Value: event_date, Label: 'Date' },
            { $Type: 'UI.DataField', Value: has_fine,    Label: 'Fine Applicable' },
            { $Type: 'UI.DataField', Value: fine_amount, Label: 'Fine Amount' },
        ]
    },

    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'EventDetailsFacet',
            Target : '@UI.FieldGroup#EventDetails',
            Label  : 'Event Details',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'FineConfigFacet',
            Target : '@UI.FieldGroup#FineConfig',
            Label  : 'Fine Configuration',
        },
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
);

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
            Value : status,
            Label : 'Status',
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