/*jslint es6 */

'use strict';

const ShopifyApi = require('shopify-api-node');   // https://github.com/microapps/Shopify-api-node
const Debug = require('debug');                   // https://github.com/visionmedia/debug


const utilities = require('./utilities.js');

var api = {
  debug: new Debug('shopify-server:api')
};


/**
 * Get all params from koa-router query wich compatible with the shopify api
 */
var parseJsonQuery = (jsonQueryString, methodParsedArgs) => {
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
 * Custom Api implementations for metafields 
 */
api.metafield = {};

/**
 * Delete multiple metafields at once
 * TODO TESTME: This function is not tested, just ported from https://git.mediamor.de/jumplink.eu/microservice-shopify/src/master/microservice-shopify.js#L134
 */
api.metafield.deleteAll = (shopify, ids) => {
  return utilities.async.pMap(ids, (id, index) => {
    return shopify.metafield.delete(id)
  });
}

/**
 * Update multiple metafields at once
 * TODO TESTME: This function is not tested, just ported from https://git.mediamor.de/jumplink.eu/microservice-shopify/src/master/microservice-shopify.js#L164
 */
api.metafield.updateAll = (shopify, metafields) => {
  return utilities.async.pMap(metafields, (metafield, index) => {
    var metafield = {
      id: metafield.id,
      value: metafield.value,
      value_type: metafield.value_type,
    }
    // console.log(metafield.id, metafield);
    return shopify.metafield.update(metafield.id, metafield)
  });
}

/**
 * Custom Api implementations for products 
 */
api.product = {};

/**
 * Custom Api implementation to get all products at once without pagination
 */
api.product.listAll = (shopify) => {
  const itemsPerPage = 250;
  return shopify.product.count()
  .then((count) => {
    var pages = Math.round(count / itemsPerPage);

    // Are there any remaining items on the next page?
    if(count % itemsPerPage > 0 ) {
      pages++;
    }

    if(pages <= 0) {
      pages = 1;
    }

    api.debug("count", count);
    api.debug("pages", pages);

    return utilities.async.pTimes(pages, (n) => {
      n += 1;
      api.debug("page", n);
      return shopify.product.list({limit: itemsPerPage, page: n})
    });
  })
  .then((itemsOfItems) => {
    var items = utilities.flattenArrayOfArray(itemsOfItems);
    return items;
  });
}

/**
 * Custom Api implementations for customers 
 */
api.customer = {};

/**
 * Custom Api implementation to get all customers at once without pagination
 */
api.customer.listAll = (shopify, metafields) => {
  const itemsPerPage = 250;
  return shopify.customer.count()
  .then((count) => {
    var pages = Math.round(count / itemsPerPage);

    // Are there any remaining items on the next page?
    if(count % itemsPerPage > 0 ) {
      pages++;
    }

    if(pages <= 0) {
      pages = 1;
    }

    api.debug("count", count);
    api.debug("pages", pages);

    return utilities.async.pTimes(pages, (n) => {
      n += 1;
      api.debug("page", n);
      return shopify.customer.list({limit: itemsPerPage, page: n})
    });
  })
  .then((itemsOfItems) => {
    var items = utilities.flattenArrayOfArray(itemsOfItems);
    return items;
  });
}

/**
 * Custom Api implementations for smartCollection 
 */
api.smartCollection = {};

/**
 * Custom Api implementation to get all smartCollection at once without pagination
 */
api.smartCollection.listAll = (shopify, metafields) => {
  const itemsPerPage = 250;
  return shopify.smartCollection.count()
  .then((count) => {
    var pages = Math.round(count / itemsPerPage);

    // Are there any remaining items on the next page?
    if(count % itemsPerPage > 0 ) {
      pages++;
    }

    if(pages <= 0) {
      pages = 1;
    }

    api.debug("count", count);
    api.debug("pages", pages);

    return utilities.async.pTimes(pages, (n) => {
      n += 1;
      api.debug("page", n);
      return shopify.smartCollection.list({limit: itemsPerPage, page: n})
    });
  })
  .then((itemsOfItems) => {
    var items = utilities.flattenArrayOfArray(itemsOfItems);
    return items;
  });
}

/**
 * Custom Api implementations for customCollection 
 */
api.customCollection = {};

/**
 * Custom Api implementation to get all customCollection at once without pagination
 */
api.customCollection.listAll = (shopify, metafields) => {
  const itemsPerPage = 250;
  return shopify.customCollection.count()
  .then((count) => {
    var pages = Math.round(count / itemsPerPage);

    // Are there any remaining items on the next page?
    if(count % itemsPerPage > 0 ) {
      pages++;
    }

    if(pages <= 0) {
      pages = 1;
    }

    api.debug("count", count);
    api.debug("pages", pages);

    return utilities.async.pTimes(pages, (n) => {
      n += 1;
      api.debug("page", n);
      return shopify.customCollection.list({limit: itemsPerPage, page: n})
    });
  })
  .then((itemsOfItems) => {
    var items = utilities.flattenArrayOfArray(itemsOfItems);
    return items;
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
 * Koa middleware for shopify rest api
 * @requires koa-router, koa-json, koa-safe-jsonp
 */
api.koa = (opts, app) => {
  const Router = require('koa-router'); // https://github.com/alexmingoia/koa-router/tree/master/
  const router = new Router();

  api.debug("init koa middleware", 'options', opts);

  if(opts === null || typeof(opts) !== 'object') {
    opts = {};
  }

  if(typeof(opts.appName) !== 'string') {
    opts.appName = 'shopify-app';
  }

  if(opts.shopifyConfig === null || typeof(opts.shopifyConfig) !== 'object') {
    throw new Error('shopify config object is required');
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
   * REST API to get Shopify Token from firebase, init the shopify api and set the token to session
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
   * REST API to init Shopify by passing the shopify token as url param and set the token to session
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
   * REST API to test if the Shopify api is working
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
    ctx.body = {
      api: api.definitions,
      scopes: opts.shopifyConfig.scopes,
    }
  });

  /**
   * Custom Api metafield/deleteAll implementation
   * @see api.metafield.updateAll
   */
  var url = `${opts.baseUrl}/metafield/deleteAll`;
  api.debug(`init route: ${url}`);
  router.get(url, async (ctx) => {
    const appName = opts.appName;
    const shopName = ctx.params.shopName;
    const session = ctx[opts.contextStorageKey];
    const metafields = req.query.metafields;

    if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
      ctx.throw(401, 'Shopify Token not set');
    }

    if(ctx.query === null || typeof(ctx.query) !== 'object' || typeof(ctx.query.json) !== 'string') {
      api.debug(`ctx.query`, ctx.query);
      ctx.throw(401, 'Json query string is required');
    }

    const params = JSON.parse(ctx.query.json);

    if(params === null || typeof(params) !== 'object' || !Array.isArray(params.ids) ) {
      api.debug(`ctx.query`, ctx.query);
      ctx.throw(401, 'ids property required and needs to be an array');
    }

    // TODO: Do not init the api each request!
    const shopify = api.init(shopName, session[appName][shopName].shopifyToken);

    await api.metafield.deleteAll(shopify, params.ids)
    .then((metafields) => {
      ctx.jsonp = metafields;
    })
    .catch((error) => {
      ctx.throw(500, error);
    });
  });

  /**
   * Custom Api metafield/updateAll implementation
   * @see api.metafield.updateAll
   */
  var url = `${opts.baseUrl}/metafield/updateAll`;
  api.debug(`init route: ${url}`);
  router.get(url, async (ctx) => {
    const appName = opts.appName;
    const shopName = ctx.params.shopName;
    const session = ctx[opts.contextStorageKey];
    const metafields = req.query.metafields;

    if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
      ctx.throw(401, 'Shopify Token not set');
    }

    if(ctx.query === null || typeof(ctx.query) !== 'object' || typeof(ctx.query.json) !== 'string') {
      api.debug(`ctx.query`, ctx.query);
      ctx.throw(401, 'Json query string is required');
    }

    const params = JSON.parse(ctx.query.json);

    if(params === null || typeof(params) !== 'object' || !Array.isArray(params.metafields) ) {
      api.debug(`ctx.query`, ctx.query);
      ctx.throw(401, 'metafields property required and needs to be an array');
    }

    // TODO: Do not init the api each request!
    const shopify = api.init(shopName, session[appName][shopName].shopifyToken);

    await api.metafield.updateAll(shopify, params.metafields)
    .then((metafields) => {
      ctx.jsonp = metafields;
    })
    .catch((error) => {
      ctx.throw(500, error);
    });
  });

  /**
   * Custom Api product/listAll implementation
   * @see api.product.listAll
   */
  var url = `${opts.baseUrl}/product/listAll`;
  api.debug(`init route: ${url}`);
  router.get(url, async (ctx) => {
    const appName = opts.appName;
    const shopName = ctx.params.shopName;
    const session = ctx[opts.contextStorageKey];

    if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
      ctx.throw(401, 'Shopify Token not set');
    }

    // TODO: Do not init the api each request!
    const shopify = api.init(shopName, session[appName][shopName].shopifyToken);

    await api.product.listAll(shopify)
    .then((results) => {
      ctx.jsonp = results;
    })
    .catch((error) => {
      ctx.throw(500, error);
    });
  });

  /**
   * Custom Api customer/listAll implementation
   * @see api.customer.listAll
   */
  var url = `${opts.baseUrl}/customer/listAll`;
  api.debug(`init route: ${url}`);
  router.get(url, async (ctx) => {
    const appName = opts.appName;
    const shopName = ctx.params.shopName;
    const session = ctx[opts.contextStorageKey];

    if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
      ctx.throw(401, 'Shopify Token not set');
    }

    // TODO: Do not init the api each request!
    const shopify = api.init(shopName, session[appName][shopName].shopifyToken);

    await api.customer.listAll(shopify)
    .then((results) => {
      ctx.jsonp = results;
    })
    .catch((error) => {
      ctx.throw(500, error);
    });
  });

  /**
   * Custom Api smartCollection/listAll implementation
   * @see api.smartCollection.listAll
   */
  var url = `${opts.baseUrl}/smartCollection/listAll`;
  api.debug(`init route: ${url}`);
  router.get(url, async (ctx) => {
    const appName = opts.appName;
    const shopName = ctx.params.shopName;
    const session = ctx[opts.contextStorageKey];

    if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
      ctx.throw(401, 'Shopify Token not set');
    }

    // TODO: Do not init the api each request!
    const shopify = api.init(shopName, session[appName][shopName].shopifyToken);

    await api.smartCollection.listAll(shopify)
    .then((results) => {
      ctx.jsonp = results;
    })
    .catch((error) => {
      ctx.throw(500, error);
    });
  });

  /**
   * Custom Api customCollection/listAll implementation
   * @see api.customCollection.listAll
   */
  var url = `${opts.baseUrl}/customCollection/listAll`;
  api.debug(`init route: ${url}`);
  router.get(url, async (ctx) => {
    const appName = opts.appName;
    const shopName = ctx.params.shopName;
    const session = ctx[opts.contextStorageKey];

    if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
      ctx.throw(401, 'Shopify Token not set');
    }

    // TODO: Do not init the api each request!
    const shopify = api.init(shopName, session[appName][shopName].shopifyToken);

    await api.customCollection.listAll(shopify)
    .then((results) => {
      ctx.jsonp = results;
    })
    .catch((error) => {
      ctx.throw(500, error);
    });
  });

  /*
   * Init all routes for the Shopify REST API based on Shopify-api-node
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

        await parseJsonQuery(ctx.query.json, method.parsedArgs)
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

  return router;

}

module.exports = api;