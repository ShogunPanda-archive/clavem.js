/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

const OAuth2Platform = require("./oauth2");

/**
 * Instagram's oAuth 2 authentication platform.
 *
 * @memberOf clavem.platforms
 */
class GooglePlatform extends OAuth2Platform{
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
    this.authorizeUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    /**
     * The Access Token URL.
     *
     * @type {string}
     */
    this.accessTokenUrl = "https://www.googleapis.com/oauth2/v4/token";

    /**
     * The Refresh Token URL.
     *
     * @type {string}
     */
    this.refreshTokenUrl = "https://www.googleapis.com/oauth2/v4/token";
  }

  /**
   * @param {object} url @nodoc
   * @returns {object} @nodoc
   * @private
   */
  _authorizePayload(url){
    return Object.assign(super._authorizePayload(url), {access_type: "offline", prompt: "consent"}); // eslint-disable-line camelcase
  }
}

module.exports = GooglePlatform;
