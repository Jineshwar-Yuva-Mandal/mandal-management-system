const cds = require('@sap/cds');

module.exports = class AdminService extends cds.ApplicationService {

  async init() {
    const {
      MandalMemberships, Mandals,
      Fines, LedgerEntries,
      Events, EventAttendance,
      MembershipRequests, MembershipApprovals
    } = cds.entities('com.samanvay');

    this.before('READ', 'Members', async (req) => {
      if (req.query?.SELECT?.from?.ref?.[0]?.id?.endsWith?.('.drafts')) return;

      const mandalId = req.user.attr?.mandalId;
      if (!mandalId) { req.reject(403, 'No active mandal context'); return; }

      const memberships = await SELECT.from(MandalMemberships)
        .where({ mandal_ID: mandalId, membership_status: 'active' })
        .columns('user_ID');
      const userIds = memberships.map(m => m.user_ID);
      if (userIds.length === 0) { req.reject(404, 'No members found'); return; }

      req.query.where({ ID: { in: userIds } });
    });

    // ── Scope: EntityPermissionRules — no direct mandal_ID, joined via position ──
    this.before('READ', 'EntityPermissionRules', async (req) => {
      const mandalId = req.user.attr.mandalId;
      if (!mandalId) { req.reject(403, 'No active mandal context'); return; }
      const positions = await SELECT.from('AdminService.MandalPositions')
        .where({ mandal_ID: mandalId }).columns('ID');
      const posIds = positions.map(p => p.ID);
      if (posIds.length === 0) { req.query.where({ ID: null }); return; }
      req.query.where({ position_ID: { in: posIds } });
    });

    // ── verifyFinePayment — Koshadhyaksha approves/rejects a fine payment ──
    this.on('verifyFinePayment', async (req) => {
      const { fineId, approved, remarks } = req.data;
      if (!fineId) return req.reject(400, 'fineId is required');

      const { mandalId, userId } = req.user.attr;
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const fine = await SELECT.one.from(Fines).where({ ID: fineId, mandal_ID: mandalId });
      if (!fine) return req.reject(404, 'Fine not found in your mandal');
      if (fine.status !== 'paid') return req.reject(409, `Fine is '${fine.status}', expected 'paid'`);

      if (approved) {
        // Create ledger entry for the fine income
        const ledgerEntryId = cds.utils.uuid();
        await INSERT.into(LedgerEntries).entries({
          ID: ledgerEntryId,
          mandal_ID: mandalId,
          entry_date: new Date().toISOString().slice(0, 10),
          type: 'fine_income',
          description: `Fine payment from member`,
          amount: fine.paid_amount || fine.amount,
          direction: 'credit',
          related_user_ID: fine.user_ID,
          recorded_by_ID: userId,
          verified_by_ID: userId,
          verified_at: new Date().toISOString(),
          status: 'verified'
        });

        await UPDATE(Fines, fineId).set({
          status: 'verified',
          verified_by_ID: userId,
          verified_at: new Date().toISOString(),
          verification_remarks: remarks || '',
          ledger_entry_ID: ledgerEntryId
        });
      } else {
        await UPDATE(Fines, fineId).set({
          status: 'rejected',
          verified_by_ID: userId,
          verified_at: new Date().toISOString(),
          verification_remarks: remarks || 'Payment rejected'
        });
      }

      return SELECT.one.from(Fines).where({ ID: fineId });
    });

    // ── markAttendance — bulk mark attendance for an event ──
    this.on('markAttendance', async (req) => {
      const { eventId, attendees } = req.data;
      if (!eventId) return req.reject(400, 'eventId is required');
      if (!attendees?.length) return req.reject(400, 'attendees array is required');

      const { mandalId, userId } = req.user.attr;
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const event = await SELECT.one.from(Events).where({ ID: eventId, mandal_ID: mandalId });
      if (!event) return req.reject(404, 'Event not found in your mandal');

      const now = new Date().toISOString();

      for (const { userId: attendeeUserId, status } of attendees) {
        const existing = await SELECT.one.from(EventAttendance)
          .where({ event_ID: eventId, user_ID: attendeeUserId });

        if (existing) {
          await UPDATE(EventAttendance, existing.ID).set({
            status,
            marked_by_ID: userId,
            marked_at: now
          });
        } else {
          await INSERT.into(EventAttendance).entries({
            ID: cds.utils.uuid(),
            event_ID: eventId,
            user_ID: attendeeUserId,
            mandal_ID: mandalId,
            status,
            marked_by_ID: userId,
            marked_at: now
          });
        }

        // Auto-create fine for absent members if event has fine configured
        if (status === 'absent' && event.has_fine && event.fine_amount > 0) {
          const existingFine = await SELECT.one.from(Fines)
            .where({ event_ID: eventId, user_ID: attendeeUserId });
          if (!existingFine) {
            await INSERT.into(Fines).entries({
              ID: cds.utils.uuid(),
              user_ID: attendeeUserId,
              event_ID: eventId,
              mandal_ID: mandalId,
              amount: event.fine_amount,
              status: 'pending',
              due_date: event.fine_deadline || event.event_date
            });
          }
        }
      }
    });

    // ── approveMembership — approve a join request (bound action on JoinRequests) ──
    this.on('approveMembership', 'JoinRequests', async (req) => {
      const keys = req.params[0];
      const requestId = typeof keys === 'object' ? keys.ID : keys;
      const { remarks } = req.data;
      const decision = 'approved';
      if (!requestId) return req.reject(400, 'requestId is required');

      const { mandalId, userId } = req.user.attr;
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const request = await SELECT.one.from(MembershipRequests)
        .where({ ID: requestId, mandal_ID: mandalId });
      if (!request) return req.reject(404, 'Membership request not found in your mandal');
      if (request.status === 'approved' || request.status === 'rejected') {
        return req.reject(409, `Request already ${request.status}`);
      }

      // Record the approval/rejection
      await INSERT.into(MembershipApprovals).entries({
        ID: cds.utils.uuid(),
        request_ID: requestId,
        approver_ID: userId,
        decision,
        decided_at: new Date().toISOString(),
        remarks: remarks || ''
      });

      await UPDATE(MembershipRequests, requestId).set({
        status: decision,
        remarks: remarks || ''
      });

      // If approved, create the mandal membership
      if (decision === 'approved') {
        if (!request.user_ID) {
          return req.reject(400, 'Cannot approve: no linked user on this request');
        }

        const existingMembership = await SELECT.one.from(MandalMemberships)
          .where({ user_ID: request.user_ID, mandal_ID: mandalId });

        if (!existingMembership) {
          await INSERT.into(MandalMemberships).entries({
            ID: cds.utils.uuid(),
            user_ID: request.user_ID,
            mandal_ID: mandalId,
            membership_status: 'active',
            is_admin: false,
            joined_date: new Date().toISOString().slice(0, 10)
          });
        } else if (existingMembership.membership_status !== 'active') {
          await UPDATE(MandalMemberships, existingMembership.ID).set({
            membership_status: 'active',
            joined_date: new Date().toISOString().slice(0, 10)
          });
        }

        // Create ledger entry if joining fee was paid
        if (request.paid_amount > 0 && request.payment_verified) {
          await INSERT.into(LedgerEntries).entries({
            ID: cds.utils.uuid(),
            mandal_ID: mandalId,
            entry_date: new Date().toISOString().slice(0, 10),
            type: 'joining_fee',
            description: `Joining fee from ${request.requester_name || 'new member'}`,
            amount: request.paid_amount,
            direction: 'credit',
            related_user_ID: request.user_ID,
            recorded_by_ID: userId,
            status: 'verified'
          });
        }
      }
    });

    // ── rejectMembership — reject a join request (bound action on JoinRequests) ──
    this.on('rejectMembership', 'JoinRequests', async (req) => {
      const keys = req.params[0];
      const requestId = typeof keys === 'object' ? keys.ID : keys;
      const { remarks } = req.data;
      if (!requestId) return req.reject(400, 'requestId is required');

      const { mandalId, userId } = req.user.attr;
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const request = await SELECT.one.from(MembershipRequests)
        .where({ ID: requestId, mandal_ID: mandalId });
      if (!request) return req.reject(404, 'Membership request not found in your mandal');
      if (request.status === 'approved' || request.status === 'rejected') {
        return req.reject(409, `Request already ${request.status}`);
      }

      await INSERT.into(MembershipApprovals).entries({
        ID: cds.utils.uuid(),
        request_ID: requestId,
        approver_ID: userId,
        decision: 'rejected',
        decided_at: new Date().toISOString(),
        remarks: remarks || ''
      });

      await UPDATE(MembershipRequests, requestId).set({
        status: 'rejected',
        remarks: remarks || ''
      });
    });

    // ── transferAdminship — transfer mandal admin role to another member ──
    this.on('transferAdminship', async (req) => {
      const { mandalId, newAdminUserId } = req.data;
      if (!mandalId || !newAdminUserId) {
        return req.reject(400, 'mandalId and newAdminUserId are required');
      }

      const { mandalId: activeMandalId, userId } = req.user.attr;
      if (activeMandalId !== mandalId) {
        return req.reject(403, 'You can only transfer adminship of your own mandal');
      }

      // Verify new admin is an active member of this mandal
      const newAdminMembership = await SELECT.one.from(MandalMemberships)
        .where({ user_ID: newAdminUserId, mandal_ID: mandalId, membership_status: 'active' });
      if (!newAdminMembership) {
        return req.reject(404, 'Target user is not an active member of this mandal');
      }

      // Demote current admin
      const currentAdminMembership = await SELECT.one.from(MandalMemberships)
        .where({ user_ID: userId, mandal_ID: mandalId });
      if (currentAdminMembership) {
        await UPDATE(MandalMemberships, currentAdminMembership.ID).set({ is_admin: false });
      }

      // Promote new admin
      await UPDATE(MandalMemberships, newAdminMembership.ID).set({ is_admin: true });

      // Update mandal's primary admin reference
      await UPDATE(Mandals, mandalId).set({ admin_ID: newAdminUserId });
    });

    // ── Criticality computation for JoinRequests & JoinApprovals ──
    const STATUS_CRITICALITY = {
      submitted: 2,       // Warning (orange) — needs attention
      payment_pending: 2, // Warning
      payment_done: 5,    // Neutral
      under_review: 5,    // Neutral
      approved: 3,        // Positive (green)
      rejected: 1,        // Negative (red)
      cancelled: 1,       // Neutral
    };
    const DECISION_CRITICALITY = {
      pending: 2,   // Warning
      approved: 3,  // Positive
      rejected: 1,  // Negative
    };

    // ── JoinRequestStatusValues — fixed enum values for filter dropdown ──
    const REQUEST_STATUSES = [
      { code: 'submitted', value: 'Submitted' },
      { code: 'payment_pending', value: 'Payment Pending' },
      { code: 'payment_done', value: 'Payment Done' },
      { code: 'under_review', value: 'Under Review' },
      { code: 'approved', value: 'Approved' },
      { code: 'rejected', value: 'Rejected' },
      { code: 'cancelled', value: 'Cancelled' },
    ];
    const STATUS_TEXT = Object.fromEntries(REQUEST_STATUSES.map(s => [s.code, s.value]));
    this.on('READ', 'JoinRequestStatusValues', () => REQUEST_STATUSES);

    this.after('READ', 'JoinRequests', (data) => {
      for (const row of Array.isArray(data) ? data : [data]) {
        row.statusCriticality = STATUS_CRITICALITY[row.status] ?? 0;
        row.statusText = STATUS_TEXT[row.status] ?? row.status;
      }
    });
    this.after('READ', 'JoinApprovals', (data) => {
      for (const row of Array.isArray(data) ? data : [data]) {
        row.decisionCriticality = DECISION_CRITICALITY[row.decision] ?? 0;
      }
    });

    await super.init();
  }
};
