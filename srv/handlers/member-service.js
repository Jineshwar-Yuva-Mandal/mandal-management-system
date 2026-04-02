const cds = require('@sap/cds');

module.exports = class MemberService extends cds.ApplicationService {

  async init() {
    const {
      MandalMemberships,
      Fines,
      Courses, CourseAssignments
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

    // ── Scope: Topics — no mandal_ID, joined via course ──
    this.before('READ', 'Topics', async (req) => {
      const mandalId = req.user.attr?.mandalId;
      if (!mandalId) { req.reject(403, 'No active membership'); return; }
      const courses = await SELECT.from(Courses)
        .where({ mandal_ID: mandalId }).columns('ID');
      const courseIds = courses.map(c => c.ID);
      if (courseIds.length === 0) { req.query.where({ ID: null }); return; }
      req.query.where({ course_ID: { in: courseIds } });
    });

    // ── Scope: MyCourseProgress — no mandal_ID, joined via assignment ──
    this.before('READ', 'MyCourseProgress', async (req) => {
      const mandalId = req.user.attr?.mandalId;
      if (!mandalId) { req.reject(403, 'No active membership'); return; }
      const assignments = await SELECT.from(CourseAssignments)
        .where({ mandal_ID: mandalId }).columns('ID');
      const assignIds = assignments.map(a => a.ID);
      if (assignIds.length === 0) { req.query.where({ ID: null }); return; }
      req.query.where({ assignment_ID: { in: assignIds } });
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

      return 'Payment recorded successfully';
    });

    await super.init();
  }
};
