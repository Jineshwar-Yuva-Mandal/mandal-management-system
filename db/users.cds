namespace com.samanvay;

using { com.samanvay.Mandals, com.samanvay.MandalMemberships } from './mandal';
using { com.samanvay.Gender, com.samanvay.MaritalStatus, com.samanvay.BloodGroup,
        com.samanvay.Education, com.samanvay.AnnualIncome, com.samanvay.DietaryPreference,
        com.samanvay.PlatformRole } from './types';
using { managed, cuid, Country } from '@sap/cds/common';

entity Users : managed, cuid {
  // ─── Basic Identity ───
  email             : String(255) @assert.unique;
  full_name         : String(100);
  first_name        : String(50);
  middle_name       : String(50);
  last_name         : String(50);
  phone             : String(20);
  alternate_phone   : String(20);
  whatsapp_number   : String(20);
  profile_picture   : LargeBinary @Core.MediaType: 'image/png';

  // ─── Personal Details ───
  dob               : Date;
  gender            : Gender default 'prefer_not_to_say';
  marital_status    : MaritalStatus default 'prefer_not_to_say';
  blood_group       : BloodGroup default 'NA';
  nationality       : String(50);
  mother_tongue     : String(50);

  // ─── Address ───
  address_line1     : String(255);
  address_line2     : String(255);
  city              : String(50);
  state             : String(50);
  pincode           : String(10);
  country           : Country default '055';

  // ─── Family Details ───
  father_name       : String(100);
  mother_name       : String(100);
  spouse_name       : String(100);
  num_children      : Integer;
  family_members_in_mandal : Integer default 0;  // How many family members are also in the mandal

  // ─── Education & Profession ───
  education         : Education;
  profession        : String(100);
  organization      : String(100);
  designation       : String(100);
  annual_income     : AnnualIncome;

  // ─── Religious / Mandal-specific ───
  gotra             : String(50);       // Family lineage (relevant for Hindu mandals)
  nakshatra         : String(50);       // Birth star
  rashi             : String(50);       // Zodiac sign
  kuldevi           : String(100);      // Family deity
  native_place      : String(100);      // Ancestral village/town
  previous_mandal   : String(100);      // If transferring from another mandal
  reference_member  : String(100);      // Who referred them to this mandal

  // ─── Skills & Interests ───
  skills            : String(500);
  hobbies           : String(500);
  volunteer_interests : String(500);    // e.g., event management, cooking, decoration
  languages_known   : String(255);

  // ─── Health & Emergency ───
  emergency_contact_name  : String(100);
  emergency_contact_phone : String(20);
  emergency_contact_relation : String(50);
  medical_conditions : String(500);     // Allergies, chronic conditions (for event safety)
  dietary_preference : DietaryPreference default 'no_preference';

  // ─── Platform ───
  role              : PlatformRole default 'member'; // platform_admin = SaaS owner, mandal_admin = mandal owner, member = regular member

  // ─── Mandal Memberships (many-to-many) ───
  memberships       : Association to many MandalMemberships on memberships.user = $self;
}