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

  var createWebhooks = [];

  /**
   * Prepair webhooks fpr create / update 
   */
  for (let g = 0; g < opts.topics.length; g++) {
    const topic = opts.topics[g];
    const routeURL = `/webhook/${opts.appName}/${topic}`;
    const webhookUrl = `${opts.address}${routeURL}`;

    const params = {
      'topic': topic,
      'address': webhookUrl,
      'format': 'json',
    };

    let needSalesChannelSDK = false;
    if(topic === 'collection_listings/remove'
    || topic === 'collection_listings/update'
    || topic === 'collection_listings/add'
    || topic === 'product_listings/add'
    || topic === 'product_listings/update'
    || topic === 'product_listings/remove') {
      needSalesChannelSDK = true;
    }

    createWebhooks.push({
      needUpdate: false,
      needSalesChannelSDK: needSalesChannelSDK,
      params: params,
    });
  }

  /**
   * Get all webhooks for all shops and check if topics need an update or an creation
   */
  return utilities.async.pMap(shops, (shop, index) => {
    const api = shop.api;
    /**
     * Get all webhooks for one shop (shops[i])
     */
    api.webhook.list()
    .then((existingWebhooks) => {
      return utilities.async.pMap(createWebhooks, (createWebhook, index) => {
        for (var k = 0; k < existingWebhooks.length; k++) {
          let existingWebhook = existingWebhooks[k];
          webhook.debug(`compare webhooks: `, existingWebhook, createWebhook);
          if(existingWebhook.topic === createWebhook.params.topic) {
            createWebhook.needUpdate = true;
            createWebhook.params.id = existingWebhook.id;
          }
        }
        return createWebhook;
      }).then((createWebhooks) => {
        webhook.debug(`createWebhooks`, createWebhooks);
        return utilities.async.pMap(createWebhooks, (createWebhook, index) => {
          if(createWebhook.needSalesChannelSDK) {
            webhook.debug(`ignore webhook because it needs the Sales Channel SDK: ${createWebhook.params.topic}`);
            return Promise.resolve();
          } 
          if(createWebhook.needUpdate) {
            webhook.debug(`update webhook: ${createWebhook.params.topic}`);
            return api.webhook.update(createWebhook.params.id, createWebhook.params)
            .catch((error) => {
              console.error(`error on update webhook ${createWebhook.params.topic} - ${error.hostname}`);
              return error;
            });
          } else {
            webhook.debug(`create webhook: ${createWebhook.params.topic}`);
            return api.webhook.create(createWebhook.params)
            .catch((error) => {
              console.error(`error on create webhook ${createWebhook.params.topic} - ${error.hostname}`);
              return error;
            });
          }
        });
      });
    });
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
    router.post(routeURL, controller[ressource][action]);
  }
  return router;
}

module.exports = webhook;