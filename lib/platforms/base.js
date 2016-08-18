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
    return this.urlParser.format({
      protocol: `http${this.client.secure ? "s" : ""}`,
      hostname: this.client.host,
      port: this.client.port,
      pathname: "/"
    });
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
}

module.exports = BasePlatform;
