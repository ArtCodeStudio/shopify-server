

<!-- Start node_modules/shopify-server/admin.js -->

## Admin

Class for admin stuff, e.g list all shops where the app is installed,
so this should not be accessable by single app users, just for admins

## constructor

Create an admin object

## list(firebaseApp)

Get all shops where the app is installed

### Params:

* **Object** *firebaseApp* 

### Return:

* **Promise.\<Array>** - A promise to an array of shop datas object

<!-- End node_modules/shopify-server/admin.js -->

<!-- Start node_modules/shopify-server/api.js -->

## constructor

Create a new api object

## metafield

Custom Api implementations for metafields

## deleteAll

Delete multiple metafields at once

## updateAll

Update multiple metafields at once

## product

Custom Api implementations for products

## listAll

Custom Api implementation to get all products at once without pagination

## customer

Custom Api implementations for customers

## listAll

Custom Api implementation to get all customers at once without pagination

## smartCollection

Custom Api implementations for smartCollection

## listAll

Custom Api implementation to get all smartCollection at once without pagination

## customCollection

Custom Api implementations for customCollection

## listAll

Custom Api implementation to get all customCollection at once without pagination

## parseJsonQuery()

Get all params from koa-router query wich compatible with the shopify api

## getShopifyToken()

Get shopify token from firebase

See: https://firebase.google.com/docs/auth/server/verify-id-tokens

## init()

## koa()

Koa middleware for shopify rest api

## url

REST API to get Shopify Token from firebase, init the shopify api and set the token to session

## url

REST API to init Shopify by passing the shopify token as url param and set the token to session

## url

REST API to test if the Shopify api is working

## url

REST API to show which REST APIs are existing

## url

Custom Api metafield/deleteAll implementation

See: self.metafield.updateAll

## url

Custom Api metafield/updateAll implementation

See: self.metafield.updateAll

## url

Custom Api product/listAll implementation

See: self.product.listAll

## url

Custom Api customer/listAll implementation

See: self.customer.listAll

## url

Custom Api smartCollection/listAll implementation

See: self.smartCollection.listAll

## url

Custom Api customCollection/listAll implementation

See: self.customCollection.listAll

Init all routes for the Shopify REST API based on Shopify-api-node

See: https://github.com/microapps/Shopify-api-node

<!-- End node_modules/shopify-server/api.js -->

<!-- Start node_modules/shopify-server/auth.js -->

## constructor

Create a new auth object

## init(appName, shopifyConfig)

### Params:

* *appName* 
* *shopifyConfig* 

## createFirebaseCustomAuth()

Creates a Firebase custom auth token for the given Shopify user ID.

## signInFirebaseTemplate()

Generates the HTML template that:
 - Signs the user in Firebase using the given token
 - Updates the user profile with shop
 - Saves the Shopify AccessToken to the Realtime Database
 - Closes the popup

## koa()

Koa middleware for shopify app authentification using oath2

The router can use regex in path

See: https://github.com/pillarjs/path-to-regexp

Redirects the User to the Shopify authentication consent screen. Also the 'state' session is set for later state verification.

## nonce

Generate a random nonce.

## uri

Generate the authorization URL. For the sake of simplicity the shop name
is fixed here but it can, of course, be passed along with the request and
be different for each request.

Save the nonce in the session to verify it later.

Exchanges a given Shopify auth code passed in the 'code' URL query parameter for a Firebase auth token.
The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie to avoid
Session Fixation attacks.
This is meant to be used by Web Clients.

Exchange the authorization code for a permanent access token.

Get token
TODO Is this safe through sessions?

<!-- End node_modules/shopify-server/auth.js -->

<!-- Start node_modules/shopify-server/definitions.js -->

## api

TODO implement Shopify Query Language: https://help.shopify.com/api/reference/shopify-ql
TODO implement Analytics API: https://help.shopify.com/api/tutorials/analytics-api

## checkout

TODO Whats with write_checkouts?

## discount

TESTME Is read_customers, write_customers the right scope?

## event

TESTME Doses this need a scope?

## giftCard

TESTME Is read_customers, write_customers the right scope?

## location

TESTME Doses this need a scope?

## orderRisk

TESTME Has this the right scopes?

## policy

TESTME Doses this need a scope?

## refund

TESTME Doses this need a scope?
TODO implement missing api requests: https://help.shopify.com/api/reference/refund

## user

TODO Whats with write_users?

## webhook

TESTME Doses this need a scope?

## parsedArgs

Parse args to show if it is optional or not

<!-- End node_modules/shopify-server/definitions.js -->

<!-- Start node_modules/shopify-server/shopify-server.js -->

## utilities

See: https://github.com/OptimalBits/redbird

<!-- End node_modules/shopify-server/shopify-server.js -->

<!-- Start node_modules/shopify-server/utilities.js -->

## utilities

Set of some helpful methods

## extend

The util._extend() method was never intended to be used outside of internal Node.js modules. The community found and used it anyway.
It is deprecated and should not be used in new code. JavaScript comes with very similar built-in functionality through `Object.assign()`.

**Deprecated**

See: https://nodejs.org/api/util.html#util_util_extend_target_source

### Params:

* **Object** *target* 
* **Object** *source* 

### Return:

* **Object** Extended result

## isObject(a)

Test if variable is an object

### Params:

* **any** *a* Param to test if it is an object

### Return:

* **boolean** Returns true if param is an object

## isArray(a)

