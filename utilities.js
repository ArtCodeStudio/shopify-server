const Firebase = require('firebase-admin');
const Debug = require('debug')  // https://github.com/visionmedia/debug
const util = require('util');

var utilities = {
  debug: new Debug('shopify-server:utilities')
};

utilities.extend = util._extend;

utilities.async = {};
/**
 * Iterate over object keys
 * @see http://stackoverflow.com/a/7442013/1465919
 */
utilities.async.forEach = (o, cb) => {
  var counter = 0,
  keys = Object.keys(o),
  len = keys.length;
  var next = () => {
    if (counter < len)
    cb(keys[counter], o[keys[counter++]], next);
  };
  next();
};

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
 * Generates a uid string for firebase from the shop url
 * @see utilities.getShopByFirebaseUID
 */
utilities.getFirebaseUID = (shop) => {
  return `shopify:${shop.replace(/\./g, '-')}`; // replace . (dot) with - (minus) because: Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"
}

/**
 * Split the shop url from the firebase uid string
 * @see utilities.getFirebaseUID
 */
utilities.getShopByFirebaseUID = (uid) => {
  const shop = uid.replace('shopify:', '').replace('-myshopify-com', '.myshopify.com');
  const shopName = utilities.getShopName(shop);
  return {
    shop: shop, // domain
    shopName: shopName // subdomain
  }
}

/**
 * Merge/flatten an array of arrays
 * @see http://stackoverflow.com/a/10865042/1465919
 */
utilities.flattenArrayOfArray = function (arrays) {
  return [].concat.apply([], arrays);
}

module.exports = utilities;