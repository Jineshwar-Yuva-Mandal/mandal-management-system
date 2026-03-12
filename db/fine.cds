namespace com.samanvay;

using { com.samanvay.Mandals } from './mandal';
using { com.samanvay.Users } from './users';
using { com.samanvay.Events } from './event';
using { com.samanvay.LedgerEntries } from './ledger';
using { managed, cuid } from '@sap/cds/common';

// ─── Fines ───
// Auto-generated when a member is marked absent for a fine-applicable event
// Tracks full lifecycle: pending → paid → verified → settled (added to ledger)
entity Fines : managed, cuid {
  user          : Association to Users;          // Member who owes the fine
  event         : Association to Events;         // Event that triggered the fine
  mandal        : Association to Mandals;
  amount        : Decimal(10,2);
  status        : String enum {
    pending;      // Fine created, awaiting payment
    paid;         // Member claims they paid
    verified;     // Koshadhyaksha verified the payment
    rejected;     // Payment verification rejected
    waived;       // Fine waived by admin
  } default 'pending';
  due_date      : Date;

  // Payment details — filled when member pays
  paid_amount   : Decimal(10,2);
  paid_date     : Date;
  payment_mode  : String enum { cash; upi; bank_transfer; other; };
  payment_reference : String(255);  // UPI transaction ID, receipt number, etc.

  // Verification — filled by Koshadhyaksha
  verified_by   : Association to Users;
  verified_at   : Timestamp;
  verification_remarks : String(500);

  // Link to ledger entry once verified and settled
  ledger_entry  : Association to LedgerEntries;
}
