namespace com.samanvay;

using { com.samanvay.Mandals } from './mandal';
using { com.samanvay.Users } from './users';
using { com.samanvay.LedgerEntryType, com.samanvay.LedgerDirection, com.samanvay.LedgerStatus } from './types';
using { managed, cuid } from '@sap/cds/common';

// ─── Mandal Account Ledger ───
// Central financial record for each mandal
// Entries are created when verified fine payments, donations, expenses, etc. are recorded
entity LedgerEntries : managed, cuid {
  mandal        : Association to Mandals;
  entry_date    : Date;
  type          : LedgerEntryType;
  description   : String(500);
  amount        : Decimal(10,2);
  direction     : LedgerDirection;  // credit = money in, debit = money out

  // Who is this entry related to (member paying fine, donor, vendor, etc.)
  related_user  : Association to Users;

  // Verification trail
  recorded_by   : Association to Users;   // Who created this entry
  verified_by   : Association to Users;   // Koshadhyaksha who verified
  verified_at   : Timestamp;
  status        : LedgerStatus default 'draft';
  remarks       : String(500);

  // Running balance snapshot at time of entry
  balance_after : Decimal(12,2);
}
