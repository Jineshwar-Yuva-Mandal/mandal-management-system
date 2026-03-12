using { com.samanvay.Mandals } from '../db/mandal';
using { com.samanvay.Users } from '../db/users';
using { com.samanvay.MembershipRequests } from '../db/membership';
using { com.samanvay.MandalMemberFieldConfigs } from '../db/member_field_config';

// ═══════════════════════════════════════════════════
// PublicService — For Unauthenticated / New Users
// Create mandal, browse mandals, submit membership request
// ═══════════════════════════════════════════════════
service PublicService @(path: '/api/public') {

  // ─── Browse Mandals (read-only, limited fields) ───
  @readonly entity BrowseMandals as projection on Mandals {
    ID, name, area, city, state, logo, has_joining_fee, joining_fee
  };

  // ─── Registration Form Field Config (read-only) ───
  // Frontend reads this to render dynamic registration form per mandal
  @readonly entity FieldConfig as projection on MandalMemberFieldConfigs;

  // ─── Membership Requests ───
  // New users submit a request to join a mandal
  @insertonly entity JoinRequests as projection on MembershipRequests;

  // ─── Actions ───
  // Create a new mandal — creator becomes the superadmin
  action createMandal(
    name : String, area : String, city : String, state : String,
    creatorEmail : String, creatorName : String, creatorPhone : String
  ) returns BrowseMandals;

  // Register a new user account on the platform
  action registerUser(
    email : String, full_name : String, phone : String, password : String
  ) returns { userId : UUID; };
}
