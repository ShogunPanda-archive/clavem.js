/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const urlParser = require("url");
const querystring = require("querystring");

/**
 * A custom platform for Clavem.
 *
 * @memberOf clavem.platforms
 */
class BasePlatform{
  /**
   * Creates a new platform.
   *
   * @param {Clavem} client The Clavem client.
   */
  constructor(client){
    /**
     * The Clavem client.
     * @type {Clavem}
     */
    this.client = client;

    /**
     * A URL parser.
     */
    this.urlParser = urlParser;
  }

  /**
   * Returns the callback URL for this authentication.
   *
   * @returns {string} A callback URL.
   */
  callbackUrl(){
    return this.client.redirectUrl;
  }

  /**
   * Builds the URL where redirect the user's browser to.
   */
  buildUrl(){
    throw `${this.constructor.name}.buildUrl must override BasePlatfom.buildUrl.`;
  }

  // Private methods
  /**
   * @param {string} url @nodoc
   * @private
   */
  _extractCredentials(url){
    const [id, secret] = (typeof url.auth === "string" ? url.auth : "").split(":");

    this.clientId = id;
    this.clientSecret = secret;
  }

  /**
   * @param {string} body @nodoc
   * @returns {string | object} @nodoc
   * @private
   */
  _parseBody(body){
    return typeof body === "string" ? querystring.parse(body) : body;
  }

  /**
   * @param {object} request @nodoc
   * @returns {{query: object}} @nodoc
   * @private
   */
  _ensureValidRequest(request){
    return (request.constructor.name === "IncomingMessage" || request.query) ? request : {query: request}; // eslint-disable-line no-extra-parens
  }

  /**
   * @param {string} url @nodoc
   * @param {string} method @nodoc
   * @param {object} args @nodoc
   * @private
   */
  _logRequest(url, method, args){
    if(!BasePlatform.debug)
      return;

    console.log(`Performing HTTP ${method.toUpperCase()} request to ${url} with data ${JSON.stringify(args)}`);
  }
}

BasePlatform.debug = (process.env.NODE_DEBUG || "").indexOf("clavem") !== -1;

module.exports = BasePlatform;
