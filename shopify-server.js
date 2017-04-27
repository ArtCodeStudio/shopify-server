/*jslint es6 */

'use strict';

/**
 * @see https://firebase.googleblog.com/2016/10/authenticate-your-firebase-users-with.html
 * @see https://github.com/firebase/custom-auth-samples
 * @see http://gavinballard.com/shopify-oauth-flow-for-dummies/
 * @see https://console.firebase.google.com/project/tagged-images/overview
 * @see https://firebase.google.com/docs/cli/
 * @see https://github.com/Daplie/node-letsencrypt
 * @see https://github.com/OptimalBits/redbird
 */

const utilities = require('./utilities.js');
const auth = require('./auth.js');
const api = require('./api.js');
const admin = require('./admin.js');
const webhook = require('./webhook.js');

module.exports = {
  utilities: utilities,
  auth: auth,
  api: api,
  admin: admin,
  webhook: webhook,
}