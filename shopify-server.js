'use strict';

const utilities = require(__dirname + '/utilities.js');
const Auth = require(__dirname + '/auth.js');
const Api = require(__dirname + '/api.js');
const Admin = require(__dirname + '/admin.js');
const Webhook = require(__dirname + '/webhook.js');

module.exports = {
  utilities: utilities,
  Auth: Auth,
  Api: Api,
  Admin: Admin,
  Webhook: Webhook,
};
