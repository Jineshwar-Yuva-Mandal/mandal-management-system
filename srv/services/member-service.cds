using { com.samanvay.Mandals, com.samanvay.MandalMemberships } from '../../db/mandal';
using { com.samanvay.Users } from '../../db/users';
using { com.samanvay.Events, com.samanvay.EventAttendance } from '../../db/event';
using { com.samanvay.Fines } from '../../db/fine';
using { com.samanvay.LedgerEntries } from '../../db/ledger';
using { com.samanvay.Courses, com.samanvay.SyllabusTopics,
        com.samanvay.CourseAssignments, com.samanvay.CourseTopicProgress } from '../../db/course';
using { com.samanvay.UserPositionAssignments,
        com.samanvay.AppAccessGrants } from '../../db/authorization';

// ═══════════════════════════════════════════════════
// MemberService — For Authenticated Mandal Members
// Scoped to user's active mandal via @restrict + $user.mandalId.
// ═══════════════════════════════════════════════════
@(requires: 'authenticated-user')
@impl: 'srv/handlers/member-service.js'
service MemberService @(path: '/api/member') {

  // ─── My Profile ───
  @cds.redirection.target
  @odata.draft.enabled
  @restrict: [{ grant: '*', where: 'ID = $user.userId' }]
  entity MyProfile as projection on Users;

  // ─── My Mandals (memberships) ───
  @readonly
  @restrict: [{ grant: 'READ', where: 'user_ID = $user.userId' }]
  entity MyMandals as projection on MandalMemberships;

  // MemberDirectory needs join through MandalMemberships — scoped in handler
  @readonly entity MemberDirectory as projection on Users {
    ID, full_name, first_name, last_name, email, phone, profile_picture, profile_picture_type, profile_picture_name
  };

  // ─── My Positions ───
  @readonly
  @restrict: [{ grant: 'READ', where: 'user_ID = $user.userId and mandal_ID = $user.mandalId' }]
  entity MyPositions as projection on UserPositionAssignments;

  // ─── Events ───
  @readonly
  @restrict: [{ grant: 'READ', where: 'mandal_ID = $user.mandalId' }]
  entity MandalEvents as projection on Events;
  @readonly
  @restrict: [{ grant: 'READ', where: 'mandal_ID = $user.mandalId' }]
  entity MyAttendance as projection on EventAttendance;

  // ─── Fines ───
  @readonly
  @restrict: [{ grant: 'READ', where: 'mandal_ID = $user.mandalId' }]
  entity MyFines as projection on Fines;

  // ─── Courses ───
  @readonly
  @restrict: [{ grant: 'READ', where: 'mandal_ID = $user.mandalId' }]
  entity MandalCourses as projection on Courses;
  @readonly entity Topics as projection on SyllabusTopics;
  @readonly
  @restrict: [{ grant: 'READ', where: 'mandal_ID = $user.mandalId' }]
  entity MyCourseAssignments as projection on CourseAssignments;
  @readonly entity MyCourseProgress as projection on CourseTopicProgress;

  // ─── Ledger (read-only, visibility controlled by dynamic permissions) ───
  @readonly
  @restrict: [{ grant: 'READ', where: 'mandal_ID = $user.mandalId' }]
  entity Ledger as projection on LedgerEntries;

  // ─── App Access Grants (read-only — see which admin apps I can access) ───
  @readonly
  @restrict: [{ grant: 'READ', where: 'user_ID = $user.userId and mandal_ID = $user.mandalId' }]
  entity MyAppGrants as projection on AppAccessGrants;

  // ─── Actions ───
  // Pay a fine — member submits payment details
  action payFine(fineId : UUID, amount : Decimal, payment_mode : String, payment_reference : String) returns String;
}
