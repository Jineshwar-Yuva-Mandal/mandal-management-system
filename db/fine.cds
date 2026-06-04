namespace com.samanvay;

using { com.samanvay.Mandals } from './mandal';
using { com.samanvay.Users } from './users';
using { com.samanvay.Events } from './event';
using { com.samanvay.LedgerEntries } from './ledger';
using { com.samanvay.FineStatus, com.samanvay.PaymentMode } from './types';
using { managed, cuid } from '@sap/cds/common';

// ─── Fines ───
// Auto-generated when a member is marked absent for a fine-applicable event
// Lifecycle: pending → paid (admin marks after receiving payment) → ledger entry created
entity Fines : managed, cuid {
  user          : Association to Users;          // Member who owes the fine
  event         : Association to Events;         // Event that triggered the fine
  mandal        : Association to Mandals;
  amount        : Decimal(10,2);
  status        : FineStatus default 'pending';
  due_date      : Date;

  // Payment details — filled by admin when payment is received
  paid_amount   : Decimal(10,2);
  paid_date     : Date;
  payment_mode  : PaymentMode;
  payment_reference : String(255);  // UPI transaction ID, receipt number, etc.

  // Admin who recorded the payment
  recorded_by   : Association to Users;
  recorded_at   : Timestamp;
  remarks       : String(500);

  // Link to ledger entry once settled
  ledger_entry  : Association to LedgerEntries;
}
