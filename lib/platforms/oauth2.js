/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const request = require("request");
const BasePlatform = require("./base");

const HTTP_STATUS_OK = 200;

/**
 * A oAuth 2.0 platform for Clavem.
 *
 * @memberOf clavem.platforms
 */
class OAuth2Platform extends BasePlatform{
  /**
   * Creates a new platform.
   *
   * @param {Clavem} client The Clavem client.
   */
  constructor(client){
    super(client);
  
    /**
     * The HTTP method to use to get the access token.
     *
     * @type {string}
     */
    this.accessTokenMethod = "post";
  }
  
  /**
   * Builds the URL where redirect the user's browser to.
   * @param url The base URL with credentials informations.
   * @returns {string} The URL where redirect the user's browser to.
   */
  buildUrl(url){
    this._extractCredentials(url);

    const query = this._authorizePayload(url);
    if(typeof url.path === "string" && url.path.length > 1)
      query.scope = url.path.substring(1);

    const returnUrl = Object.assign(this.urlParser.parse(this.authorizeUrl), {query, href: null});
    return this.urlParser.format(returnUrl);
  }
  
  /**
   * Handles the final authentication response from the user's browser.
   *
   * @param req {object} The Express request object.
   * @param callback {function} The callback to invoke when all the operations are finished.
   * @returns {object} The callback return value.
   */
  handleResponse(req, callback){
    req = this._ensureValidRequest(req);

    // Authorization denied
    const generalError = req.query.error;
    const code = req.query.code;

    if(generalError || !code){
      if(!generalError || generalError === "access_denied" || generalError === "user_cancelled_authorize")
        return callback(null);

      return callback(req.query.error_description);
    }

    // Access code, let's exchange with a token
    return this._exchangeCode(code, callback);
  }

  // Private methods
  /**
   * @param url {string} @nodoc
   * @returns {object} @nodoc
   * @private
   */
  _authorizePayload(url){ // eslint-disable-line no-unused-vars
    return {client_id: this.clientId, response_type: "code", redirect_uri: this.callbackUrl()}; // eslint-disable-line camelcase
  }
  
  /**
   * @param code {string} @nodoc
   * @returns {object} @nodoc
   * @private
   */
  _exchangeCodePayload(code){
    return {client_id: this.clientId, client_secret: this.clientSecret, redirect_uri: this.callbackUrl(), grant_type: "authorization_code", code}; // eslint-disable-line camelcase
  }
  
  /**
   * @param token {string} @nodoc
   * @returns {object} @nodoc
   * @private
   */
  _refreshTokenPayload(token){
    return {client_id: this.clientId, client_secret: this.clientSecret, grant_type: "refresh_token", refresh_token: token}; // eslint-disable-line camelcase
  }
  
  /**
   * @param code {string} @nodoc
   * @param callback {function} @nodoc
   * @private
   */
  _exchangeCode(code, callback){
    // Build args
    let args = this._exchangeCodePayload(code);
    args = this.accessTokenMethod !== "post" ? {qs: args} : {form: args};

    request[this.accessTokenMethod](Object.assign({url: this.accessTokenUrl, json: true}, args), (error, response, body) => {
      if(error)
        return callback(error);

      body = this._parseBody(body);

      // Request failed, abort
      if(response.statusCode !== HTTP_STATUS_OK)
        return callback(`Invalid code exchange response: [${response.statusCode}] ${JSON.stringify(body)}`);

      // Replace with long lived access token, if needed
      if(this.refreshTokenUrl)
        return this._refreshToken(body.refresh_token || body.access_token, callback);

      return callback(null, body.access_token);
    });
  }
  
  /**
   * @param token {string} @nodoc
   * @param callback {function} @nodoc
   * @private
   */
  _refreshToken(token, callback){
    // Build args
    let args = this._refreshTokenPayload(token);
    args = this.accessTokenMethod !== "post" ? {qs: args} : {form: args};

    // Make the request
    request[this.accessTokenMethod](Object.assign({url: this.refreshTokenUrl, json: true}, args), (error, response, body) => {
      if(error)
        return callback(error);

      body = this._parseBody(body);

      // Request failed, abort
      if(response.statusCode !== HTTP_STATUS_OK)
        return callback(`Invalid refresh token exchange response: [${response.statusCode}] ${JSON.stringify(body)}`);

      // Return the obtained token
      return callback(null, body.access_token);
    });
  }
}

module.exports = OAuth2Platform;
