namespace com.samanvay;

using { managed, cuid } from '@sap/cds/common';

using { com.samanvay.Users } from './users';
using { com.samanvay.MembershipStatus } from './types';
using { com.samanvay.MandalMemberFieldConfigs } from './member_field_config';

entity Mandals : managed, cuid {
  name        : String(100) @assert.unique;
  area        : String(100);
  city        : String(50);
  state       : String(50);
  logo              : LargeBinary @Core.MediaType: logo_type @Core.ContentDisposition.Type: 'inline' @Core.ContentDisposition.Filename: logo_name;
  logo_type         : String default 'image/png' @Core.IsMediaType;
  logo_name         : String default 'logo.png';

  // Joining fee configuration (optional per mandal)
  joining_fee       : Decimal(10,2) default 0;
  has_joining_fee   : Boolean default false;

  // Payment QR code for receiving joining fees / dues
  payment_qr        : LargeBinary @Core.MediaType: payment_qr_type @Core.ContentDisposition.Type: 'inline' @Core.ContentDisposition.Filename: payment_qr_name;
  payment_qr_type   : String default 'image/png' @Core.IsMediaType;
  payment_qr_name   : String default 'qr.png';
  payment_upi_id    : String(100);  // e.g., "mandalname@upi"
  
  // Relationship: One Mandal has one Primary Admin (creator / transferred)
  admin       : Association to Users;
  
  // Relationship: Mandal members via join table
  memberships : Association to many MandalMemberships on memberships.mandal = $self;

  // Registration field configuration
  fieldConfigs : Composition of many MandalMemberFieldConfigs on fieldConfigs.mandal = $self;
}

// ─── Many-to-Many: User ↔ Mandal ───
// A user can belong to multiple mandals; each membership tracks status, role, dates
entity MandalMemberships : managed, cuid {
  user              : Association to Users;
  mandal            : Association to Mandals;
  membership_status : MembershipStatus default 'pending';
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