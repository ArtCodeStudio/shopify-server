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
const Auth = require('./auth.js');
const Api = require('./api.js');
const Admin = require('./admin.js');
const Webhook = require('./webhook.js');

module.exports = {
  utilities: utilities,
  Auth: Auth,
  Api: Api,
  Admin: Admin,
  Webhook: Webhook,
};
