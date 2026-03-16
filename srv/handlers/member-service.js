const cds = require('@sap/cds');

module.exports = class MemberService extends cds.ApplicationService {

  async init() {
    const {
      Users, MandalMemberships,
      Fines, MembershipRequests, Mandals
    } = cds.entities('com.samanvay');

    /**
     * Resolve the member's active mandal and user record.
     * req.user.id is the email, set by our custom Supabase auth strategy.
     */
    const getMemberContext = async (req) => {
      const email = req.user?.id;
      if (!email) return null;

      const user = await SELECT.one.from(Users).where({ email }).columns('ID');
      if (!user) return null;

      // Get the member's active membership (pick first active if multiple)
      const membership = await SELECT.one.from(MandalMemberships)
        .where({ user_ID: user.ID, membership_status: 'active' })
        .columns('mandal_ID', 'is_admin');

      if (!membership) return null;
      return { userId: user.ID, mandalId: membership.mandal_ID, isAdmin: membership.is_admin };
    };

    // ── Scope: MyProfile — only the authenticated user's own record ──
    this.before('READ', 'MyProfile', async (req) => {
      const ctx = await getMemberContext(req);
      if (!ctx) { req.reject(403, 'No active membership'); return; }
      req.query.where({ ID: ctx.userId });
    });

    this.before(['UPDATE', 'PATCH'], 'MyProfile', async (req) => {
      const ctx = await getMemberContext(req);
      if (!ctx) { req.reject(403, 'No active membership'); return; }
      // Ensure member can only update their own profile
      if (req.data.ID && req.data.ID !== ctx.userId) {
        req.reject(403, 'Cannot modify another user\'s profile');
      }
    });

    // ── Scope: MyMandals — only the authenticated user's memberships ──
    this.before('READ', 'MyMandals', async (req) => {
      const email = req.user?.id;
      if (!email) { req.reject(403, 'Not authenticated'); return; }
      const user = await SELECT.one.from(Users).where({ email }).columns('ID');
      if (!user) { req.reject(403, 'User not found'); return; }
      req.query.where({ user_ID: user.ID });
    });

    // ── Scope: MemberDirectory — only members of the same mandal ──
    this.before('READ', 'MemberDirectory', async (req) => {
      const ctx = await getMemberContext(req);
      if (!ctx) { req.reject(403, 'No active membership'); return; }
      const memberships = await SELECT.from(MandalMemberships)
        .where({ mandal_ID: ctx.mandalId, membership_status: 'active' })
        .columns('user_ID');
      const userIds = memberships.map(m => m.user_ID);
      if (userIds.length === 0) { req.reject(404, 'No members found'); return; }
      req.query.where({ ID: { in: userIds } });
    });

    // ── Scope: entities with mandal_ID — restrict to member's mandal ──
    const mandalScopedEntities = [
      'MandalPositions', 'MyPositions',
      'MandalEvents', 'MyAttendance', 'MyFines', 'Ledger',
      'MandalCourses', 'MyCourseAssignments'
    ];

    for (const entity of mandalScopedEntities) {
      this.before('READ', entity, async (req) => {
        const ctx = await getMemberContext(req);
        if (!ctx) { req.reject(403, 'No active membership'); return; }
        req.query.where({ mandal_ID: ctx.mandalId });
      });
    }

    // ── Scope: MyMandal — single mandal by ID ──
    this.before('READ', 'MyMandal', async (req) => {
      const ctx = await getMemberContext(req);
      if (!ctx) return;
      req.query.where({ ID: ctx.mandalId });
    });

    // ── Scope: Topics — no direct mandal_ID, goes through Course ──
    // Topics are composition of Courses, so CDS handles the filter via navigation

    // ── selectMandal action — for members of multiple mandals ──
    this.on('selectMandal', async (req) => {
      const { mandalId } = req.data;
      if (!mandalId) return req.reject(400, 'mandalId is required');
      return { mandalId };
    });

    // ── payFine — member records a fine payment ──
    this.on('payFine', async (req) => {
      const { fineId, amount, payment_mode, payment_reference } = req.data;
      if (!fineId) return req.reject(400, 'fineId is required');
      if (!amount || amount <= 0) return req.reject(400, 'Valid payment amount is required');

      const ctx = await getMemberContext(req);
      if (!ctx) return req.reject(403, 'No active membership');

      const fine = await SELECT.one.from(Fines)
        .where({ ID: fineId, user_ID: ctx.userId, mandal_ID: ctx.mandalId });
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

      const email = req.user?.id;
      if (!email) return req.reject(403, 'Not authenticated');

      const user = await SELECT.one.from(Users).where({ email });
      if (!user) return req.reject(404, 'User not found');

      // Check mandal exists
      const mandal = await SELECT.one.from(Mandals).where({ ID: mandalId }).columns('ID', 'has_joining_fee', 'joining_fee');
      if (!mandal) return req.reject(404, 'Mandal not found');

      // Check if already a member
      const existing = await SELECT.one.from(MandalMemberships)
        .where({ user_ID: user.ID, mandal_ID: mandalId });
      if (existing && existing.membership_status === 'active') {
        return req.reject(409, 'You are already a member of this mandal');
      }

      // Check if a pending request already exists
      const pendingRequest = await SELECT.one.from(MembershipRequests)
        .where({ user_ID: user.ID, mandal_ID: mandalId, status: 'submitted' });
      if (pendingRequest) {
        return req.reject(409, 'You already have a pending request for this mandal');
      }

      await INSERT.into(MembershipRequests).entries({
        ID: cds.utils.uuid(),
        requester_name: user.full_name,
        requester_email: user.email,
        requester_phone: user.phone,
        user_ID: user.ID,
        mandal_ID: mandalId,
        status: mandal.has_joining_fee ? 'payment_pending' : 'submitted',
        fee_amount: mandal.has_joining_fee ? mandal.joining_fee : 0
      });
    });

    await super.init();
  }
};
