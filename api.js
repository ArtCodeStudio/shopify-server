const ShopifyApi = require('shopify-api-node'); // https://github.com/microapps/Shopify-api-node
const Debug = require('debug')                  // https://github.com/visionmedia/debug

const utilities = require('./utilities.js');

var api = {
  debug: Debug('shopify-server:api')
};


api.definitions = require('./api-definitions');

/**
 * Get all params from express query wich compatible with the shopify api
 */
api.parseParamsQuery = (query) => {
  var result = {
    params: utilities.extend({}, query),
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

/**
 * 
 */
api.init = (shopName, shopifyAccessToken) => {
  auth.debug('init', 'shopName', shopName);
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

  api.debug("init koa middleware", 'options', opts);

  if(opts === null || typeof(opts) !== 'object') {
    opts = {};
  }

  if(typeof(opts.appName) !== 'string') {
    throw new Error('app name string is required');
  }

  if(typeof(opts.baseUrl) !== 'string') {
    opts.baseUrl = `/api/${opts.appName}/:shopName`;
  }

  if(typeof(opts.contextStorageKey) !== 'string') {
    opts.contextStorageKey = 'session'
  }

  jsonp(app);

  // logger
  app.use(function(ctx, next){
    api.debug(ctx.path);
    return next();
  });



  /*
   * Init all routes for the shopify rest api based on Shopify-api-node
   * 
   * @see https://github.com/microapps/Shopify-api-node
   */
  for (var resourceName in api.definitions) {
    var resource = api.definitions[resourceName];
    api.debug(resourceName);

    for (var methodName in resource) {
      var method = resource[methodName];
      var url = `${opts.baseUrl}/${resourceName}/${methodName}`;
      api.debug(`\tinit route: ${url}`, method.args);
      router.get(url, async (ctx) => {
        const appName = opts.appName;
        const shopName = ctx.params.shopName;
        var session = ctx[opts.contextStorageKey];

        if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
          ctx.throw(401, 'Shopify Token not set');
        }

        // set shopify api in session if it is not set
        if(!session[appName] || !session[appName][shopName] || !session[appName][shopName].shopifyToken) {
          session[appName][shopName].shopify = api.init(shopName, session[appName][shopName].shopifyToken);
        }

        await session[appName][shopName].shopify[resourceName][methodName]()
          .then((result) => ctx.jsonp(result))
          .catch((err) => {
            ctx.throw(500, error.message);
          });
      });
    }

  }

  return router.routes();


}

module.exports = api;