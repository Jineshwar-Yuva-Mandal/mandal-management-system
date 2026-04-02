namespace com.samanvay;

using { com.samanvay.Users } from './users';
using { com.samanvay.Mandals } from './mandal';
using { managed, cuid } from '@sap/cds/common';

// ─── Configurable Positions per Mandal ───
// Each mandal defines its own committee positions (e.g., Koshadhyaksha, Sanchalak, Karyadhyaksha)
entity Positions : managed, cuid {
  name          : String(50);   // e.g., "Koshadhyaksha", "Sanchalak"
  description   : String(255);
  mandal        : Association to Mandals;
  permissions   : Composition of many EntityPermissions on permissions.position = $self;
  members       : Composition of many UserPositionAssignments on members.position = $self;
}

// ─── Assign Users to Positions within a Mandal ───
// A user can hold multiple positions; a position can be held by multiple users
entity UserPositionAssignments : managed, cuid {
  user          : Association to Users;
  position      : Association to Positions;
  mandal        : Association to Mandals;
  valid_from    : Date;
  valid_to      : Date;  // null = currently active
}

// ─── Master list of entities that can be permission-controlled ───
// Seeded with your entity names (Users, Ledger, Events, Courses, etc.)
entity ProtectedEntities : cuid {
  name          : String(100) @assert.unique;  // e.g., "Users", "Ledger", "Events"
  description   : String(255);
  fields        : Composition of many ProtectedFields on fields.entity = $self;
}

// ─── Master list of fields per entity ───
// Seeded with actual field names from your data model
entity ProtectedFields : cuid {
  entity        : Association to ProtectedEntities;
  field_name    : String(100);  // e.g., "email", "phone", "dob", "amount"
  label         : String(100);  // e.g., "Email Address", "Phone Number"
}

// ─── Entity-level CRUD permissions per Position ───
// Superadmin configures: "Koshadhyaksha can Read+Update Ledger, but not Delete"
entity EntityPermissions : managed, cuid {
  position      : Association to Positions;
  entity        : Association to ProtectedEntities;
  can_create    : Boolean default false;
  can_read      : Boolean default false;
  can_update    : Boolean default false;
  can_delete    : Boolean default false;
  field_permissions : Composition of many FieldPermissions on field_permissions.entity_permission = $self;
}

// ─── Field-level visibility/editability per Position per Entity ───
// Superadmin configures: "Koshadhyaksha can see 'amount' in Ledger, but members cannot"
entity FieldPermissions : managed, cuid {
  entity_permission : Association to EntityPermissions;
  field             : Association to ProtectedFields;
  visible           : Boolean default true;
  editable          : Boolean default false;
}

// ─── App Access Grants ───
// Mandal admin can grant regular members access to specific admin apps.
// A member with a grant sees and operates that admin app like the admin would.
entity AppAccessGrants : managed, cuid {
  user    : Association to Users;
  mandal  : Association to Mandals;
  app_key : String(100);  // e.g., "joinrequests", "fines", "ledger", "eventsandattendance", "courses", "members", "positions", "mandal"
}
