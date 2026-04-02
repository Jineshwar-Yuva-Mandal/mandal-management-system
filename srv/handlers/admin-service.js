const cds = require('@sap/cds');

// ── Map each AdminService entity to its app_key ──
// Privileged members can only access entities belonging to their granted apps.
const ENTITY_APP_MAP = {
  'AdminService.Members':              'members',
  'AdminService.Memberships':          'members',
  'AdminService.MyMandals':            'members',
  'AdminService.MemberFieldConfig':    'members',
  'AdminService.JoinRequests':         'joinrequests',
  'AdminService.JoinApprovals':        'joinrequests',
  'AdminService.JoinRequestStatusValues': 'joinrequests',
  'AdminService.MandalPositions':      'positions',
  'AdminService.PositionAssignments':  'positions',
  'AdminService.ProtectedEntityList':  'positions',
  'AdminService.ProtectedFieldList':   'positions',
  'AdminService.EntityPermissionRules':'positions',
  'AdminService.FieldPermissionRules': 'positions',
  'AdminService.MandalEvents':         'eventsandattendance',
  'AdminService.Attendance':           'eventsandattendance',
  'AdminService.MandalCourses':        'courses',
  'AdminService.Topics':               'courses',
  'AdminService.Assignments':          'courses',
  'AdminService.TopicProgress':        'courses',
  'AdminService.MemberFieldConfig':    'members',
  'AdminService.MemberFines':          'fines',
  'AdminService.Ledger':               'ledger',
  'AdminService.Mandal':               'mandal',
  'AdminService.Workflows':            'mandal',
  'AdminService.WorkflowSteps':        'mandal',
  'AdminService.AppGrants':            'appaccess',
  'AdminService.AvailableApps':        'appaccess',
};

// ── Map unbound actions to their app_key ──
const ACTION_APP_MAP = {
  'approveFine':       'fines',
  'rejectFine':        'fines',
  'verifyEntry':       'ledger',
  'markAttendance':    'eventsandattendance',
  'transferAdminship': 'mandal',
};

