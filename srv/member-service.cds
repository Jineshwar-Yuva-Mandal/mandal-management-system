using { com.samanvay.Mandals, com.samanvay.MandalMemberships } from '../db/mandal';
using { com.samanvay.Users } from '../db/users';
using { com.samanvay.Events, com.samanvay.EventAttendance } from '../db/event';
using { com.samanvay.Fines } from '../db/fine';
using { com.samanvay.LedgerEntries } from '../db/ledger';
using { com.samanvay.Courses, com.samanvay.SyllabusTopics,
        com.samanvay.CourseAssignments, com.samanvay.CourseTopicProgress } from '../db/course';
using { com.samanvay.MembershipRequests } from '../db/membership';
using { com.samanvay.Positions, com.samanvay.UserPositionAssignments } from '../db/authorization';

// ═══════════════════════════════════════════════════
// MemberService — For Authenticated Mandal Members
// Scoped to user's mandal(s). If member of multiple, they select active mandal.
// ═══════════════════════════════════════════════════
@(requires: 'authenticated-user')
service MemberService @(path: '/api/member') {

  // ─── My Profile ───
  @cds.redirection.target
  @odata.draft.enabled
  entity MyProfile as projection on Users;

  // ─── My Mandals & Memberships ───
  @readonly entity MyMandals as projection on MandalMemberships;
  @readonly entity MyMandal as projection on Mandals;  // Active mandal detail
  @readonly entity MemberDirectory as projection on Users {
    ID, full_name, first_name, last_name, email, phone, profile_picture
  };

  // ─── My Positions ───
  @readonly entity MyPositions as projection on UserPositionAssignments;
  @readonly entity MandalPositions as projection on Positions;

  // ─── Events ───
  @readonly entity MandalEvents as projection on Events;
  @readonly entity MyAttendance as projection on EventAttendance;

  // ─── Fines ───
  @readonly entity MyFines as projection on Fines;  // Filtered to current user in handler

  // ─── Courses ───
  @readonly entity MandalCourses as projection on Courses;
  @readonly entity Topics as projection on SyllabusTopics;
  @readonly entity MyCourseAssignments as projection on CourseAssignments;
  @readonly entity MyCourseProgress as projection on CourseTopicProgress;

  // ─── Ledger (read-only, visibility controlled by dynamic permissions) ───
  @readonly entity Ledger as projection on LedgerEntries;

  // ─── Actions ───
  // Select active mandal context (for members of multiple mandals)
  action selectMandal(mandalId : UUID);
  // Pay a fine — member submits payment details
  action payFine(fineId : UUID, amount : Decimal, payment_mode : String, payment_reference : String);
  // Request to join a different mandal
  action requestMembership(mandalId : UUID);
}
