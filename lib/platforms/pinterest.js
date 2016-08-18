/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const OAuth2Platform = require("./oauth2");

/**
 * Pinterest's oAuth 2 authentication platform.
 *
 * @memberOf clavem.platforms
 */
class PinterestPlatform extends OAuth2Platform{
  /**
   * Creates a new platform.
   *
   * @param {Clavem} client The Clavem client.
   */
  constructor(client){
    super(client);
  
    /**
     * The Authorization URL.
     *
     * @type {string}
     */
    this.authorizeUrl = "https://api.pinterest.com/oauth/";
  
    /**
     * The Access Token URL.
     *
     * @type {string}
     */
    this.accessTokenUrl = "https://api.pinterest.com/v1/oauth/token";
  }
  
  /**
   * Builds the URL where redirect the user's browser to.
   *
   * @returns {string} The URL where redirect the user's browser to.
   */
  buildUrl(url){
    // Make sure scope is always present
    if(typeof url.path !== "string" || url.path.length < 2)
      url.path = "/read_public";

    return super.buildUrl(url);
  }
}

module.exports = PinterestPlatform;
