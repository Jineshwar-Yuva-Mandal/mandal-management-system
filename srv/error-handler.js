const cds = require('@sap/cds');
const LOG = cds.log('errors');

// ═══════════════════════════════════════════════════
// Friendly error messages for database constraints
// ═══════════════════════════════════════════════════

// Map DB constraint names / column patterns to user-friendly messages
const FRIENDLY_UNIQUE_MESSAGES = {
  email:  'A user with this email address already exists.',
  'mandals': 'A mandal with this name already exists in this area.',
  'protectedentities': 'This entity name is already registered.',
};

/**
 * Parse a Postgres unique-violation error and return a friendly message.
 * Postgres error code 23505 = unique_violation
 * The `detail` field looks like: Key (email)=(test@test.com) already exists.
 * The `constraint` field has the constraint name.
 */
function getFriendlyUniqueMessage(err) {
  const detail = err.detail || err.message || '';
  const constraint = (err.constraint || '').toLowerCase();

  // Try matching by the column name in the Key (column)=(...) pattern
  const colMatch = detail.match(/Key \(([^)]+)\)/i);
  if (colMatch) {
    const columns = colMatch[1].toLowerCase();
    for (const [pattern, msg] of Object.entries(FRIENDLY_UNIQUE_MESSAGES)) {
      if (columns.includes(pattern)) return msg;
    }
  }

  // Try matching by constraint name
  for (const [pattern, msg] of Object.entries(FRIENDLY_UNIQUE_MESSAGES)) {
    if (constraint.includes(pattern)) return msg;
  }

  // Fallback: extract clean column name(s) and make a generic message
  if (colMatch) {
    // Strip Postgres functional index wrappers like lower(name::text)
    const raw = colMatch[1];
    const cleanCols = raw
      .split(',')
      .map(c => c.replace(/\w+\(([^)]+)\)/g, '$1'))  // unwrap function calls
      .map(c => c.replace(/::[\w]+/g, ''))            // strip type casts
      .map(c => c.trim().replace(/_/g, ' '))
      .join(', ');
    return `A record with this ${cleanCols} already exists.`;
  }

  return 'A record with these values already exists. Please use different values.';
}

/**
 * Parse a Postgres foreign-key violation (23503) into a friendly message.
 */
function getFriendlyFKMessage(err) {
  const detail = err.detail || err.message || '';
  if (detail.includes('is still referenced')) {
    return 'This record cannot be deleted because it is referenced by other data.';
  }
  return 'The referenced record does not exist. Please check your input.';
}

/**
 * Parse a Postgres not-null violation (23502) into a friendly message.
 */
function getFriendlyNotNullMessage(err) {
  const column = err.column || '';
  if (column) {
    const friendly = column.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `${friendly} is required and cannot be empty.`;
  }
  return 'A required field is missing. Please fill in all required fields.';
}

/**
 * Parse a Postgres check-constraint violation (23514).
 */
function getFriendlyCheckMessage(/* err */) {
  return 'The provided value is not valid. Please check your input.';
}

/**
 * Parse a Postgres string-too-long / data error (22001, 22P02, etc.).
 */
function getFriendlyDataMessage(err) {
  const message = err.message || '';
  if (message.includes('value too long')) {
    return 'One of the values is too long. Please shorten it and try again.';
  }
  if (message.includes('invalid input syntax')) {
    return 'Invalid input format. Please check your data and try again.';
  }
  return 'Invalid data provided. Please check your input.';
}

// Postgres error codes → handler functions
const PG_ERROR_HANDLERS = {
  '23505': getFriendlyUniqueMessage,   // unique_violation
  '23503': getFriendlyFKMessage,       // foreign_key_violation
  '23502': getFriendlyNotNullMessage,  // not_null_violation
  '23514': getFriendlyCheckMessage,    // check_violation
  '22001': getFriendlyDataMessage,     // string_data_right_truncation
  '22P02': getFriendlyDataMessage,     // invalid_text_representation
};

// HTTP status codes for each PG error type
const PG_STATUS_CODES = {
  '23505': 409,  // Conflict
  '23503': 409,  // Conflict
  '23502': 400,  // Bad Request
  '23514': 400,  // Bad Request
  '22001': 400,  // Bad Request
  '22P02': 400,  // Bad Request
};

/**
 * Transform a PG error code + details into a friendly message + HTTP status.
 * Returns null if the error is not a recognized PG error.
 */
function transformPgError(errBody) {
  const pgCode = errBody.code;
  const handler = PG_ERROR_HANDLERS[pgCode];
  if (handler) {
    return {
      message: handler(errBody),
      status: PG_STATUS_CODES[pgCode] || 400
    };
  }
  // Fallback: pattern-match on the message text
  const msg = (errBody.message || '') + ' ' + (errBody.detail || '');
  // Guard: "does not exist" (e.g. prepared statement errors) is NOT a unique violation
  if (!msg.includes('does not exist') &&
      (msg.includes('unique constraint') || msg.includes('duplicate key') || msg.includes('already exists'))) {
    return {
      message: getFriendlyUniqueMessage({ detail: msg, constraint: errBody.constraint || '' }),
      status: 409
    };
  }
  if (msg.includes('not present in table') || msg.includes('still referenced')) {
    return { message: getFriendlyFKMessage({ detail: msg }), status: 409 };
  }
  if (msg.includes('null value in column') || msg.includes('violates not-null')) {
    return { message: getFriendlyNotNullMessage(errBody), status: 400 };
  }
  if (msg.includes('value too long') || msg.includes('invalid input syntax')) {
    return { message: getFriendlyDataMessage({ message: msg }), status: 400 };
  }
  return null;
}

/**
 * Express error-handling middleware that transforms raw Postgres errors
 * into user-friendly messages. Registered before CDS's built-in error handler
 * via cds.middlewares.after so it mutates err.message in-place.
 */
function friendlyErrorHandler(err, _req, _res, next) {
  const original = err.original || err;
  const pgCode = original.code;
  const handler = PG_ERROR_HANDLERS[pgCode];
  if (handler) {
    const friendly = handler(original);
    LOG.warn('DB error transformed:', original.message, '->', friendly);
    err.message = friendly;
    // CDS error handler reads: err.statusCode || err.status || Number(err.code) || 500
    const httpStatus = PG_STATUS_CODES[pgCode];
    if (httpStatus) {
      err.statusCode = httpStatus;
      err.status = httpStatus;
      err.code = String(httpStatus);
    }
    return next(err);
  }
  // Fallback: pattern-match on message text
  const result = transformPgError({
    code: pgCode,
    message: original.message || '',
    detail: original.detail || '',
    constraint: original.constraint || '',
    column: original.column || ''
  });
  if (result) {
    LOG.warn('DB error transformed (fallback):', original.message, '->', result.message);
    err.message = result.message;
    err.statusCode = result.status;
    err.status = result.status;
    err.code = String(result.status);
  }
  next(err);
}

// Register the middleware before CDS's built-in error handler
cds.middlewares.after.unshift(friendlyErrorHandler);
