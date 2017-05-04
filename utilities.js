const Firebase = require('firebase-admin');
const Debug = require('debug');
const util = require('util');

/**
 * Set of some helpful methods
 * @mixin
 */
let utilities = {
  debug: new Debug('shopify-server:utilities'),
};

/**
 * The util._extend() method was never intended to be used outside of internal Node.js modules. The community found and used it anyway.
 * It is deprecated and should not be used in new code. JavaScript comes with very similar built-in functionality through `Object.assign()`.
 * @param {Object} target
 * @param {Object} source
 * @return {Object} Extended result
 * @deprecated Use Object.assign() instead.
 * @see https://nodejs.org/api/util.html#util_util_extend_target_source
 */
utilities.extend = util._extend;

/**
 * Test if variable is an object
 * @param {any} a Param to test if it is an object
 * @return {boolean} Returns true if param is an object
 */
utilities.isObject = function(a) {
  return (!!a) && (a.constructor === Object);
};

/**
 * Test if variable is an array
 * @param {any} a Param to test if it is an array
 * @return {boolean} Returns true if param is an array
 * @deprecated Use `Array.isArray` instead
 */
utilities.isArray = function(a) {
  return (!!a) && (a.constructor === Array);
};

/**
 * Delay promise that will delay the execution of the next promise in the chain.
 * @param {Number} delay delay in ms
 * @return {Prmise<any>}
 * @see https://blog.raananweber.com/2015/12/01/writing-a-promise-delayer/
 */
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

/**
 * Run promise-returning & async functions a specific number of times concurrently.
 * @param {Number} count Number of times to call mapper.
 * @param {Function} mapper Expected to return a Promise or value.
 * @param {Object} opts
 * @return {Promise} Returns a Promise that is fulfilled when all promises returned from mapper are fulfilled,
 * or rejects if any of the promises reject.
 * The fulfilled value is an Array of the fulfilled values returned from mapper in order.
 * @see https://github.com/sindresorhus/p-times
 */
utilities.pTimes = require('p-times');

/**
 * Map over promises concurrently.
 * Useful when you need to run promise-returning & async functions multiple times with different inputs concurrently.
 * @param {Iterable<Promise>} input Iterated over concurrently in the mapper function.
 * @param {Function} mapper mapper(element, index), Expected to return a Promise or value.
 * @param {Object} options
 * @return {Promise} Returns a Promise that is fulfilled when all promises in input and ones returned from mapper are fulfilled,
 * or rejects if any of the promises reject.
 * The fulfilled value is an Array of the fulfilled values returned from mapper in input order.
 * @see https://github.com/sindresorhus/p-map
 */
utilities.pMap = require('p-map');

/**
 * Iterate over object keys
 * @param {Object} o the Object you want to interate over
 * @param {Function} cb callback
 * @see http://stackoverflow.com/a/7442013/1465919
 */
utilities.forEach = (o, cb) => {
  let counter = 0;
  let keys = Object.keys(o);
  let len = keys.length;
  let next = () => {
    if (counter < len)
    cb(keys[counter], o[keys[counter++]], next);
  };
  next();
};

/**
 * Creates and initializes a Firebase app instance by app name, service account and database url
 * @param {String} appName App Name
 * @param {Object} firebaseServiceAccount service account
 * @param {Object} firebaseDatabaseURL database url
 * @return {firebase.app.App}
 * @see https://firebase.google.com/docs/reference/js/firebase#.initializeApp
 */
utilities.initFirebase = (appName, firebaseServiceAccount, firebaseDatabaseURL ) => {
  let firebase = Firebase.initializeApp({
    credential: Firebase.credential.cert(firebaseServiceAccount),
    databaseURL: firebaseDatabaseURL,
  }, appName);

  return firebase;
};

/**
 * Get CURRENT_LOGGED_IN_SHOP from CURRENT_LOGGED_IN_SHOP.myshopify.com
 * @param {String} shop the shop, e.g. CURRENT_LOGGED_IN_SHOP.myshopify.com
 * @return {String} the shopname e.g. CURRENT_LOGGED_IN_SHOP
 */
utilities.getShopName = (shop) => {
  return shop.substring(0, shop.indexOf('.'));
};

/**
 * Get shop app admin url of shop stirng and api key.
 * E.g. if shop string is `CURRENT_LOGGED_IN_SHOP.myshopify.com` and the api key is `123456`
 * the result will be `https://CURRENT_LOGGED_IN_SHOP.myshopify.com/admin/apps/123456`
 * @param {String} shop the shop, e.g. `CURRENT_LOGGED_IN_SHOP.myshopify.com`
 * @param {String} apiKey the api key, e.g. `123456`
 * @return {String} the shop app admin url, eg.g `https://CURRENT_LOGGED_IN_SHOP.myshopify.com/admin/apps/123456`
 */
utilities.getShopifyAppUrl = (shop, apiKey) => {
  return 'https://'+shop+'/admin/apps/'+apiKey;
};

/**
 * Generates a uid string for firebase from the shop url
 * @see utilities.getShopByFirebaseUID
 * @param {String} shop the shop, e.g. CURRENT_LOGGED_IN_SHOP.myshopify.com
 * @return {String} the firebase user id e.g. shopify:CURRENT_LOGGED_IN_SHOP-myshopify-com
 */
utilities.getFirebaseUID = (shop) => {
  return `shopify:${shop.replace(/\./g, '-')}`; // replace . (dot) with - (minus) because: Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"
};

/**
 * Split the shop url from the firebase uid string
 * @see utilities.getFirebaseUID
 * @param {String} uid firebase user id
 * @return {Object} shop and shopname
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
 * @param {Array<Array>} arrays array of arrays
 * @return {Array} flatten array
 * @see http://stackoverflow.com/a/10865042/1465919
 */
utilities.flattenArrayOfArray = (arrays) => {
  let tmp = [];
  return tmp.concat.apply([], arrays);
};

utilities.underscoreToCamelcase = (str) => {
	return str.replace(/(_[a-z])/g, ($1) => {
    return $1.toUpperCase().replace('_', '');
  });
};

/**
 * Make the first letter of a string uppercase
 * @param {String} str
 * @return {String} str with fist letter in uppercase
 * @see http://stackoverflow.com/a/1026087
 */
utilities.capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Merge/flatten an array of arrays
 * @param {String} ressourceName ressource name
 * @param {String} actionName action name
 * @return {String} Methodname in camelCase
 */
utilities.ressourceActionToCamelCase = (ressourceName, actionName) => {
  return utilities.underscoreToCamelcase(ressourceName) + utilities.capitalizeFirstLetter(utilities.underscoreToCamelcase(actionName));
};

/**
 * Shopify Server Utilities
 * @module shopify-server/utilities
 * @see {@link utilities}
 */
module.exports = utilities;
