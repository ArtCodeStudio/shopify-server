const ShopifyToken = require('shopify-token');  // https://github.com/lpinca/shopify-token
const ShopifyApi = require('shopify-api-node'); // https://github.com/microapps/Shopify-api-node
const Firebase = require('firebase-admin');
const Debug = require('debug')                  // https://github.com/visionmedia/debug

const util = require('util');
const extend = util._extend;

var auth = {
  debug: Debug('shopify-server:auth')
};
var utilities = {
  debug: Debug('shopify-server:utilities')
};
var api = {
  debug: Debug('shopify-server:api')
};

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

auth.initFirebase = (appName, firebaseServiceAccount, firebaseDatabaseURL ) => {
  var firebase = Firebase.initializeApp({
    credential: Firebase.credential.cert(firebaseServiceAccount),
    databaseURL: firebaseDatabaseURL,
  }, appName);

  return firebase;
}

/**
 * @param appName
 * @param shopifyConfig
 * @param firebaseServiceAccount (optional)
 * @param firebaseDatabaseURL (optional)
 */
auth.init = (appName, shopifyConfig, firebaseServiceAccount, firebaseDatabaseURL ) => {
  auth.debug('init', 'appname', appName, 'shopifyConfig', shopifyConfig, 'firebaseServiceAccount', firebaseServiceAccount, 'firebaseDatabaseURL', firebaseDatabaseURL);
  var result = {};

  result.shopify = new ShopifyToken(shopifyConfig);

  if(firebaseServiceAccount !== null && typeof(firebaseServiceAccount) === 'object') {
    result.firebase = auth.initFirebase(appName, firebaseServiceAccount, firebaseDatabaseURL);
  }

  return result;
}

auth.getFirebaseUID = (shop) => {
  return `shopify:${shop.replace(/\./g, '-')}`; // replace . (dot) with - (minus) because: Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"
}

/**
 * Creates a Firebase custom auth token for the given Shopify user ID.
 *
 * @callback The Firebase custom auth token and the uid.
 */
