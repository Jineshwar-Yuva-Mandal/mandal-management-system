using { com.samanvay.Mandals, com.samanvay.MandalMemberships } from '../../db/mandal';
using { com.samanvay.Users } from '../../db/users';
using { com.samanvay.Positions, com.samanvay.UserPositionAssignments,
        com.samanvay.ProtectedEntities, com.samanvay.ProtectedFields,
        com.samanvay.EntityPermissions, com.samanvay.FieldPermissions } from '../../db/authorization';
using { com.samanvay.Events, com.samanvay.EventAttendance } from '../../db/event';
using { com.samanvay.Fines } from '../../db/fine';
using { com.samanvay.LedgerEntries } from '../../db/ledger';
using { com.samanvay.Courses, com.samanvay.SyllabusTopics,
        com.samanvay.CourseAssignments, com.samanvay.CourseTopicProgress } from '../../db/course';
using { com.samanvay.ApprovalWorkflows, com.samanvay.ApprovalWorkflowSteps,
        com.samanvay.MembershipRequests, com.samanvay.MembershipApprovals } from '../../db/membership';
using { com.samanvay.MandalMemberFieldConfigs } from '../../db/member_field_config';

// ═══════════════════════════════════════════════════
// AdminService — For Mandal Admins / Position Holders
// All data is SCOPED to the user's mandal(s).
// If user is admin of multiple mandals, they select which mandal to manage.
// Handler enforces: only show data where mandal_ID matches the user's active mandal.
// ═══════════════════════════════════════════════════
@(requires: 'authenticated-user')
@impl: 'srv/handlers/admin-service.js'
service AdminService @(path: '/api/admin') {

  // ─── My Mandals (mandals where I am admin/have positions) ───
  @readonly entity MyMandals as projection on MandalMemberships;
  entity Mandal as projection on Mandals;
  @cds.redirection.target
  entity Members as projection on Users;

  // ─── Memberships ───
  @cds.redirection.target: false
  entity Memberships as projection on MandalMemberships;

  // ─── Position & Permission Management ───
  entity MandalPositions as projection on Positions;
  entity PositionAssignments as projection on UserPositionAssignments;
  entity ProtectedEntityList as projection on ProtectedEntities;
  entity ProtectedFieldList as projection on ProtectedFields;
  entity EntityPermissionRules as projection on EntityPermissions;
  entity FieldPermissionRules as projection on FieldPermissions;

  // ─── Event Management ───
  entity MandalEvents as projection on Events;
  entity Attendance as projection on EventAttendance;

  // ─── Fine Management ───
  entity MemberFines as projection on Fines;

  // ─── Ledger ───
  entity Ledger as projection on LedgerEntries;

  // ─── Course Management ───
  entity MandalCourses as projection on Courses;
  entity Topics as projection on SyllabusTopics;
  entity Assignments as projection on CourseAssignments;
  entity TopicProgress as projection on CourseTopicProgress;

  // ─── Membership & Approval Workflows ───
  entity Workflows as projection on ApprovalWorkflows;
  entity WorkflowSteps as projection on ApprovalWorkflowSteps;
  @cds.redirection.target
  entity JoinRequests as projection on MembershipRequests;
  entity JoinApprovals as projection on MembershipApprovals;

  // ─── Distinct value lists for filter dropdowns ───
  @readonly entity JoinRequestStatusValues {
    key code : String;
    value : String;
  };

  // ─── Member Field Configuration ───
  entity MemberFieldConfig as projection on MandalMemberFieldConfigs;

  // ─── Actions ───
  // Set active mandal context (for admins of multiple mandals)
  action selectMandal(mandalId : UUID);
  action verifyFinePayment(fineId : UUID, approved : Boolean, remarks : String) returns MemberFines;
  action markAttendance(eventId : UUID, attendees : array of {
    userId : UUID;
    status : String enum { present; absent; excused; };
  });
  action decideMembership(requestId : UUID, decision : String enum { approved; rejected; }, remarks : String);
  // Transfer mandal admin ownership
  action transferAdminship(mandalId : UUID, newAdminUserId : UUID);
}
