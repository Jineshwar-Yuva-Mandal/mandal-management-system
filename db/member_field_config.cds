namespace com.samanvay;

using { com.samanvay.Mandals } from './mandal';
using { com.samanvay.ProtectedFields } from './authorization';
using { managed, cuid } from '@sap/cds/common';

// ─── Mandal Member Field Configuration ───
// Superadmin selects which User fields are required, optional, or hidden
// for their mandal's membership registration form
// Reuses ProtectedFields (master list of User entity fields) from authorization.cds
entity MandalMemberFieldConfigs : managed, cuid {
  mandal        : Association to Mandals;
  field         : Association to ProtectedFields;  // Which field from Users entity
  requirement   : String enum {
    required;    // Must be filled during registration
    optional;    // Shown but not mandatory
    hidden;      // Not shown on the joining form
  } default 'optional';
  sequence      : Integer;   // Display order on the form
  custom_label  : String(100);  // Mandal can override the default field label
}
