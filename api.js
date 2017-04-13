const ShopifyApi = require('shopify-api-node'); // https://github.com/microapps/Shopify-api-node
const Debug = require('debug');                  // https://github.com/visionmedia/debug

const utilities = require('./utilities.js');

var api = {
  debug: Debug('shopify-server:api')
};


/**
 * Get all params from koa-router query wich compatible with the shopify api
 */
api.parseJsonQuery = (jsonQueryString, methodParsedArgs) => {
  return new Promise((fulfill, reject) => {

    const json = JSON.parse(jsonQueryString);
    api.debug('jsonQueryString', jsonQueryString, 'json', json, 'methodParsedArgs', methodParsedArgs);
    var resultArgs = [];

    if(json === null || typeof(json) !== 'object' || json === {} ) {
      return fulfill(resultArgs);
    }

    if(methodParsedArgs.length <= 0) {
      return fulfill(resultArgs);
    }

    // push found args to resultArgs
    for (var i = 0; i < methodParsedArgs.length; i++) {
      var arg = methodParsedArgs[i];
      if(typeof(json[arg.name]) !== 'undefined' ) {
        methodParsedArgs.isSet = true;
        resultArgs.push(json[arg.name]);
        api.debug(`arg ${arg.name} set to`, json[arg.name], arg);
      } else {
        // arg not set, check if it is required
        if(arg.isOptional === false) {
          return reject(`Arg ${arg.name} is required!`);
        } else {
          api.debug(`ignore arg ${arg.name}`);
        }
      }
    }

    return fulfill(resultArgs);
  });
}

/**
 * Get shopify token from firebase
 * @see https://firebase.google.com/docs/auth/server/verify-id-tokens
 */
api.getShopifyToken = (firebaseApp, firebaseIdToken) => {
  return firebaseApp.auth().verifyIdToken(firebaseIdToken)
  .then((firebaseUser) => {
    api.debug("firebaseUser", firebaseUser);

    // Get a database reference to our token
    var shopifyTokenRef = firebaseApp.database().ref('/shopifyAccessToken/' + firebaseUser.uid);

    return new Promise((resolve, reject) => {
      // Attach an asynchronous callback to read the data at our posts reference
      shopifyTokenRef.on("value", (snapshot) => {
        var shopifyToken = snapshot.val();
        api.debug("shopifyToken", shopifyToken);
        resolve(shopifyToken);
      }, (error) => {
        // Handle error
        console.error(error);
        reject(error);
      });
    });

  }).catch((error) => {
    // Handle error
    console.error(error);
    res.status(500).send(error.message);
  });
}

/**
 * 
 */
api.init = (shopName, shopifyAccessToken) => {
  api.debug('init', 'shopName', shopName);
  return new ShopifyApi({
    shopName: shopName,
    accessToken: shopifyAccessToken,
  });;
}

/**
 * 
 */
