var auth = {};
var utilities = {};

const ShopifyToken = require('shopify-token');
const Firebase = require('firebase-admin');

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
 * @param appName
 * @param shopifyConfig
 * @param firebaseServiceAccount (optional)
 * @param firebaseDatabaseURL (optional)
 */
auth.init = (appName, shopifyConfig, firebaseServiceAccount, firebaseDatabaseURL ) => {
  var result = {};

  result.shopify = new ShopifyToken(shopifyConfig);

  if(firebaseServiceAccount !== null && typeof(firebaseServiceAccount) === 'object') {
    result.firebase = Firebase.initializeApp({
      credential: Firebase.credential.cert(firebaseServiceAccount),
      databaseURL: firebaseDatabaseURL,
    }, appName);
  }

  return result;
}

/**
 * Creates a Firebase custom auth token for the given Shopify user ID.
 *
 * @returns {Object} The Firebase custom auth token and the uid.
 */
auth.createFirebaseCustomAuth = (firebaseApp, appName, shopifyStore, cb) => {
  // The UID we'll assign to the user.
  var uid = `shopify:${shopifyStore.replace(/\./g, '-')}`; // replace . (dot) with - (minus) because: Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"

  // Create the custom token.
  firebaseApp.auth().createCustomToken(uid)
  .then((customToken) => {
    // Send token back to client
    // console.log('Created Custom token for UID "', uid, '" Token:', customToken);
    return cb(null, {
      token: customToken,
      uid: uid,
    })
  })
  .catch((error) => {
    console.log("Error creating custom token:", error);
    return cb(error);
  });
}

/**
 * Generates the HTML template that:
 *  - Signs the user in Firebase using the given token
 *  - Updates the user profile with shop
 *  - Saves the Shopify AccessToken to the Realtime Database
 *  - Closes the popup
 */
auth.signInFirebaseTemplate = (shop, appName, shopifyAccessToken, shopifyApiKey, firebaseToken, firebaseProjectId, firebaseApiKey) => {
  return `
    <script src="https://www.gstatic.com/firebasejs/3.7.5/firebase.js"></script>
    <script>
      /*
       * Promise Polyfill for older browsers
       * @see https://github.com/taylorhakes/promise-polyfill
       */
      !function(e){function n(){}function t(e,n){return function(){e.apply(n,arguments)}}function o(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],s(e,this)}function i(e,n){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(n):(e._handled=!0,void o._immediateFn(function(){var t=1===e._state?n.onFulfilled:n.onRejected;if(null===t)return void(1===e._state?r:u)(n.promise,e._value);var o;try{o=t(e._value)}catch(i){return void u(n.promise,i)}r(n.promise,o)}))}function r(e,n){try{if(n===e)throw new TypeError("A promise cannot be resolved with itself.");if(n&&("object"==typeof n||"function"==typeof n)){var i=n.then;if(n instanceof o)return e._state=3,e._value=n,void f(e);if("function"==typeof i)return void s(t(i,n),e)}e._state=1,e._value=n,f(e)}catch(r){u(e,r)}}function u(e,n){e._state=2,e._value=n,f(e)}function f(e){2===e._state&&0===e._deferreds.length&&o._immediateFn(function(){e._handled||o._unhandledRejectionFn(e._value)});for(var n=0,t=e._deferreds.length;n<t;n++)i(e,e._deferreds[n]);e._deferreds=null}function c(e,n,t){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof n?n:null,this.promise=t}function s(e,n){var t=!1;try{e(function(e){t||(t=!0,r(n,e))},function(e){t||(t=!0,u(n,e))})}catch(o){if(t)return;t=!0,u(n,o)}}var a=setTimeout;o.prototype["catch"]=function(e){return this.then(null,e)},o.prototype.then=function(e,t){var o=new this.constructor(n);return i(this,new c(e,t,o)),o},o.all=function(e){var n=Array.prototype.slice.call(e);return new o(function(e,t){function o(r,u){try{if(u&&("object"==typeof u||"function"==typeof u)){var f=u.then;if("function"==typeof f)return void f.call(u,function(e){o(r,e)},t)}n[r]=u,0===--i&&e(n)}catch(c){t(c)}}if(0===n.length)return e([]);for(var i=n.length,r=0;r<n.length;r++)o(r,n[r])})},o.resolve=function(e){return e&&"object"==typeof e&&e.constructor===o?e:new o(function(n){n(e)})},o.reject=function(e){return new o(function(n,t){t(e)})},o.race=function(e){return new o(function(n,t){for(var o=0,i=e.length;o<i;o++)e[o].then(n,t)})},o._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){a(e,0)},o._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},o._setImmediateFn=function(e){o._immediateFn=e},o._setUnhandledRejectionFn=function(e){o._unhandledRejectionFn=e},"undefined"!=typeof module&&module.exports?module.exports=o:e.Promise||(e.Promise=o)}(this);

      var token = '${firebaseToken}';
      var config = {
        apiKey: '${firebaseApiKey}',
        databaseURL: 'https://${firebaseProjectId}.firebaseio.com'
      };
      console.log("config", config);
      // We sign in via a temporary Firebase app to update the profile.
      var tempApp = firebase.initializeApp(config, '_temp_');
      tempApp.auth().signInWithCustomToken(token).then(function(user) {
        console.log("user", user);

        // Saving the Shopify API access token in the Realtime Database.
        const tasks = [tempApp.database().ref('/shopifyAccessToken/' + user.uid).set('${shopifyAccessToken}')];

        // Updating the shop if needed.
        if ('${shop}' !== user.shop) {
          tasks.push(user.updateProfile({shop: '${shop}'}));
        }

        // Wait for completion of above tasks.
        return Promise.all(tasks).then(function() {
          // Delete temporary Firebase app and sign in the default Firebase app, then close the popup.
          var defaultApp = firebase.initializeApp(config);
          Promise.all([tempApp.delete(), defaultApp.auth().signInWithCustomToken(token)]).then(function() {
            window.location.href = '${utilities.getShopifyAppUrl(shop, shopifyApiKey)}';
          });
        });
      });
    </script>`;
}

module.exports = {
  utilities: utilities,
  auth: auth,
}