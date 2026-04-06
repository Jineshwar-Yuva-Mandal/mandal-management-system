const cds = require('@sap/cds');
const { Readable } = require('node:stream');

module.exports = class MemberService extends cds.ApplicationService {

  async init() {
    const {
      Users,
      MandalMemberships,
      EventAttendance,
      Events,
      Fines,
      Mandals,
      Courses, CourseAssignments
    } = cds.entities('com.samanvay');

    // ── Scope: MyProfile — resolve profile_picture to base64 data URI ──
    this.after('READ', 'MyProfile', async (data) => {
      for (const row of Array.isArray(data) ? data : [data]) {
        if (!row?.ID) continue;
        // CAP streams LargeBinary separately — must query DB directly
        const user = await SELECT.one(['profile_picture', 'profile_picture_type']).from(Users).where({ ID: row.ID });
        if (user?.profile_picture) {
          const mimeType = user.profile_picture_type || 'image/png';
          let buf;
          if (Buffer.isBuffer(user.profile_picture)) {
            buf = user.profile_picture;
          } else if (user.profile_picture instanceof Readable || typeof user.profile_picture?.read === 'function') {
            const chunks = [];
            for await (const chunk of user.profile_picture) chunks.push(chunk);
            buf = Buffer.concat(chunks);
          } else {
            buf = Buffer.from(user.profile_picture);
          }
          row.profile_picture_url = `data:${mimeType};base64,${buf.toString('base64')}`;
        }
      }
    });

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

    // ── Helper: resolve payment QR for MyFines ──
    async function getPaymentQrBase64(mandalId) {
      const mandal = await SELECT.one(['payment_qr', 'payment_qr_type']).from(Mandals).where({ ID: mandalId });
      if (!mandal?.payment_qr) return null;
      const mimeType = mandal.payment_qr_type || 'image/png';
      let buf;
      if (Buffer.isBuffer(mandal.payment_qr)) {
        buf = mandal.payment_qr;
      } else if (mandal.payment_qr instanceof Readable || typeof mandal.payment_qr?.read === 'function') {
        const chunks = [];
        for await (const chunk of mandal.payment_qr) chunks.push(chunk);
        buf = Buffer.concat(chunks);
      } else {
        buf = Buffer.from(mandal.payment_qr);
      }
      return `data:${mimeType};base64,${buf.toString('base64')}`;
    }

    // ── Resolve payment QR URL on MyFines ──
    this.after('READ', 'MyFines', async (data, req) => {
      const mandalId = req.user.attr?.mandalId;
      if (!mandalId) return;
      let qrUrl = null;
      for (const row of Array.isArray(data) ? data : [data]) {
        if (!row) continue;
        if (!qrUrl) qrUrl = await getPaymentQrBase64(mandalId);
        row.payment_qr_url = qrUrl;
      }
    });

    // ── payFine — bound action on MyFines (single fine) ──
    this.on('payFine', 'MyFines', async (req) => {
      const { payment_reference } = req.data;
      if (!payment_reference) return req.reject(400, 'Payment reference is required');

      const fineId = req.params[0]?.ID || req.params[0];
      const { userId, mandalId } = req.user.attr;
      if (!userId || !mandalId) return req.reject(403, 'No active membership');

      const fine = await SELECT.one.from(Fines)
        .where({ ID: fineId, user_ID: userId, mandal_ID: mandalId });
      if (!fine) return req.reject(404, 'Fine not found');
      if (fine.status !== 'pending') {
        return req.reject(409, `Fine is '${fine.status}', payment only allowed when 'pending'`);
      }

      const today = new Date().toISOString().slice(0, 10);
      await UPDATE(Fines, fineId).set({
        status: 'paid',
        paid_amount: fine.amount,
        paid_date: today,
        payment_mode: 'upi',
        payment_reference: payment_reference,
      });

      return `Fine of ₹${fine.amount} paid. Awaiting verification.`;
    });

    // ── payAllFines — unbound action (all pending fines) ──
    this.on('payAllFines', async (req) => {
      const { payment_reference } = req.data;
      if (!payment_reference) return req.reject(400, 'Payment reference is required');

      const { userId, mandalId } = req.user.attr;
      if (!userId || !mandalId) return req.reject(403, 'No active membership');

      const pendingFines = await SELECT.from(Fines)
        .where({ user_ID: userId, mandal_ID: mandalId, status: 'pending' });
      if (pendingFines.length === 0) return req.reject(404, 'No pending fines found');

      const today = new Date().toISOString().slice(0, 10);
      let totalAmount = 0;

      for (const fine of pendingFines) {
        await UPDATE(Fines, fine.ID).set({
          status: 'paid',
          paid_amount: fine.amount,
          paid_date: today,
          payment_mode: 'upi',
          payment_reference: payment_reference,
        });
        totalAmount += Number.parseFloat(fine.amount);
      }

      return `${pendingFines.length} fines totalling ₹${totalAmount.toFixed(2)} paid. Awaiting verification.`;
    });

    // ── getPendingFinesSummary — returns total, count, QR code, UPI ID ──
    this.on('getPendingFinesSummary', async (req) => {
      const { userId, mandalId } = req.user.attr;
      if (!userId || !mandalId) return req.reject(403, 'No active membership');

      const pendingFines = await SELECT.from(Fines)
        .where({ user_ID: userId, mandal_ID: mandalId, status: 'pending' });

      let totalAmount = 0;
      for (const fine of pendingFines) {
        totalAmount += Number.parseFloat(fine.amount);
      }

      const qrCode = await getPaymentQrBase64(mandalId);
      const mandal = await SELECT.one(['payment_upi_id']).from(Mandals).where({ ID: mandalId });

      return {
        totalAmount: totalAmount,
        fineCount: pendingFines.length,
        qrCode: qrCode || '',
        upiId: mandal?.payment_upi_id || '',
      };
    });

    // ── RSVP helper ──
    async function handleRsvp(req, rsvpStatus, label) {
      const eventId = req.params[0]?.ID || req.params[0];
      const { userId, mandalId } = req.user.attr;
      if (!userId || !mandalId) return req.reject(403, 'No active membership');

      const event = await SELECT.one.from(Events)
        .where({ ID: eventId, mandal_ID: mandalId });
      if (!event) return req.reject(404, 'Event not found');

      const existing = await SELECT.one.from(EventAttendance)
        .where({ event_ID: eventId, user_ID: userId, mandal_ID: mandalId });

      const now = new Date().toISOString();
      if (existing) {
        await UPDATE(EventAttendance, existing.ID).set({
          rsvp_status: rsvpStatus,
          rsvp_date: now,
        });
      } else {
        await INSERT.into(EventAttendance).entries({
          event_ID: eventId,
          user_ID: userId,
          mandal_ID: mandalId,
          rsvp_status: rsvpStatus,
          rsvp_date: now,
        });
      }
      return `RSVP updated: ${label}`;
    }

    this.on('rsvpYes', 'MandalEvents', (req) => handleRsvp(req, 'attending', 'Attending'));
    this.on('rsvpNo', 'MandalEvents', (req) => handleRsvp(req, 'not_attending', 'Not Attending'));

    // ── Enum value lists for profile dropdowns ──
    const GENDER_VALUES = [
      { code: 'male', value: 'Male' },
      { code: 'female', value: 'Female' },
      { code: 'other', value: 'Other' },
      { code: 'prefer_not_to_say', value: 'Prefer Not to Say' },
    ];
    const MARITAL_STATUS_VALUES = [
      { code: 'single', value: 'Single' },
      { code: 'married', value: 'Married' },
      { code: 'widowed', value: 'Widowed' },
      { code: 'divorced', value: 'Divorced' },
      { code: 'prefer_not_to_say', value: 'Prefer Not to Say' },
    ];
    const BLOOD_GROUP_VALUES = [
      { code: 'A_pos', value: 'A+' },
      { code: 'A_neg', value: 'A-' },
      { code: 'B_pos', value: 'B+' },
      { code: 'B_neg', value: 'B-' },
      { code: 'AB_pos', value: 'AB+' },
      { code: 'AB_neg', value: 'AB-' },
      { code: 'O_pos', value: 'O+' },
      { code: 'O_neg', value: 'O-' },
      { code: 'NA', value: 'N/A' },
    ];
    const EDUCATION_VALUES = [
      { code: 'below_10th', value: 'Below 10th' },
      { code: 'ssc', value: 'SSC (10th)' },
      { code: 'hsc', value: 'HSC (12th)' },
      { code: 'diploma', value: 'Diploma' },
      { code: 'graduate', value: 'Graduate' },
      { code: 'post_graduate', value: 'Post Graduate' },
      { code: 'doctorate', value: 'Doctorate' },
      { code: 'other', value: 'Other' },
    ];
    const ANNUAL_INCOME_VALUES = [
      { code: 'below_1L', value: 'Below 1 Lakh' },
      { code: '_1L_3L', value: '1-3 Lakhs' },
      { code: '_3L_5L', value: '3-5 Lakhs' },
      { code: '_5L_10L', value: '5-10 Lakhs' },
      { code: '_10L_25L', value: '10-25 Lakhs' },
      { code: 'above_25L', value: 'Above 25 Lakhs' },
      { code: 'prefer_not_to_say', value: 'Prefer Not to Say' },
    ];
    const DIETARY_PREF_VALUES = [
      { code: 'vegetarian', value: 'Vegetarian' },
      { code: 'vegan', value: 'Vegan' },
      { code: 'jain', value: 'Jain' },
      { code: 'no_preference', value: 'No Preference' },
    ];
    this.on('READ', 'GenderValues', () => GENDER_VALUES);
    this.on('READ', 'MaritalStatusValues', () => MARITAL_STATUS_VALUES);
    this.on('READ', 'BloodGroupValues', () => BLOOD_GROUP_VALUES);
    this.on('READ', 'EducationValues', () => EDUCATION_VALUES);
    this.on('READ', 'AnnualIncomeValues', () => ANNUAL_INCOME_VALUES);
    this.on('READ', 'DietaryPrefValues', () => DIETARY_PREF_VALUES);

    await super.init();
  }
};
