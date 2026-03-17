namespace com.samanvay;

using { com.samanvay.Mandals } from './mandal';
using { com.samanvay.Users } from './users';
using { com.samanvay.Positions } from './authorization';
using { com.samanvay.LedgerEntries } from './ledger';
using { com.samanvay.WorkflowType, com.samanvay.WorkflowActionType,
        com.samanvay.RequestStatus, com.samanvay.PaymentMode,
        com.samanvay.ApprovalDecision } from './types';
using { managed, cuid } from '@sap/cds/common';

// ═══════════════════════════════════════════════════
// PART 1: Approval Workflow Configuration
// Superadmin configures: who gets notified and who must approve
// ═══════════════════════════════════════════════════

// ─── Approval Workflow Config per Mandal ───
// Defines which workflow type (joining, mandal_creation, etc.) and what approvals are needed
entity ApprovalWorkflows : managed, cuid {
  mandal        : Association to Mandals;
  workflow_type : WorkflowType;
  min_approvals : Integer default 1;  // At least 1 approval required
  steps         : Composition of many ApprovalWorkflowSteps on steps.workflow = $self;
}

// ─── Approval Workflow Steps ───
// Each step defines a position/user that must approve or is just notified
entity ApprovalWorkflowSteps : managed, cuid {
  workflow      : Association to ApprovalWorkflows;
  sequence      : Integer;          // Order of approval
  position      : Association to Positions;  // e.g., Koshadhyaksha, Sanchalak
  action_type   : WorkflowActionType;
}

// ═══════════════════════════════════════════════════
// PART 2: Membership Requests (Join existing Mandal)
// ═══════════════════════════════════════════════════

// ─── Membership Request ───
// A user requests to join a mandal; tracks payment + approval lifecycle
entity MembershipRequests : managed, cuid {
  // Who is requesting
  requester_name  : String(100);
  requester_email : String(255);
  requester_phone : String(20);
  user            : Association to Users;  // Linked after account is created or if already exists

  mandal          : Association to Mandals;
  status          : RequestStatus default 'submitted';

  // Joining fee payment
  fee_amount        : Decimal(10,2);        // Copied from mandal's joining_fee at time of request
  paid_amount       : Decimal(10,2);
  paid_date         : Date;
  payment_mode      : PaymentMode;
  payment_reference : String(255);
  payment_verified  : Boolean default false;
  payment_verified_by : Association to Users;

  // Ledger link once approved and fee settled
  ledger_entry    : Association to LedgerEntries;

  // Approvals
  approvals       : Composition of many MembershipApprovals on approvals.request = $self;
  remarks         : String(500);
}

// ─── Membership Approvals ───
// Each required approver signs off on the membership request
entity MembershipApprovals : managed, cuid {
  request       : Association to MembershipRequests;
  approver      : Association to Users;
  position      : Association to Positions;  // In what capacity they are approving
  decision      : ApprovalDecision default 'pending';
  decided_at    : Timestamp;
  remarks       : String(500);
}

