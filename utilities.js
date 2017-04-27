const Firebase = require('firebase-admin');
const Debug = require('debug')  // https://github.com/visionmedia/debug
const util = require('util');

let utilities = {
  debug: new Debug('shopify-server:utilities')
};

utilities.extend = util._extend;

utilities.isObject = function(a) {
  return (!!a) && (a.constructor === Object);
};

utilities.isArray = function(a) {
  return (!!a) && (a.constructor === Array);
};

// see https://blog.raananweber.com/2015/12/01/writing-a-promise-delayer/
utilities.delayPromise = (delay) => {
  // return a function that accepts a single variable
  return function(data) {
    // this function returns a promise.
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        // a promise that is resolved after "delay" milliseconds with the data provided
        resolve(data);
      }, delay);
    });
  };
};

utilities.async = {};
/**
 * Iterate over object keys
 * @see http://stackoverflow.com/a/7442013/1465919
 */
utilities.async.forEach = (o, cb) => {
  let counter = 0;
  let keys = Object.keys(o);
  let len = keys.length;
  let next = () => {
    if (counter < len)
    cb(keys[counter], o[keys[counter++]], next);
  };
  next();
};

utilities.initFirebase = (appName, firebaseServiceAccount, firebaseDatabaseURL ) => {
  let firebase = Firebase.initializeApp({
    credential: Firebase.credential.cert(firebaseServiceAccount),
    databaseURL: firebaseDatabaseURL,
  }, appName);

  return firebase;
};

/**
 * Get CURRENT_LOGGED_IN_SHOP from CURRENT_LOGGED_IN_SHOP.myshopify.com
 */
utilities.getShopName = (shop) => {
  return shop.substring(0, shop.indexOf('.'));
};


utilities.getShopifyAppUrl = (shop, apiKey) => {
  return 'https://'+shop+'/admin/apps/'+apiKey;
};

/**
 * Generates a uid string for firebase from the shop url
 * @see utilities.getShopByFirebaseUID
 */
utilities.getFirebaseUID = (shop) => {
  return `shopify:${shop.replace(/\./g, '-')}`; // replace . (dot) with - (minus) because: Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"
};

/**
 * Split the shop url from the firebase uid string
 * @see utilities.getFirebaseUID
 */
utilities.getShopByFirebaseUID = (uid) => {
  const shop = uid.replace('shopify:', '').replace('-myshopify-com', '.myshopify.com');
  const shopName = utilities.getShopName(shop);
  return {
    shop: shop, // domain
    shopName: shopName, // subdomain
  };
};

/**
 * Merge/flatten an array of arrays
 * @see http://stackoverflow.com/a/10865042/1465919
 */
utilities.flattenArrayOfArray = (arrays) => {
  return [].concat.apply([], arrays);
};

module.exports = utilities;
