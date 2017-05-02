'use strict';

  /*!
  * Module dependencies.
  */
const Debug = require('debug');                 // https://github.com/visionmedia/debug
const utilities = require('./utilities.js');

/**
 * Class for admin stuff, e.g list all shops where the app is installed,
 * so this should not be accessable by single app users, just for admins
 */
class Admin {

    /**
     * Create an admin object
     */
    constructor() {
        this.debug = new Debug('shopify-server:admin');
    };

    /**
     * Get all shops where the app is installed
     * @param {Object} firebaseApp
     * @return {Promise<Array>} - A promise to an array of shop datas object
     */
    list(firebaseApp) {
        return new Promise((fulfill, reject) => {
            let db = firebaseApp.database();
            let ref = db.ref('/shopifyAccessToken');
            ref.once('value', (snapshot) => {
                let values = snapshot.val(); // null if empty
                this.debug('admin.shop.list: ', values);
                let splits = [];
                if (values !== null) {
                Object.keys(values).map((key, index) => {
                    let shopData = utilities.getShopByFirebaseUID(key);
                    let split = {
                        uid: key,
                        shop: shopData.shop,
                        shopName: shopData.shopName,
                        accessToken: values[key],
                    };
                    splits.push(split);
                    this.debug(split);
                });
                }
                fulfill(splits);
            }, (errorObject) => {
                this.debug(errorObject);
                reject(errorObject);
            });
        });
    };

}

module.exports = Admin;