Test if variable is an array

**Deprecated**

### Params:

* **any** *a* Param to test if it is an array

### Return:

* **boolean** Returns true if param is an array

## delayPromise

Delay promise that will delay the execution of the next promise in the chain.

See: https://blog.raananweber.com/2015/12/01/writing-a-promise-delayer/

### Params:

* **Number** *delay* delay in ms

### Return:

* **Prmise.\<any>** 

## pTimes

Run promise-returning & async functions a specific number of times concurrently.

See: https://github.com/sindresorhus/p-times

### Params:

* **Number** *count* Number of times to call mapper.
* **Function** *mapper* Expected to return a Promise or value.
* **Object** *opts* 

### Return:

* **Promise** Returns a Promise that is fulfilled when all promises returned from mapper are fulfilled, or rejects if any of the promises reject.
The fulfilled value is an Array of the fulfilled values returned from mapper in order.

## pMap

Map over promises concurrently.
Useful when you need to run promise-returning & async functions multiple times with different inputs concurrently.

See: https://github.com/sindresorhus/p-map

### Params:

* **Iterable.\<Promise>** *input* Iterated over concurrently in the mapper function.
* **Function** *mapper* mapper(element, index), Expected to return a Promise or value.
* **Object** *options* 

### Return:

* **Promise** Returns a Promise that is fulfilled when all promises in input and ones returned from mapper are fulfilled, or rejects if any of the promises reject.
The fulfilled value is an Array of the fulfilled values returned from mapper in input order.

## forEach

Iterate over object keys

See: http://stackoverflow.com/a/7442013/1465919

### Params:

* **Object** *o* the Object you want to interate over
* **Function** *cb* callback

## initFirebase

Creates and initializes a Firebase app instance by app name, service account and database url

See: https://firebase.google.com/docs/reference/js/firebase#.initializeApp

### Params:

* **String** *appName* App Name
* **Object** *firebaseServiceAccount* service account
* **Object** *firebaseDatabaseURL* database url

### Return:

* **firebase.app.App** 

## getShopName

Get CURRENT_LOGGED_IN_SHOP from CURRENT_LOGGED_IN_SHOP.myshopify.com

### Params:

* **String** *shop* the shop, e.g. CURRENT_LOGGED_IN_SHOP.myshopify.com

### Return:

* **String** the shopname e.g. CURRENT_LOGGED_IN_SHOP

## getShopifyAppUrl

Get shop app admin url of shop stirng and api key.
E.g. if shop string is `CURRENT_LOGGED_IN_SHOP.myshopify.com` and the api key is `123456`
the result will be `https://CURRENT_LOGGED_IN_SHOP.myshopify.com/admin/apps/123456`

### Params:

* **String** *shop* the shop, e.g. `CURRENT_LOGGED_IN_SHOP.myshopify.com`
* **String** *apiKey* the api key, e.g. `123456`

### Return:

* **String** the shop app admin url, eg.g `https://CURRENT_LOGGED_IN_SHOP.myshopify.com/admin/apps/123456`

## getFirebaseUID

Generates a uid string for firebase from the shop url

See: utilities.getShopByFirebaseUID

### Params:

* **String** *shop* the shop, e.g. CURRENT_LOGGED_IN_SHOP.myshopify.com

### Return:

* **String** the firebase user id e.g. shopify:CURRENT_LOGGED_IN_SHOP-myshopify-com

## getShopByFirebaseUID

Split the shop url from the firebase uid string

See: utilities.getFirebaseUID

### Params:

* **String** *uid* firebase user id

### Return:

* **Object** shop and shopname

## flattenArrayOfArray

Merge/flatten an array of arrays

See: http://stackoverflow.com/a/10865042/1465919

### Params:

* **Array.\<Array>** *arrays* array of arrays

### Return:

* **Array** flatten array

## capitalizeFirstLetter

Make the first letter of a string uppercase

See: http://stackoverflow.com/a/1026087

### Params:

* **String** *str* 

### Return:

* **String** str with fist letter in uppercase

## ressourceActionToCamelCase

Merge/flatten an array of arrays

### Params:

* **String** *ressourceName* ressource name
* **String** *actionName* action name

### Return:

* **String** Methodname in camelCase

## exports

Shopify Server Utilities

See: {@link utilities}

<!-- End node_modules/shopify-server/utilities.js -->

<!-- Start node_modules/shopify-server/webhook.js -->

## Webhook

Class for webhook stuff, e.g subscripe all webhooks

## constructor

Create the webhook object

## topics

All avaiable webhook topics

See: https://help.shopify.com/api/reference/webhook

## subscripe(opts, shops)

Subscripe all webhooks defined in opts.topics, if opts.topics is not defined, all webhooks will be subscriped

### Params:

* **Object** *opts* Options
* **Array** *shops* 

### Return:

* **Promise** 

## for()

Prepair webhooks fpr create / update

Get all webhooks for all shops and check if topics need an update or an creation

Get all webhooks for one shop (shops[i])

## koa(opts, app, shops, controller)

Koa middleware for shopify webhooks
Create routes to resive webhooks defined in opts.topics.
If opts.topics is not defined, this middleware will create routes for all webhooks.

### Params:

* **Object** *opts* 
* **Object** *app* 
* **Array** *shops* 
* **Object** *controller* 

### Return:

* **Object** router

## controllerMethod

Route to recive the webhook

<!-- End node_modules/shopify-server/webhook.js -->

