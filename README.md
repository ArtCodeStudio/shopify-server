# shopify-server

Koa middlewares to write shopify apps with node.js and [koa](http://koajs.com/).
shopify-server provides middlewares for authentication using [shopify-token](https://github.com/lpinca/shopify-token) and for api requests using [shopify-api-node](https://github.com/MONEI/Shopify-api-node).

## Documentation

You found the documentation on [https://docs.jumplink.eu/shopify-server/](docs.jumplink.eu/shopify-server/).

build the documentation with:

```bash
npm run doc
```

Pulish the documentation with

```bash
npm run publush-doc
```

## Environment

You need node.js v7.8.0 or higher, we recommend to use [nvm](https://github.com/creationix/nvm) for that. With nvm you can install the latest node.js version with

```bash
nvm install node
```

## Debugging

shopify-server along with many of the libraries it's built with support the **DEBUG** environment variable from [debug](https://github.com/visionmedia/debug) which provides simple conditional logging.

To see all debugging information just pass `DEBUG=shopify-server* npm start`. You can also show specific debugging information using `DEBUG=shopify-server:auth,shopify-server:utilities,shopify-server:api`.

## See also

* [shopify-client](https://github.com/JumpLinkNetwork/shopify-client)