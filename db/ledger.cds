namespace com.samanvay;

using { com.samanvay.Mandals } from './mandal';
using { com.samanvay.Users } from './users';
using { managed, cuid } from '@sap/cds/common';

// ─── Mandal Account Ledger ───
// Central financial record for each mandal
// Entries are created when verified fine payments, donations, expenses, etc. are recorded
entity LedgerEntries : managed, cuid {
  mandal        : Association to Mandals;
  entry_date    : Date;
  type          : String enum {
    fine_income;       // Fine payment received
    joining_fee;       // Membership joining fee
    donation;          // Voluntary donation
    event_expense;     // Expense for organizing event
    course_expense;    // Expense for courses/materials
    misc_income;       // Other income
    misc_expense;      // Other expense
  };
  description   : String(500);
  amount        : Decimal(10,2);
  direction     : String enum { credit; debit; };  // credit = money in, debit = money out

  // Who is this entry related to (member paying fine, donor, vendor, etc.)
  related_user  : Association to Users;

  // Verification trail
  recorded_by   : Association to Users;   // Who created this entry
  verified_by   : Association to Users;   // Koshadhyaksha who verified
  verified_at   : Timestamp;
  status        : String enum { draft; verified; disputed; } default 'draft';
  remarks       : String(500);

  // Running balance snapshot at time of entry
  balance_after : Decimal(12,2);
}
