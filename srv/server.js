require('dotenv').config();
const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {
  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
});

module.exports = cds.server;
