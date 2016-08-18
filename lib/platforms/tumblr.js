/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const OAuth1Platform = require("./oauth1");

/**
 * Tumblr's oAuth 1.0a authentication platform.
 *
 * @memberOf clavem.platforms
 */
class TumblrPlatform extends OAuth1Platform{
  /**
   * Creates a new platform.
   *
   * @param {Clavem} client The Clavem client.
   */
  constructor(client){
    super(client);
  
    /**
     * The Request Token URL.
     *
     * @type {string}
     */
    this.requestTokenUrl = "https://www.tumblr.com/oauth/request_token";
  
    /**
     * The Authentication URL.
     *
     * @type {string}
     */
    this.authenticateUrl = "https://www.tumblr.com/oauth/authorize";
  
    /**
     * The Access Token URL.
     *
     * @type {string}
     */
    this.accessTokenUrl = "https://www.tumblr.com/oauth/access_token";
  }
}

module.exports = TumblrPlatform;