auth.createFirebaseCustomAuth = (firebaseApp, appName, shop, cb) => {
  // The UID we'll assign to the user.
  var uid = auth.getFirebaseUID(shop);

  // Create the custom token.
  if(!cb) {
    return firebaseApp.auth().createCustomToken(uid);
  } else {
    firebaseApp.auth().createCustomToken(uid)
    .then((customToken) => {
      // Send token back to client
      // console.log('Created Custom token for UID "', uid, '" Token:', customToken);
      cb(null, {
        token: customToken,
        uid: uid,
      })
    })
    .catch((error) => {
      return cb(error);
    });
  }

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

/**
 * Koa middleware
 *
 *
 * For an example how you can write your own middleware for koa you can lool at koa-logger
 * @see https://github.com/koajs/logger
 */
auth.koa = (opts, app) => {
  const Router = require('koa-router'); // https://github.com/alexmingoia/koa-router/tree/master/
  const router = new Router();
  const json = require('koa-json');     // https://github.com/koajs/json
  const jsonp = require('koa-safe-jsonp');

  auth.debug("init koa middleware", 'options', opts);;

  if(opts === null || typeof(opts) !== 'object') {
    opts = {};
  }

  if(typeof(opts.contextStorageKey) !== 'string') {
    opts.contextStorageKey = 'session'
  }

  // if(typeof(ctx.storage) === 'undefined') {
  //   throw new Error('You need a session storage or something similar');
  // }

  if(typeof(opts.appName) !== 'string') {
    throw new Error('app name string is required');
  }

  if(opts.shopifyConfig === null || typeof(opts.shopifyConfig) !== 'object') {
    throw new Error('shopify config object is required');
  }
  
  if(opts.firebaseServiceAccount === null || typeof(opts.firebaseServiceAccount) !== 'object') {
    throw new Error('firebase service account config for admin sdk object is required, see https://firebase.google.com/docs/admin/setup');
  }

  if(opts.firebaseWebAppConfig === null || typeof(opts.firebaseWebAppConfig) !== 'object') {
    throw new Error('firebase config object for web apps is required, see https://firebase.google.com/docs/web/setup');
  }

  const authObj = auth.init(opts.appName, opts.shopifyConfig, opts.firebaseServiceAccount, opts.firebaseWebAppConfig.databaseURL);
  const shopifyToken = authObj.shopify;
  const firebaseApp = authObj.firebase;

  // init json and jsonp middleware / api
  app.use(json({ pretty: false, param: 'pretty' }));
  jsonp(app);

  /**
  * The router can use regex in path
  * @see https://github.com/pillarjs/path-to-regexp
  */
  router
    /**
     * Redirects the User to the Shopify authentication consent screen. Also the 'state' session is set for later state verification.
     */
    .get(`/redirect/${opts.appName}/:shopName`, (ctx) => {

      const appName = opts.appName;
      const shopName = ctx.params.shopName;
      var session = ctx[opts.contextStorageKey];

      auth.debug(`/redirect/${opts.appName}/:shopName`, 'shopName', shopName);

      if(!session[appName]) {
        session[appName] = {};
      }

      if(!session[appName][shopName]) {
        session[appName][shopName] = {};
      }

      // TODO
      // if (session[appName][shopName].token) {
      //   return ctx.send('Token ready to be used');
      // }

      /**
       * Generate a random nonce.
       */
      const nonce = shopifyToken.generateNonce();

      /**
      * Generate the authorization URL. For the sake of simplicity the shop name
      * is fixed here but it can, of course, be passed along with the request and
      * be different for each request.
      */
      const uri = shopifyToken.generateAuthUrl(shopName, opts.shopifyConfig.scopes, nonce);

      /**
       * Save the nonce in the session to verify it later.
       */
      session[appName][shopName].state = nonce;
      ctx.redirect(uri);

    })
    /**
     * Exchanges a given Shopify auth code passed in the 'code' URL query parameter for a Firebase auth token.
     * The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie to avoid
     * Session Fixation attacks.
     * This is meant to be used by Web Clients.
    */
    .get(`/shopify-callback/${opts.appName}`, async (ctx, next) => {
      const state = ctx.query.state;
      const appName = opts.appName;
      const shopName = utilities.getShopName(ctx.query.shop);
      var session = ctx[opts.contextStorageKey];

      auth.debug(`/shopify-callback/${opts.appName}`, 'ctx.query', ctx.query, 'ctx.params', ctx.params, 'session', session);

      if(!session[appName]) {
        session[appName] = {};
      }

      if(!session[appName][shopName]) {
        session[appName][shopName] = {};
      }

      // Validate the state.
      if (ctx.query.state !== session[appName][shopName].state) {
        ctx.throw(400, 'Security checks failed (state)');
      }

      // Validare the hmac.
      if (!shopifyToken.verifyHmac(ctx.query)) {
        ctx.throw(400, 'Security checks failed (hmac)');
      }

      /**
      * Exchange the authorization code for a permanent access token.
      */
      await shopifyToken.getAccessToken(ctx.query.shop, ctx.query.code)
        .then((shopifyAccessToken) => {
          auth.debug('Resive Token:', shopifyAccessToken);
          session[appName][shopName].shopifyToken = shopifyAccessToken;
          return auth.createFirebaseCustomAuth(firebaseApp, appName, ctx.query.shop); //, (err, firebaseAuth) => {
        })
        .then((customToken) => {
          session[appName][shopName].firebaseToken = customToken;
          session[appName][shopName].firebaseUid = auth.getFirebaseUID(ctx.query.shop);
          session[appName][shopName].state = undefined;

          // Serve an HTML page that signs the user in and updates the user profile.
          const template = auth.signInFirebaseTemplate(ctx.query.shop, appName, session[appName][shopName].shopifyToken, opts.shopifyConfig.apiKey, session[appName][shopName].firebaseToken, opts.firebaseServiceAccount.project_id, opts.firebaseWebAppConfig.apiKey);
          ctx.body = template;
        })
        .catch((err) => {
          ctx.throw(500, err); // err.stack
        });

    })
    /**
    * Get token
    * TODO Is this safe through sessions?
    */
    .get(`/token/${opts.appName}/:shopName`, (ctx) => {
      const appName = opts.appName;
      const shopName = ctx.params.shopName;
      var session = ctx[opts.contextStorageKey];

      auth.debug(`/token/${opts.appName}/${shopName}`);

      if( session[appName] && session[appName][shopName] && session[appName][shopName].firebaseToken ) {
        ctx.jsonp = {
          firebaseToken: session[appName][shopName].firebaseToken,
        }
      } else {
        ctx.status = 404;
        ctx.jsonp = {
          status: 404,
          message: 'Not Found'
        }
        // ctx.throw(404, 'Not Found');
      }

    })
    ;

    return router.routes();
}

api.definitions = require('./api-definitions');

/**
 * Get all params from express query wich compatible with the shopify api
 */
api.parseParamsQuery = (query) => {
  var result = {
    params: extend({}, query),
  };
  delete result.params.callback;
  delete result.params._;

  var possibleArgs = ["id", "blogId", "themeId", "id", "customerId", "orderId", "fulfillmentId",
                        "productId", "countryId", "recurringApplicationChargeId"];

  var paramName;

  for (var i=0; i<possibleArgs.length; i++) {
    paramName=possibleArgs[i];
    if (result.params[paramName])
      result[paramName]=result.params[paramName];
      delete result.params[paramName];
  }

  return result;
}

api.init = (shopName, shopifyAccessToken) => {
  var shopify = new ShopifyApi({
    shopName: shopName,
    accessToken: shopifyAccessToken,
  });
  return shopify;
}

api.koa = (opts, app) => {
  const jsonp = require('koa-safe-jsonp');
  jsonp(app);


}

module.exports = {
  utilities: utilities,
  auth: auth,
  api: api,
}