module.exports = class AdminService extends cds.ApplicationService {

  async init() {
    const {
      MandalMemberships, Mandals,
      Fines, LedgerEntries,
      Events, EventAttendance,
      MembershipRequests, MembershipApprovals,
      AppAccessGrants
    } = cds.entities('com.samanvay');

    // ── Privileged member entity-level authorization ──
    // Full admins (platform_admin, mandal_admin role, is_admin) pass through.
    // Privileged members can ONLY access entities mapped to their granted apps.
    this.before('*', async (req) => {
      // Skip if no target
      if (!req.target) return;

      const entityName = req.target?.name || '';

      // Skip CDS-internal / draft-infrastructure entities
      if (entityName.includes('.drafts') ||
          entityName === 'DRAFT.DraftAdministrativeData' ||
          entityName.endsWith('.DraftAdministrativeData') ||
          entityName.startsWith('DraftAdministrativeData') ||
          !entityName.startsWith('AdminService.')) return;

      const { userId, mandalId, isAdmin } = req.user.attr || {};

      // Full admins — unrestricted
      if (isAdmin || req.user.is('platform_admin')) return;

      // Check the user's platform role stored in DB
      const { Users } = cds.entities('com.samanvay');
      const dbUser = await SELECT.one.from(Users).where({ ID: userId }).columns('role');
      if (dbUser?.role === 'platform_admin' || dbUser?.role === 'mandal_admin') return;

      // Privileged member — check entity against their grants
      let requiredApp = ENTITY_APP_MAP[entityName];

      // For unbound actions, check the action name
      if (!requiredApp && req.event) {
        requiredApp = ACTION_APP_MAP[req.event];
      }

      // If entity/action isn't mapped, block by default for safety
      if (!requiredApp) {
        console.warn('[AUTH] Blocked unmapped entity:', entityName, 'event:', req.event, 'user:', userId);
        return req.reject(403, 'Access denied');
      }

      // Check if user has a grant for this app
      const grant = await SELECT.one.from(AppAccessGrants)
        .where({ user_ID: userId, mandal_ID: mandalId, app_key: requiredApp });

      if (!grant) {
        return req.reject(403, 'You do not have access to this application');
      }
    });

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

    // ── Fine status criticality ──
    const FINE_CRITICALITY = { pending: 2, paid: 2, verified: 3, rejected: 1, waived: 0 };
    const FINE_STATUS_TEXT = { pending: 'Pending', paid: 'Paid', verified: 'Verified', rejected: 'Rejected', waived: 'Waived' };
    this.after('READ', 'MemberFines', (data) => {
      for (const row of Array.isArray(data) ? data : [data]) {
        if (row) {
          row.statusCriticality = FINE_CRITICALITY[row.status] ?? 0;
          row.statusText = FINE_STATUS_TEXT[row.status] ?? row.status;
        }
      }
    });

    // ── approveFine — Verify a fine payment (bound action on MemberFines) ──
    this.on('approveFine', 'MemberFines', async (req) => {
      const fineId = req.params[0]?.ID || req.params[0];
      const { remarks } = req.data;
      const { mandalId, userId } = req.user.attr;
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const fine = await SELECT.one.from(Fines).where({ ID: fineId, mandal_ID: mandalId });
      if (!fine) return req.reject(404, 'Fine not found in your mandal');
      if (fine.status !== 'paid') return req.reject(409, `Fine is '${fine.status}', expected 'paid'`);

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

      return SELECT.one.from(Fines).where({ ID: fineId });
    });

    // ── rejectFine — Reject a fine payment (bound action on MemberFines) ──
    this.on('rejectFine', 'MemberFines', async (req) => {
      const fineId = req.params[0]?.ID || req.params[0];
      const { remarks } = req.data;
      const { mandalId, userId } = req.user.attr;
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const fine = await SELECT.one.from(Fines).where({ ID: fineId, mandal_ID: mandalId });
      if (!fine) return req.reject(404, 'Fine not found in your mandal');
      if (fine.status !== 'paid') return req.reject(409, `Fine is '${fine.status}', expected 'paid'`);

      await UPDATE(Fines, fineId).set({
        status: 'rejected',
        verified_by_ID: userId,
        verified_at: new Date().toISOString(),
        verification_remarks: remarks || 'Payment rejected'
      });

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

    // ── AvailableApps — fixed list of admin apps for app access grant dropdown ──
    const AVAILABLE_APPS = [
      { key: 'members',              label: 'Members Management' },
      { key: 'joinrequests',         label: 'Join Requests' },
      { key: 'positions',            label: 'Positions & Access' },
      { key: 'eventsandattendance',  label: 'Events & Attendance' },
      { key: 'courses',              label: 'Courses' },
      { key: 'fines',                label: 'Fines' },
      { key: 'ledger',               label: 'Financial Ledger' },
      { key: 'mandal',               label: 'Mandal Settings' },
      { key: 'appaccess',            label: 'App Access' },
    ];
    this.on('READ', 'AvailableApps', () => AVAILABLE_APPS);

    // ── Restrict AppGrants writes to full admins only ──
    // Prevents privilege escalation: a privileged member with 'appaccess' grant
    // must NOT be able to create/modify/delete grants (including for themselves).
    // Only mandal_admin, platform_admin, or is_admin users can manage access.
    this.before(['NEW', 'CREATE', 'SAVE', 'UPDATE', 'DELETE'], 'AppGrants', async (req) => {
      const { isAdmin } = req.user.attr || {};
      if (isAdmin || req.user.is('platform_admin')) return;
      const { Users } = cds.entities('com.samanvay');
      const dbUser = await SELECT.one.from(Users).where({ ID: req.user.attr?.userId }).columns('role');
      if (dbUser?.role === 'platform_admin' || dbUser?.role === 'mandal_admin') return;
      return req.reject(403, 'Only mandal administrators can manage app access grants');
    });

    // ── Auto-set mandal_ID on new drafts for mandal-scoped entities ──
    const setMandalId = req => {
      if (!req.data.mandal_ID) {
        req.data.mandal_ID = req.user.attr.mandalId;
      }
    };
    this.before('NEW', 'MandalPositions', setMandalId);
    this.before('NEW', 'AppGrants', setMandalId);
    this.before('CREATE', 'MandalPositions', setMandalId);
    this.before('CREATE', 'AppGrants', setMandalId);
    this.before('CREATE', 'MandalEvents', setMandalId);
    this.before('CREATE', 'Ledger', setMandalId);
    this.before('SAVE', 'MandalPositions', setMandalId);
    this.before('SAVE', 'AppGrants', setMandalId);
    this.before('SAVE', 'MandalEvents', setMandalId);
    this.before('SAVE', 'Ledger', setMandalId);

    // ── Pre-populate attendance for all active mandal members when creating a new event draft ──
    this.before('NEW', 'MandalEvents', async (req) => {
      if (!req.data.mandal_ID) {
        req.data.mandal_ID = req.user.attr.mandalId;
      }
      const mandalId = req.data.mandal_ID;
      if (!mandalId) return;

      const members = await SELECT.from(MandalMemberships)
        .where({ mandal_ID: mandalId, membership_status: 'active' })
        .columns('user_ID');

      if (members.length) {
        req.data.attendance = members.map(m => ({
          user_ID: m.user_ID,
          mandal_ID: mandalId,
          status: 'absent'
        }));
      }
    });

    // ── On event SAVE (draft activation): auto-create attendance for all active mandal members ──
    this.after('SAVE', 'MandalEvents', async (data, req) => {
      const eventId = data.ID;
      const mandalId = data.mandal_ID || req.user.attr.mandalId;
      if (!eventId || !mandalId) return;

      // Get all active members of this mandal
      const members = await SELECT.from(MandalMemberships)
        .where({ mandal_ID: mandalId, membership_status: 'active' })
        .columns('user_ID');
      if (!members.length) return;

      // Get existing attendance records for this event
      const existing = await SELECT.from(EventAttendance)
        .where({ event_ID: eventId })
        .columns('user_ID');
      const existingUserIds = new Set(existing.map(a => a.user_ID));

      // Create attendance records for members who don't have one yet (default: absent)
      const newRecords = members
        .filter(m => !existingUserIds.has(m.user_ID))
        .map(m => ({
          ID: cds.utils.uuid(),
          event_ID: eventId,
          user_ID: m.user_ID,
          mandal_ID: mandalId,
          status: 'absent',
          marked_by_ID: req.user.attr.userId,
          marked_at: new Date().toISOString()
        }));

      if (newRecords.length) {
        await INSERT.into(EventAttendance).entries(newRecords);
      }
    });

    // ── Attendance criticality (present=3/green, absent=1/red, excused=2/warning) ──
    const ATTENDANCE_CRITICALITY = { present: 3, absent: 1, excused: 2 };
    this.after('READ', 'Attendance', (data) => {
      for (const row of Array.isArray(data) ? data : [data]) {
        if (row) row.statusCriticality = ATTENDANCE_CRITICALITY[row.status] ?? 0;
      }
    });

    // ── After attendance is updated, auto-create/remove fines based on status ──
    this.after(['UPDATE', 'PATCH'], 'Attendance', async (data, req) => {
      if (!data.status || !data.event_ID) return;

      // Load the parent event
      const event = await SELECT.one.from(Events)
        .where({ ID: data.event_ID });
      if (!event) return;

      const userId = data.user_ID;
      const mandalId = event.mandal_ID;

      if (data.status === 'absent' && event.has_fine && event.fine_amount > 0) {
        // Create fine if doesn't exist
        const existingFine = await SELECT.one.from(Fines)
          .where({ event_ID: event.ID, user_ID: userId });
        if (!existingFine) {
          await INSERT.into(Fines).entries({
            ID: cds.utils.uuid(),
            user_ID: userId,
            event_ID: event.ID,
            mandal_ID: mandalId,
            amount: event.fine_amount,
            status: 'pending',
            due_date: event.fine_deadline || event.event_date
          });
        }
      } else if (data.status === 'present' || data.status === 'excused') {
        // If member is marked present/excused, remove any pending fine for this event
        const existingFine = await SELECT.one.from(Fines)
          .where({ event_ID: data.event_ID, user_ID: userId, status: 'pending' });
        if (existingFine) {
          await DELETE.from(Fines).where({ ID: existingFine.ID });
        }
      }
    });

    // ── Ledger: auto-set mandal_ID + recorded_by on new drafts ──
    this.before('NEW', 'Ledger', (req) => {
      if (!req.data.mandal_ID)      req.data.mandal_ID = req.user.attr.mandalId;
      if (!req.data.recorded_by_ID) req.data.recorded_by_ID = req.user.attr.userId;
      if (!req.data.status)         req.data.status = 'draft';
      if (!req.data.entry_date)     req.data.entry_date = new Date().toISOString().slice(0, 10);
    });

    // ── Ledger criticality (draft=2/orange, verified=3/green, disputed=1/red) ──
    const LEDGER_STATUS_CRIT = { draft: 2, verified: 3, disputed: 1 };
    const DIRECTION_CRIT = { credit: 3, debit: 1 };
    this.after('READ', 'Ledger', (data) => {
      for (const row of Array.isArray(data) ? data : [data]) {
        if (row) {
          row.statusCriticality = LEDGER_STATUS_CRIT[row.status] ?? 0;
          row.directionCriticality = DIRECTION_CRIT[row.direction] ?? 0;
        }
      }
    });

    // ── verifyEntry — mark a draft ledger entry as verified ──
    this.on('verifyEntry', 'Ledger', async (req) => {
      const entryId = req.params[0]?.ID || req.params[0];
      const { remarks } = req.data;
      const { mandalId, userId } = req.user.attr;
      if (!mandalId) return req.reject(403, 'No active mandal context');

      const entry = await SELECT.one.from(LedgerEntries).where({ ID: entryId, mandal_ID: mandalId });
      if (!entry) return req.reject(404, 'Ledger entry not found in your mandal');
      if (entry.status === 'verified') return req.reject(409, 'Entry already verified');

      await UPDATE(LedgerEntries, entryId).set({
        status: 'verified',
        verified_by_ID: userId,
        verified_at: new Date().toISOString(),
        remarks: remarks || entry.remarks || ''
      });

      return SELECT.one.from(LedgerEntries).where({ ID: entryId });
    });

    await super.init();
  }
};
