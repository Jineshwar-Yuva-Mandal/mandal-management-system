using AdminService as service from '../../../srv/services/admin-service';

// ── Virtual fields for attendance summary ──
extend projection service.MandalEvents with {
    virtual null as attendanceSummary : String
};

// ═══════════════════════════════════════════════════
// MandalEvents — List Report + Object Page
// ═══════════════════════════════════════════════════
annotate service.MandalEvents with @(
    UI.HeaderInfo : {
        TypeName       : 'Event',
        TypeNamePlural : 'Events',
        Title          : { $Type: 'UI.DataField', Value: title },
        Description    : { $Type: 'UI.DataField', Value: location },
    },

    // ─── List Report ───
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
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : fine_amount,
            Label : 'Fine Amount',
            @UI.Importance : #Medium,
        },
    ],

    UI.SelectionFields : [
        event_date,
        has_fine,
    ],

    // ─── Header Facets ───
    UI.HeaderFacets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#EventStatus',
            Label  : 'Event Info',
        },
    ],

    UI.FieldGroup #EventStatus : {
        Data : [
            { $Type: 'UI.DataField', Value: event_date,  Label: 'Date' },
            { $Type: 'UI.DataField', Value: has_fine,     Label: 'Fine Applicable' },
            { $Type: 'UI.DataField', Value: fine_amount,  Label: 'Fine Amount' },
        ]
    },

    // ─── Object Page Sections ───
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
            Target : 'attendance/@UI.LineItem#AttendanceList',
            Label  : 'Attendance',
        },
    ],

    UI.FieldGroup #EventDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: title,       Label: 'Event Title' },
            { $Type: 'UI.DataField', Value: description,  Label: 'Description' },
            { $Type: 'UI.DataField', Value: event_date,   Label: 'Date' },
            { $Type: 'UI.DataField', Value: start_time,   Label: 'Start Time' },
            { $Type: 'UI.DataField', Value: end_time,     Label: 'End Time' },
            { $Type: 'UI.DataField', Value: location,     Label: 'Location' },
        ]
    },

    UI.FieldGroup #FineConfig : {
        Data : [
            { $Type: 'UI.DataField', Value: has_fine,      Label: 'Fine Applicable' },
            { $Type: 'UI.DataField', Value: fine_amount,   Label: 'Fine Amount (₹)' },
            { $Type: 'UI.DataField', Value: fine_deadline, Label: 'Fine Deadline' },
        ]
    },
);

// ─── Hide virtual/internal fields ───
annotate service.MandalEvents with {
    attendanceSummary @UI.Hidden;
};


// ═══════════════════════════════════════════════════
// Attendance — inline table on Event Object Page
// ═══════════════════════════════════════════════════
annotate service.Attendance with @(
    UI.HeaderInfo : {
        TypeName       : 'Attendance Record',
        TypeNamePlural : 'Attendance',
        Title          : { $Type: 'UI.DataField', Value: user.full_name },
    },

    UI.LineItem #AttendanceList : [
        {
            $Type : 'UI.DataField',
            Value : user.full_name,
            Label : 'Member',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : user.phone,
            Label : 'Phone',
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
            Value : remarks,
            Label : 'Remarks',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : marked_at,
            Label : 'Marked At',
            @UI.Importance : #Low,
        },
    ],
);

// ── Virtual criticality for attendance status ──
extend projection service.Attendance with {
    virtual null as statusCriticality : Integer
};

// ── Attendance is auto-managed: no manual create/delete ──
annotate service.Attendance with @(
    Capabilities.InsertRestrictions: { Insertable: false },
    Capabilities.DeleteRestrictions: { Deletable: false },
);

annotate service.Attendance with {
    statusCriticality @UI.Hidden;
    user @(
        Common.Text : user.full_name,
        Common.TextArrangement : #TextOnly,
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Members',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : user_ID,
                    ValueListProperty : 'ID',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'full_name',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'phone',
                },
            ],
        },
    );
    status @(
        Common.Label : 'Status',
    );
};