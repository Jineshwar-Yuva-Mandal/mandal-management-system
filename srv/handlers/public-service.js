const cds = require('@sap/cds');
const { Readable } = require('stream');

module.exports = class PublicService extends cds.ApplicationService {

  async init() {
    const { Users, Mandals, MandalMemberships } = cds.entities('com.samanvay');
    const { NewUser } = this.entities;

    // ── Custom endpoint to serve payment QR images (bypasses OData streaming) ──
    this.on('getPaymentQr', async (req) => {
      const { mandalId } = req.data;
      if (!mandalId) return req.reject(400, 'mandalId is required');
      const mandal = await SELECT.one(['payment_qr', 'payment_qr_type']).from(Mandals).where({ ID: mandalId });
      if (!mandal?.payment_qr) return req.reject(404, 'No QR code found');
      const mimeType = mandal.payment_qr_type || 'image/png';
      // Handle both Buffer and Readable stream from DB adapter
      let buf;
      if (Buffer.isBuffer(mandal.payment_qr)) {
        buf = mandal.payment_qr;
      } else if (mandal.payment_qr instanceof Readable || typeof mandal.payment_qr.read === 'function') {
        const chunks = [];
        for await (const chunk of mandal.payment_qr) chunks.push(chunk);
        buf = Buffer.concat(chunks);
      } else {
        buf = Buffer.from(mandal.payment_qr);
      }
      return `data:${mimeType};base64,${buf.toString('base64')}`;
    });

    // ── Return Supabase config for the frontend ──
    this.on('getAuthConfig', () => ({
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || ''
    }));

    // ── Look up user by Supabase auth ID ──
    this.on('getUserByAuthId', async (req) => {
      const { authId } = req.data;
      if (!authId) return req.reject(400, 'authId is required');
      const email = authId.toLowerCase();
      const user = await SELECT.one.from(Users).where({ email });
      return user || null;
    });

    // ── Normalize email before creating new user ──
    // CAP's generic handlers then enforce @assert.unique on email
    this.before('CREATE', 'NewUser', (req) => {
      if (req.data.email) {
        req.data.email = req.data.email.toLowerCase().trim();
      }
      if (!req.data.role) req.data.role = 'member';
      // Split full_name into first/last if not provided
      if (req.data.full_name && !req.data.first_name) {
        const parts = req.data.full_name.split(' ');
        req.data.first_name = parts[0] || '';
        req.data.last_name = parts.slice(1).join(' ') || '';
      }
    });

    // ── Auto-link user_ID on join requests by requester email ──
    this.before('CREATE', 'JoinRequests', async (req) => {
      if (!req.data.user_ID && req.data.requester_email) {
        const email = req.data.requester_email.toLowerCase().trim();
        const user = await SELECT.one.from(Users).columns('ID').where({ email });
        if (user) req.data.user_ID = user.ID;
      }
    });

    // ── Create a new mandal — creator becomes superadmin ──
    // This is a multi-entity transaction so it stays as a custom action
    this.on('createMandal', async (req) => {
      const { name, area, city, state, creatorEmail, creatorName, creatorPhone } = req.data;
      if (!name || !creatorEmail) return req.reject(400, 'name and creatorEmail are required');

      const email = creatorEmail.toLowerCase().trim();

      // Use the service's own CRUD to create/find user — triggers generic handlers
      let user = await SELECT.one.from(Users).where({ email });
      if (!user) {
        const result = await this.create(NewUser).entries({
          email,
          full_name: creatorName,
          first_name: creatorName?.split(' ')[0] || '',
          last_name: creatorName?.split(' ').slice(1).join(' ') || '',
          phone: creatorPhone,
          role: 'member'
        });
        user = Array.isArray(result) ? result[0] : result;
      }

      // Create the mandal
      const mandalId = cds.utils.uuid();
      await INSERT.into(Mandals).entries({
        ID: mandalId, name, area, city, state,
        admin_ID: user.ID,
        has_joining_fee: false,
        joining_fee: 0
      });

      // Create membership — creator is active admin
      await INSERT.into(MandalMemberships).entries({
        ID: cds.utils.uuid(),
        user_ID: user.ID,
        mandal_ID: mandalId,
        membership_status: 'active',
        is_admin: true,
        joined_date: new Date().toISOString().slice(0, 10)
      });

      return { ID: mandalId, name, area, city, state };
    });

    await super.init();
  }
};
