/*jslint es6 */

/**
 * Node modul for admin stuff, e.g list all shops where the app is installed,
 * so this should not be accessable by single app users, just for admins
 */

'use strict';

const Debug = require('debug');                 // https://github.com/visionmedia/debug
const utilities = require('./utilities.js');

var admin = {
  debug: new Debug('shopify-server:admin')
};

admin.shop = {

}

/**
 * Get all shops where the app is installed
 */
admin.shop.list = (firebaseApp) => {
    return new Promise((fulfill, reject) => {
        var db = firebaseApp.database();
        var ref = db.ref('/shopifyAccessToken');
        ref.once('value', (snapshot) => {
            var values = snapshot.val(); // null if empty
            admin.debug('admin.shop.list: ', values);
            var splits = [];
            if (values !== null) {
              Object.keys(values).map((key, index) => {
                  var shopData = utilities.getShopByFirebaseUID(key);
                  var split = {
                      uid: key,
                      shop: shopData.shop,
                      shopName: shopData.shopName,
                      accessToken: values[key]
                  } 
                  splits.push(split);
                  admin.debug(split);
              });
            }
            fulfill(splits); 
        }, (errorObject) => {
            admin.debug(errorObject);
            reject(errorObject);
        });
    });
}

module.exports = admin;