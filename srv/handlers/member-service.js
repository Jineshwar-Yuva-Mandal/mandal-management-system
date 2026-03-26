const cds = require('@sap/cds');

module.exports = class MemberService extends cds.ApplicationService {

  async init() {
    const {
      Users, MandalMemberships,
      Fines, MembershipRequests, Mandals
    } = cds.entities('com.samanvay');

    // ── Scope: MyProfile — ensure member can only update their own profile ──
    this.before(['UPDATE', 'PATCH'], 'MyProfile', async (req) => {
      const userId = req.user.attr.userId;
      if (!userId) { req.reject(403, 'No active membership'); return; }
      if (req.data.ID && req.data.ID !== userId) {
        req.reject(403, 'Cannot modify another user\'s profile');
      }
    });

    // ── Scope: MemberDirectory — only members of the same mandal ──
    // No direct mandal_ID on Users — requires join through MandalMemberships
    this.before('READ', 'MemberDirectory', async (req) => {
      const mandalId = req.user.attr.mandalId;
      if (!mandalId) { req.reject(403, 'No active membership'); return; }
      const memberships = await SELECT.from(MandalMemberships)
        .where({ mandal_ID: mandalId, membership_status: 'active' })
        .columns('user_ID');
      const userIds = memberships.map(m => m.user_ID);
      if (userIds.length === 0) { req.reject(404, 'No members found'); return; }
      req.query.where({ ID: { in: userIds } });
    });

    // ── payFine — member records a fine payment ──
    this.on('payFine', async (req) => {
      const { fineId, amount, payment_mode, payment_reference } = req.data;
      if (!fineId) return req.reject(400, 'fineId is required');
      if (!amount || amount <= 0) return req.reject(400, 'Valid payment amount is required');

      const { userId, mandalId } = req.user.attr;
      if (!userId || !mandalId) return req.reject(403, 'No active membership');

      const fine = await SELECT.one.from(Fines)
        .where({ ID: fineId, user_ID: userId, mandal_ID: mandalId });
      if (!fine) return req.reject(404, 'Fine not found');
      if (fine.status !== 'pending') {
        return req.reject(409, `Fine is '${fine.status}', payment only allowed when 'pending'`);
      }

      await UPDATE(Fines, fineId).set({
        status: 'paid',
        paid_amount: amount,
        paid_date: new Date().toISOString().slice(0, 10),
        payment_mode: payment_mode || null,
        payment_reference: payment_reference || null
      });
    });

    // ── requestMembership — member requests to join a mandal ──
    this.on('requestMembership', async (req) => {
      const { mandalId } = req.data;
      if (!mandalId) return req.reject(400, 'mandalId is required');

      const userId = req.user.attr.userId;
      if (!userId) return req.reject(403, 'Not authenticated');

      const user = await SELECT.one.from(Users).where({ ID: userId });
      if (!user) return req.reject(404, 'User not found');

      // Check mandal exists
      const mandal = await SELECT.one.from(Mandals).where({ ID: mandalId }).columns('ID', 'has_joining_fee', 'joining_fee');
      if (!mandal) return req.reject(404, 'Mandal not found');

      // Check if already a member
      const existing = await SELECT.one.from(MandalMemberships)
        .where({ user_ID: userId, mandal_ID: mandalId });
      if (existing && existing.membership_status === 'active') {
        return req.reject(409, 'You are already a member of this mandal');
      }

      // Check if a pending request already exists
      const pendingRequest = await SELECT.one.from(MembershipRequests)
        .where({ user_ID: userId, mandal_ID: mandalId, status: 'submitted' });
      if (pendingRequest) {
        return req.reject(409, 'You already have a pending request for this mandal');
      }

      await INSERT.into(MembershipRequests).entries({
        ID: cds.utils.uuid(),
        requester_name: user.full_name,
        requester_email: user.email,
        requester_phone: user.phone,
        user_ID: userId,
        mandal_ID: mandalId,
        status: mandal.has_joining_fee ? 'payment_pending' : 'submitted',
        fee_amount: mandal.has_joining_fee ? mandal.joining_fee : 0
      });
    });

    await super.init();
  }
};
