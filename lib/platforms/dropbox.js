/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const OAuth2Platform = require("./oauth2");

/**
 * Dropbox's oAuth 2 authentication platform.
 *
 * @memberOf clavem.platforms
 */
class DropboxPlatform extends OAuth2Platform{
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
    this.authorizeUrl = "https://www.dropbox.com/1/oauth2/authorize";
  
    /**
     * The Access Token URL.
     *
     * @type {string}
     */
    this.accessTokenUrl = "https://api.dropboxapi.com/1/oauth2/token";
  }
}

module.exports = DropboxPlatform;
