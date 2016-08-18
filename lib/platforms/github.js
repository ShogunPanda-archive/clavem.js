/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const OAuth2Platform = require("./oauth2");

/**
 * Instagram's oAuth 2 authentication platform.
 *
 * @memberOf clavem.platforms
 */
class GithubPlatform extends OAuth2Platform{
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
    this.authorizeUrl = "https://github.com/login/oauth/authorize";
  
    /**
     * The Access Token URL.
     *
     * @type {string}
     */
    this.accessTokenUrl = "https://github.com/login/oauth/access_token";
  }
}

module.exports = GithubPlatform;
