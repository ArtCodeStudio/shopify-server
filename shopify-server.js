/**
 * @see https://firebase.googleblog.com/2016/10/authenticate-your-firebase-users-with.html
 * @see https://github.com/firebase/custom-auth-samples
 * @see http://gavinballard.com/shopify-oauth-flow-for-dummies/
 * @see https://console.firebase.google.com/project/tagged-images/overview
 * @todo https://firebase.google.com/docs/cli/
 * @todo https://github.com/Daplie/node-letsencrypt
 * @see https://github.com/OptimalBits/redbird
 */

const utilities = require('./utilities.js');
const auth = require('./auth.js');
const api = require('./api.js');

module.exports = {
  utilities: utilities,
  auth: auth,
  api: api,
}