'use strict';

/*!
* Module dependencies.
*/
const ShopifyApi = require('shopify-api-node');   // https://github.com/microapps/Shopify-api-node
const Debug = require('debug');                   // https://github.com/visionmedia/debug
const utilities = require(__dirname + '/utilities.js');

/**
 * Shopify api helpers like a koa middleware for a shopify rest api or custom api methods 
 * @alias shopify-server/Api
 */
class Api {

  /**
   * Creates an instance of Api
   */
  constructor() {
    this.debug = new Debug('shopify-server:api');
  }

  /**
   * Delete multiple metafields at once
   * @todo This function is not tested, just ported from https://git.mediamor.de/jumplink.eu/microservice-shopify/src/master/microservice-shopify.js#L134
   * 
   * @param {object} shopify shopify api instance
   * @param {number[]} ids 
   * @returns {Promise} Each api method returns a Promise that resolves with the result
   */
  metafieldDeleteAll(shopify, ids) {
    return utilities.pMap(ids, (id, index) => {
      return shopify.metafield.delete(id)
    });
  }

  /**
   * Update multiple metafields at once
   * @todo This function is not tested, just ported from https://git.mediamor.de/jumplink.eu/microservice-shopify/src/master/microservice-shopify.js#L164
   * 
   * @param {object} shopify shopify api instance 
   * @param {object[]} metafields 
   * @returns {Promise} Each api method returns a Promise that resolves with the result
   */
  metafieldUpdateAll (shopify, metafields) {
    return utilities.pMap(metafields, (metafield, index) => {
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
   * Custom Api implementation to get all products at once without pagination
   * 
   * @param {object} shopify shopify api instance 
   * @returns {Promise} Each api method returns a Promise that resolves with the result
   */
  productListAll(shopify) {
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

      this.debug("count", count);
      this.debug("pages", pages);

      return utilities.pTimes(pages, (n) => {
        n += 1;
        this.debug("page", n);
        return shopify.product.list({limit: itemsPerPage, page: n})
      });
    })
    .then((itemsOfItems) => {
      var items = utilities.flattenArrayOfArray(itemsOfItems);
      return items;
    });
  }

  /**
   * Custom Api implementation to get all customers at once without pagination
   * 
   * @param {object} shopify shopify api instance 
   * @param {object[]} metafields 
   * @returns {Promise} Each api method returns a Promise that resolves with the result
   */
  customerListAll(shopify, metafields) {
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

      this.debug('count', count);
      this.debug('pages', pages);

      return utilities.pTimes(pages, (n) => {
        n += 1;
        this.debug("page", n);
        return shopify.customer.list({limit: itemsPerPage, page: n})
      });
    })
    .then((itemsOfItems) => {
      var items = utilities.flattenArrayOfArray(itemsOfItems);
      return items;
    });
  }

  /**
   * Custom Api implementation to get all smartCollection at once without pagination
   * 
   * @param {object} shopify shopify api instance 
   * @param {object[]} metafields 
   * @returns {Promise} Each api method returns a Promise that resolves with the result
   */
  smartCollectionListAll(shopify, metafields) {
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

      this.debug("count", count);
      this.debug("pages", pages);

      return utilities.pTimes(pages, (n) => {
        n += 1;
        this.debug("page", n);
        return shopify.smartCollection.list({limit: itemsPerPage, page: n})
      });
    })
    .then((itemsOfItems) => {
      var items = utilities.flattenArrayOfArray(itemsOfItems);
      return items;
    });
  }

  /**
   * Custom Api implementation to get all customCollection at once without pagination
   * 
   * @param {object} shopify shopify api instance 
   * @param {object[]} metafields 
   * @returns {Promise} Each api method returns a Promise that resolves with the result
   */
  customCollectionListAll(shopify, metafields) {
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

      this.debug("count", count);
      this.debug("pages", pages);

      return utilities.pTimes(pages, (n) => {
        n += 1;
        this.debug("page", n);
        return shopify.customCollection.list({limit: itemsPerPage, page: n})
      });
    })
    .then((itemsOfItems) => {
      var items = utilities.flattenArrayOfArray(itemsOfItems);
      return items;
    });
  }

  /**
   * Get all params from koa-router query wich compatible with the shopify api
   * 
   * @param {string} jsonQueryString 
   * @param {string[]} methodParsedArgs 
   * @returns {Promise} Promise with resolves to an array with compatible params
   */
  parseJsonQuery(jsonQueryString, methodParsedArgs) {
    return new Promise((fulfill, reject) => {

      const json = JSON.parse(jsonQueryString);
      this.debug('jsonQueryString', jsonQueryString, 'json', json, 'methodParsedArgs', methodParsedArgs);
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
          this.debug(`arg ${arg.name} set to`, json[arg.name], arg);
        } else {
          // arg not set, check if it is required
          if(arg.isOptional === false) {
            return reject(`Arg ${arg.name} is required!`);
          } else {
            this.debug(`ignore arg ${arg.name}`);
          }
        }
      }

      return fulfill(resultArgs);
    });
  }

  /**
   * Get shopify token from firebase
   * @see https://firebase.google.com/docs/auth/server/verify-id-tokens
   * 
   * @param {any} firebaseApp 
   * @param {any} firebaseIdToken 
   * @returns {Promise}
   */
  getShopifyToken(firebaseApp, firebaseIdToken) {
    return firebaseApp.auth().verifyIdToken(firebaseIdToken)
    .then((firebaseUser) => {
      this.debug('firebaseUser', firebaseUser);

      // Get a database reference to our token
      var shopifyTokenRef = firebaseApp.database().ref('/shopifyAccessToken/' + firebaseUser.uid);

      return new Promise((resolve, reject) => {
        // Attach an asynchronous callback to read the data at our posts reference
        shopifyTokenRef.on('value', (snapshot) => {
          var shopifyToken = snapshot.val();
          this.debug('shopifyToken', shopifyToken);
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
   * Get a new instance of Shopify Api Class
   * 
   * @param {string} shopName 
   * @param {string} shopifyAccessToken 
   * @returns {object} insteance of Shopify Api
   */
  init(shopName, shopifyAccessToken) {
    this.debug('init', 'shopName', shopName);
    var ret = new ShopifyApi({
      shopName: shopName,
      accessToken: shopifyAccessToken,
    });
    this.debug('HEEELAU!!!');
    // Quick dirty hack to include 'listAll' method generically
    var definitions = require('./definitions.js')({});
    this.debug('DEFINITIONS:', definitions);
    utilities.forEach(definitions, (resourceName, resource, next) => {
      this.debug(`resource: ${resourceName}`);
      utilities.forEach(resource, (methodName, method, next) => {
        this.debug(`methodName: ${methodName}`);
        if (methodName === 'listAll') {
          this.debug(`DEFINE api()['${resourceName}']['${methodName}All']`);
          // if 'list' method exists, we implement 'listAll' in this generic manner
          ret[resourceName].listAll = () => {
            var args = [];
            var arglen = 0;
            var arglist = method.args;
            for (var i=0; i<arglist.length && i < arguments.length; i++) {
              if (arglist[i][0] === '(' || arglist[i] === 'params')
                break;
              args.push(arguments[i]);
              arglen++;
            }
            const itemsPerPage = 250;
            return ret[resourceName].count()
            .then((count) => {
              var pages = Math.round(count / itemsPerPage);

              // Are there any remaining items on the next page?
              if(count % itemsPerPage > 0 ) {
                pages++;
              }

              if(pages <= 0) {
                pages = 1;
              }

              this.debug("count", count);
              this.debug("pages", pages);

              return utilities.pTimes(pages, (n) => {
                n += 1;
                this.debug("page", n);
                return ret[resourceName].list(...args, {limit: itemsPerPage, page: n})
              });
            })
            .then((itemsOfItems) => {
              var items = utilities.flattenArrayOfArray(itemsOfItems);
              return items;
            });
          };
        }
        next();
      });
      next();
    });
    return ret;
  }

  /**
   * Koa middleware for shopify rest api
   * You can provide a full Shopify REST API with the api middleware:
   * 
   * ## Routes
   *
   * ### `/api/:appName/:shopName/init/:firebaseIdToken`
   * REST API to get Shopify Token from firebase, init the shopify api and set the token to session
   *
   * ### `/api/:appName/:shopName/init/shopifytoken/:shopifyToken`
   * REST API to init Shopify by passing the shopify token as url param and set the token to session
   *
   * ### `/api/:appName/:shopName/test`
   * REST API to test if the Shopify api is working
   *
   * ### `/api/:appName/:shopName/definitions`
   * REST API to get all available api definitions
   *
   * ### `/api/:appName/:shopName/:resource/:method`
   * REST API for all supported api requests from [shopify-api-node](https://github.com/microapps/Shopify-api-node).  
   * Exmaple: `/api/my-app-name/my-shop-subdomain/shop/get?callback=?&json='{"params":{"fields":"name"}}'`
   * 
   * @example
   * const Koa = require('koa');
   * const session = require('koa-session');
   * const shopifyServer = require('shopify-server');
   * const app = new Koa();
   * const config = require('./config.json');
   * 
   * const firebaseApp = shopifyServer.utilities.initFirebase(config.app.handle, config.firebase['service-account'], config.firebase.databaseURL);
   * app.keys = config.app.secrets;
   * app.use(session(app))
   * 
   * app.use(shopifyServer.api.koa({
   *   contextStorageKey: 'session',
   *   appName: config.app.handle,
   *   shopifyConfig: config.shopify,
   *   firebaseApp: firebaseApp,
   * }, app));
   * 
   * app.listen(process.env.PORT || 8080);
   * ```
   * @requires koa-router, koa-json, koa-safe-jsonp
   * 
   * @param {object} opts options
   * @param {any} app koa app instance
   * @returns {object} koa router
   * 
   * @memberof Api
   */
  koa(opts, app) {
    const Router = require('koa-router'); // https://github.com/alexmingoia/koa-router/tree/master/
    const router = new Router();
    const self = this;

    this.debug("init koa middleware", 'options', opts);

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
    self.definitions = require('./definitions.js')({
      appName: opts.appName,
      baseUrl: opts.baseUrl,
    });

    // log requests
    app.use(function(ctx, next){
      self.debug(`path: ${ctx.path}`);

      if(ctx.params && ctx.params !== {}) {
        self.debug(`params: `, ctx.params);
      }

      if(ctx.query && ctx.query !== {}) {
        self.debug(`query: `, ctx.query);
      }

      return next();
    });

    /**
     * REST API to get Shopify Token from firebase, init the shopify api and set the token to session
     */
    var url = `${opts.baseUrl}/init/:firebaseIdToken`;
    self.debug(`init route: ${url}`);
    router.get(url, async (ctx) => {
      const appName = opts.appName;
      const shopName = ctx.params.shopName;
      const firebaseIdToken = ctx.params.firebaseIdToken;
      var session = ctx[opts.contextStorageKey];
      await self.getShopifyToken(opts.firebaseApp, firebaseIdToken)
      .then((shopifyToken) => {
        session[appName][shopName].shopifyToken = shopifyToken;

        // TODO: Do not init the api each request!
        var shopify = self.init(shopName, session[appName][shopName].shopifyToken);

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
    self.debug(`init route: ${url}`);
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
      var shopify = self.init(shopName, session[appName][shopName].shopifyToken);

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
    self.debug(`init route: ${url}`);
    router.get(url, async (ctx) => {
      const appName = opts.appName;
      const shopName = ctx.params.shopName;
      var session = ctx[opts.contextStorageKey];

      if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
        ctx.throw(401, 'Shopify Token not set');
      }

      // TODO: Do not init the api each request!
      var shopify = self.init(shopName, session[appName][shopName].shopifyToken);

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
    self.debug(`init route: ${url}`);
    router.get(url, (ctx) => {
      ctx.body = {
        api: self.definitions,
        scopes: opts.shopifyConfig.scopes,
      }
    });

    /**
     * Custom Api metafield/deleteAll implementation
     * @see self.metafieldDeleteAll
     */
    var url = `${opts.baseUrl}/metafield/deleteAll`;
    self.debug(`init route: ${url}`);
    router.get(url, async (ctx) => {
      const appName = opts.appName;
      const shopName = ctx.params.shopName;
      const session = ctx[opts.contextStorageKey];
      const metafields = req.query.metafields;

      if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
        ctx.throw(401, 'Shopify Token not set');
      }

      if(ctx.query === null || typeof(ctx.query) !== 'object' || typeof(ctx.query.json) !== 'string') {
        self.debug(`ctx.query`, ctx.query);
        ctx.throw(401, 'Json query string is required');
      }

      const params = JSON.parse(ctx.query.json);

      if(params === null || typeof(params) !== 'object' || !Array.isArray(params.ids) ) {
        self.debug(`ctx.query`, ctx.query);
        ctx.throw(401, 'ids property required and needs to be an array');
      }

      // TODO: Do not init the api each request!
      const shopify = self.init(shopName, session[appName][shopName].shopifyToken);

      await self.metafieldDeleteAll(shopify, params.ids)
      .then((metafields) => {
        ctx.jsonp = metafields;
      })
      .catch((error) => {
        ctx.throw(500, error);
      });
    });

    /**
     * Custom Api metafield/updateAll implementation
     * @see self.metafieldUpdateAll
     */
    var url = `${opts.baseUrl}/metafield/updateAll`;
    self.debug(`init route: ${url}`);
    router.get(url, async (ctx) => {
      const appName = opts.appName;
      const shopName = ctx.params.shopName;
      const session = ctx[opts.contextStorageKey];
      const metafields = req.query.metafields;

      if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
        ctx.throw(401, 'Shopify Token not set');
      }

      if(ctx.query === null || typeof(ctx.query) !== 'object' || typeof(ctx.query.json) !== 'string') {
        self.debug(`ctx.query`, ctx.query);
        ctx.throw(401, 'Json query string is required');
      }

      const params = JSON.parse(ctx.query.json);

      if(params === null || typeof(params) !== 'object' || !Array.isArray(params.metafields) ) {
        self.debug(`ctx.query`, ctx.query);
        ctx.throw(401, 'metafields property required and needs to be an array');
      }

      // TODO: Do not init the api each request!
      const shopify = self.init(shopName, session[appName][shopName].shopifyToken);

      await self.metafieldUpdateAll(shopify, params.metafields)
      .then((metafields) => {
        ctx.jsonp = metafields;
      })
      .catch((error) => {
        ctx.throw(500, error);
      });
    });

    /*
    * Init all routes for the Shopify REST API based on Shopify-api-node
    * @see https://github.com/microapps/Shopify-api-node
    */

    // Quick dirty hack to include 'listAll' method generically
    utilities.forEach(self.definitions, (resourceName, resource, next) => {
      utilities.forEach(resource, (methodName, method, next) => {
        if (methodName === 'list') {
        // simply copy definition for 'list' to 'listAll'; implementation happens in Api.init
          self.definitions[resourceName].listAll=self.definitions[resourceName].list;
        }
        next();
      });
      next();
    });

    utilities.forEach(self.definitions, (resourceName, resource, next) => {
      utilities.forEach(resource, (methodName, method, next) => {
        self.debug(`init route: ${method.url}`, method.args);
        router.get(method.url, async (ctx) => {
          const appName = opts.appName;
          const shopName = ctx.params.shopName;

          self.debug(`resource: ${resourceName}`);
          self.debug(`method: ${methodName}`);
          self.debug(`args: ${method.args}`);

          var session = ctx[opts.contextStorageKey];

          if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
            ctx.throw(401, 'Shopify Token not set');
          }

          if(ctx.query === null || typeof(ctx.query) !== 'object' || typeof(ctx.query.json) !== 'string') {
            self.debug(`ctx.query`, ctx.query);
            ctx.throw(401, 'Json query string is required');
          }

          // TODO: Do not init the api each request!
          var shopify = self.init(shopName, session[appName][shopName].shopifyToken);

          await self.parseJsonQuery(ctx.query.json, method.parsedArgs)
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
}

/**
 * Shopify api helpers
 * @module shopify-server/api
 * @see {@link Api}
 */
module.exports = Api;
