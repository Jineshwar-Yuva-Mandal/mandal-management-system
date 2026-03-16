const cds = require('@sap/cds');

module.exports = class PlatformAdminService extends cds.ApplicationService {

  async init() {
    const { Users, Mandals, MandalMemberships } = cds.entities('com.samanvay');

    // ── setPlatformRole — promote/demote a user's platform role ──
    this.on('setPlatformRole', async (req) => {
      const { userId, role } = req.data;
      if (!userId) return req.reject(400, 'userId is required');
      if (!['platform_admin', 'member'].includes(role)) {
        return req.reject(400, "role must be 'platform_admin' or 'member'");
      }

      const user = await SELECT.one.from(Users).where({ ID: userId });
      if (!user) return req.reject(404, 'User not found');

      await UPDATE(Users, userId).set({ role });
    });

    // ── suspendMandal — suspend a mandal (sets all memberships to suspended) ──
    this.on('suspendMandal', async (req) => {
      const { mandalId, reason } = req.data;
      if (!mandalId) return req.reject(400, 'mandalId is required');

      const mandal = await SELECT.one.from(Mandals).where({ ID: mandalId });
      if (!mandal) return req.reject(404, 'Mandal not found');

      // Suspend all active memberships
      await UPDATE(MandalMemberships)
        .set({ membership_status: 'suspended', remarks: reason || 'Suspended by platform admin' })
        .where({ mandal_ID: mandalId, membership_status: 'active' });
    });

    // ── reactivateMandal — reactivate suspended memberships ──
    this.on('reactivateMandal', async (req) => {
      const { mandalId } = req.data;
      if (!mandalId) return req.reject(400, 'mandalId is required');

      const mandal = await SELECT.one.from(Mandals).where({ ID: mandalId });
      if (!mandal) return req.reject(404, 'Mandal not found');

      await UPDATE(MandalMemberships)
        .set({ membership_status: 'active', remarks: 'Reactivated by platform admin' })
        .where({ mandal_ID: mandalId, membership_status: 'suspended' });
    });

    // ── removeUserFromMandal — remove a user from a specific mandal ──
    this.on('removeUserFromMandal', async (req) => {
      const { userId, mandalId, reason } = req.data;
      if (!userId || !mandalId) return req.reject(400, 'userId and mandalId are required');

      const membership = await SELECT.one.from(MandalMemberships)
        .where({ user_ID: userId, mandal_ID: mandalId });
      if (!membership) return req.reject(404, 'Membership not found');

      await UPDATE(MandalMemberships, membership.ID).set({
        membership_status: 'inactive',
        left_date: new Date().toISOString().slice(0, 10),
        remarks: reason || 'Removed by platform admin'
      });

      // If the removed user was the mandal admin, clear the admin reference
      const mandal = await SELECT.one.from(Mandals).where({ ID: mandalId });
      if (mandal?.admin_ID === userId) {
        await UPDATE(Mandals, mandalId).set({ admin_ID: null });
      }
    });

    await super.init();
  }
};
