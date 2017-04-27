'use strict';

const Debug = require('debug');                 // https://github.com/visionmedia/debug

const utilities = require('./utilities.js');

var webhook = {
  debug: new Debug('shopify-server:webhook')
};

/**
 * All avaiable webhook topics
 * @see https://help.shopify.com/api/reference/webhook
 */
webhook.topics = [
  'carts/create',
  'carts/update',
  'checkouts/create',
  'checkouts/delete',
  'checkouts/update',
  'collections/create',
  'collections/delete',
  'collections/update',
  'collection_listings/add',
  'collection_listings/remove',
  'collection_listings/update',
  'customers/create',
  'customers/delete',
  'customers/disable',
  'customers/enable',
  'customers/update',
  'customer_groups/create',
  'customer_groups/delete',
  'customer_groups/update',
  'draft_orders/create',
  'draft_orders/delete',
  'draft_orders/update',
  'fulfillments/create',
  'fulfillments/update',
  'fulfillment_events/create',
  'fulfillment_events/delete',
  'orders/cancelled',
  'orders/create',
  'orders/delete',
  'orders/fulfilled',
  'orders/paid',
  'orders/partially_fulfilled',
  'orders/updated',
  'order_transactions/create',
  'products/create',
  'products/delete',
  'products/update',
  'product_listings/add',
  'product_listings/remove',
  'product_listings/update',
  'refunds/create',
  'app/uninstalled',
  'shop/update',
  'themes/create',
  'themes/delete',
  'themes/publish',
  'themes/update',
];

/**
 * Subscripe all webhooks defined in opts.topics, if opts.topics is not defined, all webhooks will be subscriped
 */
webhook.subscripe = (opts, shops) => {

  webhook.debug("subscripe webhooks", 'options', opts);

  if(opts === null || typeof(opts) !== 'object') {
    opts = {};
  }

  if(typeof(opts.appName) !== 'string') {
    throw new Error('app name string is required');
  }

  if(typeof(opts.address) !== 'string') {
    throw new Error('address string is required');
  }

  if(!utilities.isArray(shops)) {
    throw new Error('shops array is required');
  }

  if(!utilities.isArray(opts.topics)) {
    opts.topics = webhook.topics
  }

  /**
   * Get all webhooks for all shops and delete them
   * TODO erst alle webhooks zu löschen um sie dann neu zu erstellen scheint nicht zu funktionieren, besser updaten
   */
  let promises = [];
  for(let i=0; i<shops.length; i++) {
    const api = shops[i].api;
    /**
     * Get all webhooks for one shop (shops[i])
     */
    let promise = api.webhook.list();
    promise.then((webhooks) => {
      let promises = [];
      /**
       * Delete all webhooks one shop (shops[i])
       */
      for (var k = 0; k < webhooks.length; k++) {
        webhook.debug(`delete webhook id: ${webhooks[k].id}`);
        let promise = api.webhook.delete(webhooks[k].id);
        promise.catch((error) => {
          console.error("error on delete wehhook", webhooks[k], error);
          return error;
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    });
    promises.push(promise);
  };
  return Promise.all(promises)
  .then((deletedWebhooks) => {
    webhook.debug(`deleted webhooks: `, deletedWebhooks);
    return deletedWebhooks;
  })
  .then((deletedWebhooks) => {

    /**
     * Subscripe the webhook for each topic
     */
    let promises = [];
    for (let i = 0; i < opts.topics.length; i++) {
      const topic = opts.topics[i];
      const routeURL = `/webhook/${opts.appName}/${topic}`;
      const webhookUrl = `${opts.address}${routeURL}`;
      webhook.debug(`create webhook: ${webhookUrl}`);
      /**
       * Subscripe the webhook for each shop
       */
      for(let i=0; i<shops.length; i++) {
        const api = shops[i].api;
        const params = {
          'topic': topic,
          'address': webhookUrl,
          'format': 'json',
        };
        // webhook.debug(`api: `, api);
        let promise = api.webhook.create(params);
        promise.catch((error) => {
          console.error(`error on create wehhook\n`, params, error);
          return error;
        });
        promises.push(promise);
      }
    }
    return Promise.all(promises);
  });
}

/**
 * Koa middleware for shopify webhooks
 * Create routes to resive webhooks defined in opts.topics.
 * If opts.topics is not defined, this middleware will create routes for all webhooks.
 * @requires koa-router
 */
webhook.koa = (opts, app, shops, controller) => {

  const Router = require('koa-router'); // https://github.com/alexmingoia/koa-router/tree/master/
  const router = new Router();

  webhook.debug("init koa middleware", 'options', opts);

  if(opts === null || typeof(opts) !== 'object') {
    opts = {};
  }

  if(typeof(opts.appName) !== 'string') {
    throw new Error('app name string is required');
  }

  if(typeof(opts.address) !== 'string') {
    throw new Error('address string is required');
  }

  if(typeof(controller) === 'undefined') {
    throw new Error('controller object is required');
  }

  if(typeof(opts.baseUrl) !== 'string') {
    opts.baseUrl = `/webhook/${opts.appName}`;
  }

  if(!utilities.isArray(opts.topics)) {
    opts.topics = webhook.topics
  }

  for (let i = 0; i < opts.topics.length; i++) {
    const topic = opts.topics[i];
    const tmp = topic.split('/');
    const ressource = tmp[0];
    const action = tmp[1];
    const routeURL = `/webhook/${opts.appName}/${topic}`;
    const webhookUrl = `${opts.address}${routeURL}`;

    webhook.debug(`init route: ${routeURL}`, ressource, action);

    /**
     * Route to recive the webhook
     */
    router.all(routeURL, controller[ressource][action]);
  }
  return router.routes();
}

module.exports = webhook;