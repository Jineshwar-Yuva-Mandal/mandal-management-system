using { com.samanvay.Mandals } from '../../db/membership';
using { com.samanvay.MandalMemberships } from '../../db/mandal';
using { com.samanvay.Users } from '../../db/users';
using { com.samanvay.MembershipRequests } from '../../db/membership';
using { com.samanvay.MandalMemberFieldConfigs } from '../../db/member_field_config';

// ═══════════════════════════════════════════════════
// PublicService — For Unauthenticated / New Users
// Create mandal, browse mandals, submit membership request
// ═══════════════════════════════════════════════════
@impl: 'srv/handlers/public-service.js'
@open
service PublicService @(path: '/api/public') {

  // ─── Browse Mandals (read-only, limited fields) ───
  @readonly entity BrowseMandals as projection on Mandals {
    ID, name, area, city, state, logo, has_joining_fee, joining_fee
  };

  // ─── Registration Form Field Config (read-only) ───
  @readonly entity FieldConfig as projection on MandalMemberFieldConfigs;

  // ─── New User Registration (insert-only, limited fields) ───
  // CAP enforces @assert.unique on email automatically via generic handlers
  @insertonly entity NewUser as projection on Users {
    ID, email, full_name, first_name, last_name, phone, role
  };

  // ─── Membership Requests ───
  @insertonly entity JoinRequests as projection on MembershipRequests;

  // ─── Functions ───
  function getAuthConfig() returns { url : String; anonKey : String; };

  function getUserByAuthId(authId : String) returns {
    ID : UUID;
    email : String;
    full_name : String;
    phone : String;
  };

  // ─── Actions ───
  // Create a new mandal — multi-entity transaction (User + Mandal + Membership)
  action createMandal(
    name : String, area : String, city : String, state : String,
    creatorEmail : String, creatorName : String, creatorPhone : String,
    authId : String
  ) returns BrowseMandals;
}
