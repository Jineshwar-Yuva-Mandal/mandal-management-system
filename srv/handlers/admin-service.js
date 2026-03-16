const cds = require('@sap/cds');

module.exports = class AdminService extends cds.ApplicationService {

  async init() {
    const {
      Users, MandalMemberships, Mandals,
      Fines, LedgerEntries,
      Events, EventAttendance,
      MembershipRequests, MembershipApprovals
    } = cds.entities('com.samanvay');

    /**
     * Resolve the active mandal ID for the current request.
     * req.user.id is the email, set by our custom Supabase auth strategy.
     */
    const getActiveMandal = async (req) => {
      const email = req.user?.id;
      if (!email) return null;

      const user = await SELECT.one.from(Users).where({ email }).columns('ID');
      if (!user) return null;

      const membership = await SELECT.one.from(MandalMemberships)
        .where({ user_ID: user.ID, is_admin: true, membership_status: 'active' })
        .columns('mandal_ID');

      return membership?.mandal_ID || null;
    };

    // ── Scope: Members — users who belong to the admin's mandal ──
    this.before('READ', 'Members', async (req) => {
      const mandalId = await getActiveMandal(req);
      if (!mandalId) {
        req.reject(403, 'No active mandal context');
        return;
      }

      const memberships = await SELECT.from(MandalMemberships)
        .where({ mandal_ID: mandalId, membership_status: 'active' })
        .columns('user_ID');
      const userIds = memberships.map(m => m.user_ID);
      if (userIds.length === 0) {
        req.reject(404, 'No members found');
        return;
      }

      req.query.where({ ID: { in: userIds } });
    });

    // ── Scope: Mandal entity — only show the admin's mandal ──
    this.before('READ', 'Mandal', async (req) => {
      const mandalId = await getActiveMandal(req);
      if (mandalId) {
        req.query.where({ ID: mandalId });
      }
    });

    // ── Generic filter for entities with direct mandal_ID column ──
    const mandalScopedEntities = [
      'Memberships', 'MandalPositions', 'PositionAssignments',
      'MandalEvents', 'Attendance', 'MemberFines', 'Ledger',
      'MandalCourses', 'Assignments', 'Workflows',
      'JoinRequests', 'MemberFieldConfig'
    ];

    for (const entity of mandalScopedEntities) {
      this.before('READ', entity, async (req) => {
        const mandalId = await getActiveMandal(req);
        if (!mandalId) {
          req.reject(403, 'No active mandal context');
          return;
        }
        req.query.where({ mandal_ID: mandalId });
      });
    }

    // ── Scope: MyMandals — only the admin's own memberships ──
    this.before('READ', 'MyMandals', async (req) => {
      const email = req.user?.id;
      if (!email) { req.reject(403, 'Not authenticated'); return; }
      const user = await SELECT.one.from(Users).where({ email }).columns('ID');
      if (!user) { req.reject(403, 'User not found'); return; }
      req.query.where({ user_ID: user.ID });
    });

    // ── Scope: Indirectly mandal-owned entities (compositions) ──
    // EntityPermissionRules → position.mandal_ID
    this.before('READ', 'EntityPermissionRules', async (req) => {
      const mandalId = await getActiveMandal(req);
      if (!mandalId) { req.reject(403, 'No active mandal context'); return; }
      const positions = await SELECT.from('AdminService.MandalPositions')
        .where({ mandal_ID: mandalId }).columns('ID');
      const posIds = positions.map(p => p.ID);
      if (posIds.length === 0) { req.query.where({ ID: null }); return; }
      req.query.where({ position_ID: { in: posIds } });
    });

    // ── selectMandal action — for admins of multiple mandals ──
    this.on('selectMandal', async (req) => {
      const { mandalId } = req.data;
      if (!mandalId) return req.reject(400, 'mandalId is required');
      return { mandalId };
    });

    // ── verifyFinePayment — Koshadhyaksha approves/rejects a fine payment ──
    this.on('verifyFinePayment', async (req) => {
      const { fineId, approved, remarks } = req.data;
      if (!fineId) return req.reject(400, 'fineId is required');

      const mandalId = await getActiveMandal(req);
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const fine = await SELECT.one.from(Fines).where({ ID: fineId, mandal_ID: mandalId });
      if (!fine) return req.reject(404, 'Fine not found in your mandal');
      if (fine.status !== 'paid') return req.reject(409, `Fine is '${fine.status}', expected 'paid'`);

      const email = req.user.id;
      const verifier = await SELECT.one.from(Users).where({ email }).columns('ID');

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
          recorded_by_ID: verifier.ID,
          verified_by_ID: verifier.ID,
          verified_at: new Date().toISOString(),
          status: 'verified'
        });

        await UPDATE(Fines, fineId).set({
          status: 'verified',
          verified_by_ID: verifier.ID,
          verified_at: new Date().toISOString(),
          verification_remarks: remarks || '',
          ledger_entry_ID: ledgerEntryId
        });
      } else {
        await UPDATE(Fines, fineId).set({
          status: 'rejected',
          verified_by_ID: verifier.ID,
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

      const mandalId = await getActiveMandal(req);
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const event = await SELECT.one.from(Events).where({ ID: eventId, mandal_ID: mandalId });
      if (!event) return req.reject(404, 'Event not found in your mandal');

      const email = req.user.id;
      const marker = await SELECT.one.from(Users).where({ email }).columns('ID');
      const now = new Date().toISOString();

      for (const { userId, status } of attendees) {
        const existing = await SELECT.one.from(EventAttendance)
          .where({ event_ID: eventId, user_ID: userId });

        if (existing) {
          await UPDATE(EventAttendance, existing.ID).set({
            status,
            marked_by_ID: marker.ID,
            marked_at: now
          });
        } else {
          await INSERT.into(EventAttendance).entries({
            ID: cds.utils.uuid(),
            event_ID: eventId,
            user_ID: userId,
            mandal_ID: mandalId,
            status,
            marked_by_ID: marker.ID,
            marked_at: now
          });
        }

        // Auto-create fine for absent members if event has fine configured
        if (status === 'absent' && event.has_fine && event.fine_amount > 0) {
          const existingFine = await SELECT.one.from(Fines)
            .where({ event_ID: eventId, user_ID: userId });
          if (!existingFine) {
            await INSERT.into(Fines).entries({
              ID: cds.utils.uuid(),
              user_ID: userId,
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

    // ── decideMembership — approve/reject a join request ──
    this.on('decideMembership', async (req) => {
      const { requestId, decision, remarks } = req.data;
      if (!requestId) return req.reject(400, 'requestId is required');
      if (!['approved', 'rejected'].includes(decision)) {
        return req.reject(400, "decision must be 'approved' or 'rejected'");
      }

      const mandalId = await getActiveMandal(req);
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const request = await SELECT.one.from(MembershipRequests)
        .where({ ID: requestId, mandal_ID: mandalId });
      if (!request) return req.reject(404, 'Membership request not found in your mandal');
      if (request.status === 'approved' || request.status === 'rejected') {
        return req.reject(409, `Request already ${request.status}`);
      }

      const email = req.user.id;
      const decider = await SELECT.one.from(Users).where({ email }).columns('ID');

      // Record the approval/rejection
      await INSERT.into(MembershipApprovals).entries({
        ID: cds.utils.uuid(),
        request_ID: requestId,
        approver_ID: decider.ID,
        decision,
        decided_at: new Date().toISOString(),
        remarks: remarks || ''
      });

      await UPDATE(MembershipRequests, requestId).set({
        status: decision,
        remarks: remarks || ''
      });

      // If approved, create the mandal membership
      if (decision === 'approved' && request.user_ID) {
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
            recorded_by_ID: decider.ID,
            status: 'verified'
          });
        }
      }
    });

    // ── transferAdminship — transfer mandal admin role to another member ──
    this.on('transferAdminship', async (req) => {
      const { mandalId, newAdminUserId } = req.data;
      if (!mandalId || !newAdminUserId) {
        return req.reject(400, 'mandalId and newAdminUserId are required');
      }

      const activeMandalId = await getActiveMandal(req);
      if (activeMandalId !== mandalId) {
        return req.reject(403, 'You can only transfer adminship of your own mandal');
      }

      // Verify new admin is an active member of this mandal
      const newAdminMembership = await SELECT.one.from(MandalMemberships)
        .where({ user_ID: newAdminUserId, mandal_ID: mandalId, membership_status: 'active' });
      if (!newAdminMembership) {
        return req.reject(404, 'Target user is not an active member of this mandal');
      }

      const email = req.user.id;
      const currentAdmin = await SELECT.one.from(Users).where({ email }).columns('ID');

      // Demote current admin
      const currentAdminMembership = await SELECT.one.from(MandalMemberships)
        .where({ user_ID: currentAdmin.ID, mandal_ID: mandalId });
      if (currentAdminMembership) {
        await UPDATE(MandalMemberships, currentAdminMembership.ID).set({ is_admin: false });
      }

      // Promote new admin
      await UPDATE(MandalMemberships, newAdminMembership.ID).set({ is_admin: true });

      // Update mandal's primary admin reference
      await UPDATE(Mandals, mandalId).set({ admin_ID: newAdminUserId });
    });

    await super.init();
  }
};
