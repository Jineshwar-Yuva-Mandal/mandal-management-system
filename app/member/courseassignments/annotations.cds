using MemberService as service from '../../../srv/services/member-service';

// ═══════════════════════════════════════════════════
// My Course Assignments — Read-only list + detail
// ═══════════════════════════════════════════════════
annotate service.MyCourseAssignments with @(
    UI.HeaderInfo : {
        TypeName       : 'Course Assignment',
        TypeNamePlural : 'Course Assignments',
        Title          : { $Type: 'UI.DataField', Value: course.title },
        Description    : { $Type: 'UI.DataField', Value: status },
    },

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : course.title,
            Label : '{i18n>Course}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : status,
            Label : '{i18n>Status}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : completion_pct,
            Label : '{i18n>Progress}',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : assigned_date,
            Label : '{i18n>Assigned}',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : due_date,
            Label : '{i18n>DueDate}',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : completed_date,
            Label : '{i18n>Completed}',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : assigned_by.full_name,
            Label : '{i18n>AssignedBy}',
        },
    ],

    UI.SelectionFields : [
        status,
    ],

    UI.HeaderFacets : [
        
    ],

    UI.DataPoint #Progress : {
        Value         : completion_pct,
        Title         : 'Completion',
        TargetValue   : 100,
        Visualization : #Progress,
    },

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
            { $Type: 'UI.DataField', Value: course.title,       Label: 'Course' },
            { $Type: 'UI.DataField', Value: course.description,  Label: 'Course Description' },
            { $Type: 'UI.DataField', Value: status,              Label: 'Status' },
            { $Type: 'UI.DataField', Value: assigned_date,       Label: 'Assigned Date' },
            { $Type: 'UI.DataField', Value: due_date,            Label: 'Due Date' },
            { $Type: 'UI.DataField', Value: completion_pct,      Label: 'Completion %' },
            { $Type: 'UI.DataField', Value: completed_date,      Label: 'Completed Date' },
            { $Type: 'UI.DataField', Value: assigned_by.full_name, Label: 'Assigned By' },
        ],
    },
    UI.DataPoint #progress : {
        $Type : 'UI.DataPointType',
        Value : completion_pct,
        Title : ' ',
        TargetValue : 100,
        Visualization : #Progress,
    },
);

// ─── Topic Progress sub-table ───
annotate service.MyCourseProgress with @(
    UI.LineItem #TopicProgress : [
        {
            $Type : 'UI.DataField',
            Value : topic.title,
            Label : 'Topic',
            @UI.Importance : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : topic.sequence,
            Label : '#',
            @UI.Importance : #Medium,
        },
        {
            $Type : 'UI.DataField',
            Value : status,
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
            @UI.Importance : #Low,
        },
    ]
);