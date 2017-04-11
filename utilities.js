const Firebase = require('firebase-admin');
const Debug = require('debug')  // https://github.com/visionmedia/debug
const util = require('util');

var utilities = {
  debug: Debug('shopify-server:utilities')
};

utilities.extend = util._extend;

utilities.initFirebase = (appName, firebaseServiceAccount, firebaseDatabaseURL ) => {
  var firebase = Firebase.initializeApp({
    credential: Firebase.credential.cert(firebaseServiceAccount),
    databaseURL: firebaseDatabaseURL,
  }, appName);

  return firebase;
}

/**
 * Get CURRENT_LOGGED_IN_SHOP from CURRENT_LOGGED_IN_SHOP.myshopify.com
 */
utilities.getShopName = (shop) => {
  return shop.substring(0, shop.indexOf("."));
};


utilities.getShopifyAppUrl = (shop, apiKey) => {
  return 'https://'+shop+'/admin/apps/'+apiKey
}

/**
 * Merge/flatten an array of arrays
 * @see http://stackoverflow.com/a/10865042/1465919
 */
utilities.flattenArrayOfArray = function (arrays) {
  return [].concat.apply([], arrays);
}

module.exports = utilities;