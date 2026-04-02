using AdminService as service from '../../../srv/services/admin-service';

// ── Virtual fields ──
extend projection service.MandalCourses with {
    virtual null as statusCriticality : Integer
};
extend projection service.Assignments with {
    virtual null as statusCriticality : Integer
};
extend projection service.TopicProgress with {
    virtual null as statusCriticality : Integer
};

// ═══════════════════════════════════════════════════
// MandalCourses — List Report + Object Page
// ═══════════════════════════════════════════════════
annotate service.MandalCourses with @(
    UI.HeaderInfo : {
        TypeName       : 'Course',
        TypeNamePlural : 'Courses',
        Title          : { $Type: 'UI.DataField', Value: title },
        Description    : { $Type: 'UI.DataField', Value: status },
    },

    // ─── List Report ───
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : title,
            Label : 'Course',
            @UI.Importance : #High,
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
            Value : duration_days,
            Label : 'Duration (days)',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : description,
            Label : 'Description',
            @UI.Importance : #Medium,
        },
    ],

    UI.SelectionFields : [
        status,
    ],

    // ─── Header Facets ───
    UI.HeaderFacets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#CourseHeader',
            Label  : 'Course Info',
        },
    ],

    UI.FieldGroup #CourseHeader : {
        Data : [
            { $Type: 'UI.DataField', Value: status,         Criticality: statusCriticality, Label: 'Status' },
            { $Type: 'UI.DataField', Value: duration_days,   Label: 'Duration (days)' },
        ]
    },

    // ─── Object Page Sections ───
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'CourseDetailsFacet',
            Target : '@UI.FieldGroup#CourseDetails',
            Label  : 'Course Details',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'SyllabusFacet',
            Target : 'syllabus/@UI.LineItem#Syllabus',
            Label  : 'Syllabus',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'AssignmentsFacet',
            Target : 'assignments/@UI.LineItem#Assignments',
            Label  : 'Member Assignments',
        },
    ],

    UI.FieldGroup #CourseDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: title,          Label: 'Title' },
            { $Type: 'UI.DataField', Value: description,    Label: 'Description' },
            { $Type: 'UI.DataField', Value: status,         Label: 'Status' },
            { $Type: 'UI.DataField', Value: duration_days,  Label: 'Duration (days)' },
        ]
    },
);

annotate service.MandalCourses with {
    statusCriticality @UI.Hidden;
};

// ═══════════════════════════════════════════════════
// Syllabus Topics — inline table on Course Object Page
// ═══════════════════════════════════════════════════
annotate service.Topics with @(
    UI.HeaderInfo : {
        TypeName       : 'Topic',
        TypeNamePlural : 'Syllabus Topics',
        Title          : { $Type: 'UI.DataField', Value: title },
    },

    UI.LineItem #Syllabus : [
        {
            $Type : 'UI.DataField',
            Value : sequence,
            Label : '#',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : title,
            Label : 'Topic',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : description,
            Label : 'Description',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : estimated_hours,
            Label : 'Est. Hours',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : material_url,
            Label : 'Material Link',
            @UI.Importance : #Low,
        },
    ],

    // ─── Topic Object Page (when navigated from syllabus) ───
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'TopicDetailsFacet',
            Target : '@UI.FieldGroup#TopicDetails',
            Label  : 'Topic Details',
        },
    ],

    UI.FieldGroup #TopicDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: sequence,        Label: 'Sequence' },
            { $Type: 'UI.DataField', Value: title,           Label: 'Title' },
            { $Type: 'UI.DataField', Value: description,     Label: 'Description' },
            { $Type: 'UI.DataField', Value: estimated_hours, Label: 'Estimated Hours' },
            { $Type: 'UI.DataField', Value: material_url,    Label: 'Material URL' },
        ]
    },
);


// ═══════════════════════════════════════════════════
// Assignments — inline table on Course Object Page + own Object Page
// ═══════════════════════════════════════════════════
annotate service.Assignments with @(
    UI.HeaderInfo : {
        TypeName       : 'Assignment',
        TypeNamePlural : 'Assignments',
        Title          : { $Type: 'UI.DataField', Value: user.full_name },
        Description    : { $Type: 'UI.DataField', Value: status },
    },

    UI.LineItem #Assignments : [
        {
            $Type : 'UI.DataField',
            Value : user.full_name,
            Label : 'Member',
            @UI.Importance : #High,
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
            Value : completion_pct,
            Label : 'Progress (%)',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : assigned_date,
            Label : 'Assigned',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : due_date,
            Label : 'Due Date',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : completed_date,
            Label : 'Completed',
            @UI.Importance : #Low,
        },
    ],

    // ─── Assignment Object Page Header ───
    UI.HeaderFacets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#AssignmentHeader',
            Label  : 'Progress',
        },
    ],

    UI.FieldGroup #AssignmentHeader : {
        Data : [
            { $Type: 'UI.DataField', Value: status,          Criticality: statusCriticality, Label: 'Status' },
            { $Type: 'UI.DataField', Value: completion_pct,   Label: 'Progress (%)' },
        ]
    },

    // ─── Assignment Object Page Sections ───
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'AssignmentDetailsFacet',
            Target : '@UI.FieldGroup#AssignmentDetails',
            Label  : 'Assignment Details',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'TopicProgressFacet',
            Target : 'progress/@UI.LineItem#TopicProgress',
            Label  : 'Topic Progress',
        },
    ],

    UI.FieldGroup #AssignmentDetails : {
        Data : [
            { $Type: 'UI.DataField', Value: user.full_name,         Label: 'Member' },
            { $Type: 'UI.DataField', Value: user.phone,             Label: 'Phone' },
            { $Type: 'UI.DataField', Value: assigned_by.full_name,  Label: 'Assigned By' },
            { $Type: 'UI.DataField', Value: assigned_date,          Label: 'Assigned Date' },
            { $Type: 'UI.DataField', Value: due_date,               Label: 'Due Date' },
            { $Type: 'UI.DataField', Value: status,                 Label: 'Status' },
            { $Type: 'UI.DataField', Value: completion_pct,         Label: 'Completion (%)' },
            { $Type: 'UI.DataField', Value: completed_date,         Label: 'Completed Date' },
        ]
    },
);

annotate service.Assignments with {
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
};


// ═══════════════════════════════════════════════════
// Topic Progress — inline table on Assignment Object Page
// ═══════════════════════════════════════════════════
annotate service.TopicProgress with @(
    UI.HeaderInfo : {
        TypeName       : 'Topic Progress',
        TypeNamePlural : 'Topic Progress',
        Title          : { $Type: 'UI.DataField', Value: topic.title },
    },

    UI.LineItem #TopicProgress : [
        {
            $Type : 'UI.DataField',
            Value : topic.sequence,
            Label : '#',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : topic.title,
            Label : 'Topic',
            @UI.Importance : #High,
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
            Value : completed_date,
            Label : 'Completed',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : remarks,
            Label : 'Remarks',
            @UI.Importance : #Medium,
        },
    ],
);

// ── Topic progress: no manual create/delete (auto-populated) ──
annotate service.TopicProgress with @(
    Capabilities.InsertRestrictions: { Insertable: false },
    Capabilities.DeleteRestrictions: { Deletable: false },
);

annotate service.TopicProgress with {
    statusCriticality @UI.Hidden;
};