/**
 * Custom CDS auth strategy for Supabase.
 * Validates Supabase JWT (from Bearer header or session cookie)
 * and creates a proper cds.User with roles + mandal context attributes.
 *
 * Resolves the user's mandal context ONCE per request so that:
 *   - CDS @restrict annotations can reference $user.userId, $user.mandalId
 *   - Handlers can use req.user.attr without re-querying the DB
 *   - Roles like 'admin' are granted based on actual membership data
 */
module.exports = function supabase_auth() {
  const cds = require('@sap/cds');
  const LOG = cds.log('auth');
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  let supabase;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return async function supabase_auth(req, _res, next) {
    // Extract token from Bearer header or session cookie
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies?.sb_access_token) {
      token = req.cookies.sb_access_token;
    }

    // No token or no Supabase config → anonymous user (PublicService allows this)
    if (!token || !supabase) {
      req.user = new cds.User.Anonymous();
      return next();
    }

    // Validate token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      LOG.warn('Token validation failed:', error?.message || 'no user returned');
      req.user = new cds.User.Anonymous();
      return next();
    }

    // ── Resolve mandal context from DB (once per request) ──
    let userId = null, mandalId = null, isAdmin = false;
    const roles = ['authenticated-user'];
    const email = user.email;

    try {
      const { Users, MandalMemberships } = cds.entities('com.samanvay');
      const { SELECT } = cds.ql;

      const dbUser = await SELECT.one.from(Users).where({ email }).columns('ID', 'role');

      if (dbUser) {
        userId = dbUser.ID;

        if (dbUser.role === 'platform_admin') {
          roles.push('platform_admin');
        }

        const membership = await SELECT.one.from(MandalMemberships)
          .where({ user_ID: dbUser.ID, membership_status: 'active' })
          .orderBy('is_admin desc')
          .columns('mandal_ID', 'is_admin');

        if (membership) {
          mandalId = membership.mandal_ID;
          isAdmin = membership.is_admin;
        }

        // Grant 'mandal_admin' CDS role based on platform role or membership flag
        if (dbUser.role === 'platform_admin' || dbUser.role === 'mandal_admin' || isAdmin) {
          roles.push('mandal_admin');
        }
      }
    } catch (err) {
      LOG.warn('Failed to resolve mandal context:', err.message);
      // Continue with authenticated user but without mandal context
    }

    req.user = new cds.User({
      id: email,
      roles,
      attr: {
        supabaseId: user.id,
        userId,
        mandalId,
        isAdmin
      }
    });

    req.supabaseUser = user;
    next();
  };
};
