/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const request = require("request");
const BasePlatform = require("./base");

const HTTP_STATUS_OK = 200;

/**
 * A oAuth 1.0a platform for Clavem.
 *
 * @memberOf clavem.platforms
 */
class OAuth1Platform extends BasePlatform{
  /**
   * Builds the URL where redirect the user's browser to.
   * @param {object} url The parsed URL with credentials informations.
   * @returns {Promise} A promise which will contain the URL where redirect the user's browser to.
   */
  buildUrl(url){
    this._extractCredentials(url);

    return new Promise((resolve, reject) => {
      request.post({
        url: this.requestTokenUrl,
        oauth: {consumer_key: this.clientId, consumer_secret: this.clientSecret, callback: this.callbackUrl()} // eslint-disable-line camelcase
      }, (error, response, body) => {
        if(error)
          return reject(error);

        body = this._parseBody(body);

        // Request failed, abort
        if(response.statusCode !== HTTP_STATUS_OK)
          return reject(`Invalid request token response: [${response.statusCode}] ${JSON.stringify(body)}`);

        // Save OAuth details for later
        /**
         * The oAuth request token.
         *
         * @type {string}
         */
        this.oauthToken = body.oauth_token; // eslint-disable-line camelcase

        /**
         * The oAuth request secret.
         *
         * @type {string}
         */
        this.oauthSecret = body.oauth_token_secret; // eslint-disable-line camelcase

        // Build the URL
        const returnUrl = Object.assign(this.urlParser.parse(this.authenticateUrl), {query: {oauth_token: this.oauthToken}}); // eslint-disable-line camelcase
        return resolve(this.urlParser.format(returnUrl));
      });
    });
  }

  /**
   * Handles the final authentication response from the user's browser.
   *
   * @param {object} req The Express request object.
   * @param {function} callback The callback to invoke when all the operations are finished.
   * @returns {object} The callback return value.
   */
  handleResponse(req, callback){
    req = this._ensureValidRequest(req);

    if(req.query.denied || !req.query.oauth_verifier)
      return callback(null);

    // Exchange request token with access token
    return request.post({
      url: this.accessTokenUrl,
      oauth: {
        consumer_key: this.clientId, consumer_secret: this.clientSecret, // eslint-disable-line camelcase
        token: this.oauthToken, token_secret: this.oauthSecret, verifier: req.query.oauth_verifier // eslint-disable-line camelcase
      }
    }, (error, response, body) => {
      if(error)
        return callback(error);

      body = this._parseBody(body);

      if(response.statusCode !== HTTP_STATUS_OK)
        return callback(`Invalid access token response: [${response.statusCode}] ${JSON.stringify(body)}`);

      return callback(null, {token: body.oauth_token, secret: body.oauth_token_secret}); // eslint-disable-line camelcase
    });
  }
}

module.exports = OAuth1Platform;
