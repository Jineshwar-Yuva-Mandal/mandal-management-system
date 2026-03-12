namespace com.samanvay;

using { managed, cuid } from '@sap/cds/common';

using { com.samanvay.Users } from './users';

entity Mandals : managed, cuid {
  name        : String(100) @assert.unique;
  area        : String(100);
  city        : String(50);
  state       : String(50);
  logo        : LargeBinary @Core.MediaType: 'image/png';

  // Joining fee configuration (optional per mandal)
  joining_fee       : Decimal(10,2) default 0;
  has_joining_fee   : Boolean default false;
  
  // Relationship: One Mandal has one Primary Admin (creator / transferred)
  admin       : Association to Users;
  
  // Relationship: Mandal members via join table
  memberships : Association to many MandalMemberships on memberships.mandal = $self;
}

// ─── Many-to-Many: User ↔ Mandal ───
// A user can belong to multiple mandals; each membership tracks status, role, dates
entity MandalMemberships : managed, cuid {
  user              : Association to Users;
  mandal            : Association to Mandals;
  membership_status : String enum { active; inactive; pending; suspended; } default 'pending';
  membership_number : String(50);       // Mandal-assigned membership ID
  is_admin          : Boolean default false;  // Is this user an admin of this mandal?
  joined_date       : Date;
  left_date         : Date;             // null = still active
  remarks           : String(500);
}

// Data Integrity: The DB level lock for uniqueness
annotate Mandals with @(
  unique: { mandalIdentity: [ name, area, city, state ] }
);