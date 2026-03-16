using { com.samanvay.Mandals, com.samanvay.MandalMemberships } from '../../db/mandal';
using { com.samanvay.Users } from '../../db/users';
using { com.samanvay.ProtectedEntities, com.samanvay.ProtectedFields } from '../../db/authorization';
using { com.samanvay.LedgerEntries } from '../../db/ledger';

// ═══════════════════════════════════════════════════
// PlatformAdminService — For the SaaS platform owner
// Full visibility & control across ALL mandals, users, and system config
// ═══════════════════════════════════════════════════
@(requires: 'platform_admin')
@impl: 'srv/handlers/platform-service.js'
service PlatformAdminService @(path: '/api/platform') {

  // ─── All Mandals (cross-mandal view) ───
  entity AllMandals as projection on Mandals;
  entity AllMemberships as projection on MandalMemberships;

  // ─── All Users ───
  @cds.redirection.target
  entity AllUsers as projection on Users;

  // ─── All Ledger Entries (cross-mandal) ───
  entity AllLedgerEntries as projection on LedgerEntries;

  // ─── System Seed Data Management ───
  // Manage the master list of protected entities & fields
  entity ProtectedEntityList as projection on ProtectedEntities;
  entity ProtectedFieldList as projection on ProtectedFields;

  // ─── Platform Actions ───
  // Promote/demote a user to platform_admin
  action setPlatformRole(userId : UUID, role : String enum { platform_admin; member; });
  // Suspend a mandal
  action suspendMandal(mandalId : UUID, reason : String);
  // Reactivate a suspended mandal
  action reactivateMandal(mandalId : UUID);
  // Force-remove a user from a mandal
  action removeUserFromMandal(userId : UUID, mandalId : UUID, reason : String);
}
