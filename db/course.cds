namespace com.samanvay;

using { com.samanvay.Mandals } from './mandal';
using { com.samanvay.Users } from './users';
using { managed, cuid } from '@sap/cds/common';

// ─── Courses ───
// Courses offered by a mandal (religious studies, cultural programs, etc.)
entity Courses : managed, cuid {
  title         : String(200);
  description   : String(1000);
  mandal        : Association to Mandals;
  status        : String enum { active; archived; draft; } default 'draft';
  duration_days : Integer;  // Expected duration in days

  syllabus      : Composition of many SyllabusTopics on syllabus.course = $self;
  assignments   : Composition of many CourseAssignments on assignments.course = $self;
}

// ─── Syllabus Topics ───
// Ordered list of topics/modules within a course
entity SyllabusTopics : managed, cuid {
  course        : Association to Courses;
  sequence      : Integer;        // Order of the topic in the syllabus
  title         : String(200);
  description   : String(1000);
  material_url  : String(500);    // Link to reading material, video, etc.
  estimated_hours : Decimal(4,1); // Estimated hours to complete
}

// ─── Course Assignments ───
// Admin assigns a course to a member; tracks overall progress
entity CourseAssignments : managed, cuid {
  course        : Association to Courses;
  user          : Association to Users;           // Member assigned to take the course
  mandal        : Association to Mandals;
  assigned_by   : Association to Users;           // Admin/member who assigned
  assigned_date : Date;
  due_date      : Date;                           // Expected completion date
  status        : String enum {
    assigned;       // Just assigned, not started
    in_progress;    // Member has started
    completed;      // All topics done
    overdue;        // Past due date, not completed
  } default 'assigned';
  completion_pct : Integer default 0;             // 0-100 percentage
  completed_date : Date;

  // Topic-wise progress
  progress      : Composition of many CourseTopicProgress on progress.assignment = $self;
}

// ─── Course Topic Progress ───
// Tracks completion of each syllabus topic for a member's assignment
entity CourseTopicProgress : managed, cuid {
  assignment    : Association to CourseAssignments;
  topic         : Association to SyllabusTopics;
  status        : String enum { not_started; in_progress; completed; } default 'not_started';
  completed_date : Date;
  marked_by     : Association to Users;           // Admin/assigned member who updated progress
  remarks       : String(500);
}