api.koa = (opts, app) => {
  const Router = require('koa-router'); // https://github.com/alexmingoia/koa-router/tree/master/
  const router = new Router();
  const jsonp = require('koa-safe-jsonp');
  const json = require('koa-json');     // https://github.com/koajs/json

  api.debug("init koa middleware", 'options', opts);

  if(opts === null || typeof(opts) !== 'object') {
    opts = {};
  }

  if(typeof(opts.appName) !== 'string') {
    opts.appName = 'shopify-app';
  }

  if(typeof(opts.baseUrl) !== 'string') {
    opts.baseUrl = `/api/${opts.appName}/:shopName`;
  }

  if(typeof(opts.contextStorageKey) !== 'string') {
    opts.contextStorageKey = 'session'
  }

  if(opts.firebaseApp === null || typeof(opts.firebaseApp) !== 'object') {
    throw new Error('firebase app is required');
  }

  // Get all api definitions
  api.definitions = require('./definitions.js')({
    appName: opts.appName,
    baseUrl: opts.baseUrl,
  });

  // use json ans jsonp for repsonses
  app.use(json({ pretty: false, param: 'pretty' }));
  jsonp(app);

  // log requests
  app.use(function(ctx, next){
    api.debug(`path: ${ctx.path}`);

    if(ctx.params && ctx.params !== {}) {
      api.debug(`params: `, ctx.params);
    }

    if(ctx.query && ctx.query !== {}) {
      api.debug(`query: `, ctx.query);
    }
    
    return next();
  });

  /**
   * REST API to get all available api definitions
   */
  var url = `${opts.baseUrl}/definitions`;
  api.debug(`init route: ${url}`);
  router.get(url, (ctx) => {
    ctx.body = api.definitions;
  });

  /**
   * REST API to get Shopify Token from firebase and init the shopify api and set it to session
   */
  var url = `${opts.baseUrl}/init/:firebaseIdToken`;
  api.debug(`init route: ${url}`);
  router.get(url, async (ctx) => {
    const appName = opts.appName;
    const shopName = ctx.params.shopName;
    const firebaseIdToken = ctx.params.firebaseIdToken;
    var session = ctx[opts.contextStorageKey];
    await api.getShopifyToken(opts.firebaseApp, firebaseIdToken)
    .then((shopifyToken) => {
      session[appName][shopName].shopifyToken = shopifyToken;

      // TODO: Do not init the api each request!
      var shopify = api.init(shopName, session[appName][shopName].shopifyToken);

      // Test request to check if api is working 
      return shopify.shop.get();
    })
    .then((shopData) => ctx.jsonp = shopData)
    .catch((err) => {
      ctx.throw(500, err); // err.stack
    });
  });

  /**
   * REST API to init Shopify by passing the shopify token as url param
   */
  var url = `${opts.baseUrl}/init/shopifytoken/:shopifyToken`;
  api.debug(`init route: ${url}`);
  router.get(url, async (ctx) => {
    const appName = opts.appName;
    const shopName = ctx.params.shopName;
    const shopifyToken = ctx.params.shopifyToken;
    var session = ctx[opts.contextStorageKey];

    if( session[appName] === null || typeof (session[appName]) !== 'object' ) {
      session[appName] = {};
    }

    if( session[appName][shopName] === null || typeof (session[appName][shopName]) !== 'object' ) {
      session[appName][shopName] = {};
    }    

    session[appName][shopName].shopifyToken = shopifyToken;

    // TODO: Do not init the api each request!
    var shopify = api.init(shopName, session[appName][shopName].shopifyToken);

    // Test request to check if api is working
    await shopify.shop.get()
    .then((shopData) => ctx.jsonp = shopData)
    .catch((err) => {
      ctx.throw(500, error.message);
    });
  });

  /**
   * REST API to test Shopify api if Shopify Token is already setted in session
   */
  var url = `${opts.baseUrl}/test`;
  api.debug(`init route: ${url}`);
  router.get(url, async (ctx) => {
    const appName = opts.appName;
    const shopName = ctx.params.shopName;
    var session = ctx[opts.contextStorageKey];

    if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
      ctx.throw(401, 'Shopify Token not set');
    }

    // TODO: Do not init the api each request!
    var shopify = api.init(shopName, session[appName][shopName].shopifyToken);

    // Test request to check if api is working
    await shopify.shop.get()
    .then((shopData) => ctx.jsonp = shopData)
    .catch((err) => {
      ctx.throw(500, error.message);
    });
  });

  /**
   * REST API to show which REST APIs are existing
   */
  var url = `${opts.baseUrl}/definitions`;
  api.debug(`init route: ${url}`);
  router.get(url, (ctx) => {
    ctx.body = api.definitions;
  });

  /*
   * Init all routes for the Shopify REST API based on Shopify-api-node
   * 
   * @see https://github.com/microapps/Shopify-api-node
   */
  utilities.async.forEach(api.definitions, (resourceName, resource, next) => {
    utilities.async.forEach(resource, (methodName, method, next) => {
      api.debug(`init route: ${method.url}`, method.args);
      router.get(method.url, async (ctx) => {
        const appName = opts.appName;
        const shopName = ctx.params.shopName;

        api.debug(`resource: ${resourceName}`);
        api.debug(`method: ${methodName}`);
        api.debug(`args: ${method.args}`);

        var session = ctx[opts.contextStorageKey];

        if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
          ctx.throw(401, 'Shopify Token not set');
        }

        if(ctx.query === null || typeof(ctx.query) !== 'object' || typeof(ctx.query.json) !== 'string') {
          api.debug(`ctx.query`, ctx.query);
          ctx.throw(401, 'Json query string is required');
        }

        // TODO: Do not init the api each request!
        var shopify = api.init(shopName, session[appName][shopName].shopifyToken);

        await api.parseJsonQuery(ctx.query.json, method.parsedArgs)
        .then((args) => {
          return shopify[resourceName][methodName](...args)
        })
        .then((result) => ctx.jsonp = result)
        .catch((err) => {
          ctx.throw(500, err);
        });
      });
      next();
    });
    next();
  });

  return router.routes();

}

module.exports = api;