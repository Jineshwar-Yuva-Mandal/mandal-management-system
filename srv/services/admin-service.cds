using { com.samanvay.Mandals, com.samanvay.MandalMemberships } from '../../db/mandal';
using { com.samanvay.Users } from '../../db/users';
using { com.samanvay.Positions, com.samanvay.UserPositionAssignments,
        com.samanvay.ProtectedEntities, com.samanvay.ProtectedFields,
        com.samanvay.EntityPermissions, com.samanvay.FieldPermissions,
        com.samanvay.AppAccessGrants } from '../../db/authorization';
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
// All data is SCOPED to the user's mandal via @restrict + $user.mandalId.
// The 'mandal_admin' CDS role is granted in auth.js for platform_admin, mandal_admin, or is_admin=true.
// ═══════════════════════════════════════════════════
@(requires: 'mandal_admin')
@impl: 'srv/handlers/admin-service.js'
service AdminService @(path: '/api/admin') {

  @odata.draft.enabled
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'ID = $user.mandalId' }]
  entity Mandal as projection on Mandals;

  // ─── My Mandals (memberships navigation target for Members detail page) ───
  @readonly
  @restrict: [{ grant: 'READ', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity MyMandals as projection on MandalMemberships;

  // Members require join through MandalMemberships — scoped in handler
  @cds.redirection.target
  @odata.draft.enabled
  @restrict: [{ grant: '*', to: 'mandal_admin' }]
  entity Members as projection on Users {
    *,
    virtual positionTitle : String
  };

  // ─── Memberships ───
  @cds.redirection.target: false
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity Memberships as projection on MandalMemberships;

  // ─── Position & Permission Management ───
  @odata.draft.enabled
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity MandalPositions as projection on Positions;
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity PositionAssignments as projection on UserPositionAssignments;
  @readonly entity ProtectedEntityList as projection on ProtectedEntities;
  @readonly entity ProtectedFieldList as projection on ProtectedFields;
  entity EntityPermissionRules as projection on EntityPermissions;
  entity FieldPermissionRules as projection on FieldPermissions;

  // ─── Event Management ───
  @odata.draft.enabled
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity MandalEvents as projection on Events;
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity Attendance as projection on EventAttendance;

  // ─── Fine Management ───
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity MemberFines as projection on Fines
    actions {
      action approveFine(remarks : String);
      action rejectFine(remarks : String);
    };

  // ─── Ledger ───
  @odata.draft.enabled
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity Ledger as projection on LedgerEntries
    actions {
      action verifyEntry(remarks : String);
    };

  // ─── Course Management ───
  @odata.draft.enabled
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity MandalCourses as projection on Courses;
  @readonly entity Topics as projection on SyllabusTopics;
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity Assignments as projection on CourseAssignments;
  @readonly entity TopicProgress as projection on CourseTopicProgress;

  // ─── Membership & Approval Workflows ───
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity Workflows as projection on ApprovalWorkflows;
  @readonly entity WorkflowSteps as projection on ApprovalWorkflowSteps;
  @cds.redirection.target
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity JoinRequests as projection on MembershipRequests
    actions {
      action approveMembership(remarks : String);
      action rejectMembership(remarks : String);
    };
  @readonly entity JoinApprovals as projection on MembershipApprovals;

  // ─── Distinct value lists for filter dropdowns ───
  @readonly entity JoinRequestStatusValues {
    key code : String;
    value : String;
  };

  // ─── Member Field Configuration ───
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity MemberFieldConfig as projection on MandalMemberFieldConfigs {
    *,
    virtual requirementCriticality : Integer
  };

  // ─── App Access Grants ───
  // Admin assigns specific admin app access to regular members
  @odata.draft.enabled
  @restrict: [{ grant: '*', to: 'mandal_admin', where: 'mandal_ID = $user.mandalId' }]
  entity AppGrants as projection on AppAccessGrants;

  // ─── Available Apps (for dropdown in app grant creation) ───
  @readonly entity AvailableApps {
    key ![key]   : String;
        label : String;
  };

  // ─── Actions ───
  action markAttendance(eventId : UUID, attendees : array of {
    userId : UUID;
    status : String enum { present; absent; excused; };
  });
  // Transfer mandal admin ownership
  action transferAdminship(mandalId : UUID, newAdminUserId : UUID);
}
