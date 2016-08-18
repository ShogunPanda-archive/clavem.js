/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const express = require("express");
const http = require("http");
const https = require("https");
const childProcess = require("child_process");
const urlParser = require("url");

const Validations = require("./lib/validations");
const Platforms = require("./lib/platforms");
const BasePlatform = require("./lib/platforms/base");
const ClavemError = require("./lib/error");

const HTTP_STATUS_NOT_FOUND = 404;

/**
 * The main Clavem object.
 */
class Clavem{
  /**
   * Creates a new Clavem object.
   *
   * @param {string} host The HTTP address where bind for replies. Default is `locahost`.
   * @param {string | number} port The HTTP port where bind for replies. Default is `7772`.
   * @param {string} command The command to use to open the authentication URL. Default is `open \"{{URL}}\"`, where `{{URL}}` will replaced with the URL.
   * @param {boolean} secure If use HTTPS on the listening server.
   */
  constructor(host, port, command, secure = false){
    // Copy arguments
    /**
     * The HTTP address where bind for replies.
     *
     * @type {string}
     */
    this.host = host;

    /**
     * The HTTP port where bind for replies.
     * @type {number}
     */
    this.port = port;

    /**
     * The command to use to open the authentication URL. Default is `open \"{{URL}}\"`, where `{{URL}}` will replaced with the URL.
     *
     * @type {string}
     */
    this.command = command;

    /**
     * If use HTTPS on the listening server.
     * @type {boolean}
     */
    this.secure = secure;

    // Setup properties
    /**
     * The handler to process incoming requests.
     *
     * @type {function}
     */
    this.responseHandler = Clavem.defaultHandler.bind(this);

    /**
     * The template used to render a response on the browser.
     *
     * @type {string}
     */
    this.responsePage = fs.readFileSync(path.resolve(__dirname, "./defaultResponse.html")).toString(); // eslint-disable-line no-sync

    /**
     * The current status of the authentication.
     *
     * @type {string}
     */
    this.status = "waiting";

    /**
     * The authentication token.
     *
     * @type {string | object | null}
     */
    this.token = null;

    /**
     * The last occurred error.
     *
     * @type {Error}
     */
    this.error = null;

    /**
     * The current listening server.
     *
     * @type {object}
     */
    this.server = null;

    // Sanitize arguments
    if(!Validations.isPresent(this.host))
      this.host = Clavem.defaultHost;

    if(!Validations.isPresent(this.command))
      this.command = Clavem.defaultCommand;

    if(this.port)
      Validations.validatePort(this.port);
    else
      this.port = Clavem.defaultPort;
  }

  /**
   * Checks if the authentication has completed (successfully or not).
   *
   * @returns {boolean} `true` if the authentication has completed, `false` otherwise.
   */
  completed(){
    return this.status !== "waiting";
  }

  /**
   * Checks if the authentication has finished with success.
   *
   * @returns {boolean} `true` if the authentication has finished with success, `false` otherwise.
   */
  succeeded(){
    return this.status === "succeeded";
  }

  /**
   * Checks if the authentication has failed (either for being denied or for any kind of error).
   *
   * @returns {boolean} `true` if the authentication has failed, `false` otherwise.
   */
  failed(){
    return this.status !== "waiting" && this.status !== "succeeded";
  }

  /**
   * Checks if during the authentication any error has occurred.
   *
   * @returns {boolean} `true` if during the authentication any error has occurred, `false` otherwise.
   */
  errored(){
    return this.status === "errored";
  }

  /**
   * Checks if the authentication has been denied by the platform.
   *
   * @returns {boolean} `true` if the authentication has been denied by the platform, `false` otherwise.
   */
  denied(){
    return this.status === "denied";
  }

  /**
   * Checks if the authentication has timed out.
   *
   * @returns {boolean} `true` if the authentication has timed out, `false` otherwise.
   */
  timedOut(){
    return this.status === "timeout";
  }

  // skipCallback, timeout, callback
  /**
   * Performs the authorization flow.
   *
   * @param {string} serverUrl The URL to connect to. It must be a HTTP(S) URL or a valid clavem:// URL.
   * @param {array} args
   *  A list of modifiers for the authorization. These are interpreted right to left basing on the type:
   *
   *  * `function`: The callback to invoke when all the operations are finished.
   *  * `number`: The timeout for the flow.
   *  * other: The value is interpred as boolean and if truthy no callback URL will be appended to invoked URL.
   * @returns {Promise} A promise fulfilled with the authentication token or rejected with any occurred error.
   */
  authorize(serverUrl, ...args){
    // Defaults
    let skipCallback = false;
    let timeout = 0;
    let callback = null;

    this.status = "waiting";
    this.token = null;
    this.error = null;

    // Allow omitting intermediate arguments
    for(let i = args.length - 1; i > -1; i--){
      switch(typeof args[i]){
        case "function":
          callback = args[i];
          break;
        case "number":
          timeout = args[i];
          break;
        default:
          skipCallback = args[i];
          break;
      }
    }

    const hasCallback = typeof callback === "function";

    return new Promise((resolve, reject) => {
      Promise.resolve()
        .then(() => this._buildFinalUrl(serverUrl, skipCallback))
        .then(url => {
          // Validate the timeout
          if(timeout)
            Validations.validateTimeout(timeout);

          // Start the response server, then open the URL
          return this._performAuthorization(urlParser.format(url), timeout, callback);
        })
        .then(token => {
          if(hasCallback)
            this._invokeCallback(callback, null, token);

          resolve(token);
        })
        .catch(error => {
          if(error instanceof ClavemError){
            this.status = error.code;
            this.error = error;
          }else{
            this.status = "errored";
            this.error = new ClavemError("errored", error);
          }

          if(hasCallback)
            this._invokeCallback(callback, this.error);

          reject(this.error);
        });
    });
  }

  /**
   * @param {string} url @nodoc
   * @param {number} timeout @nodoc
   * @param {function} callback @nodoc
   * @returns {Promise} @nodoc
   * @private
   */
  _performAuthorization(url, timeout, callback){
    const hasCallback = typeof callback === "function";

    return new Promise((resolve, reject) => {
      // Create the server
      this.express = express();

      // Start the main route
      this.express.get("/", (req, res) => this._handleResponse(resolve, reject, res, req, hasCallback, callback));

      // Disable all other routes
      this.express.get("/:path", (req, res) => res.status(HTTP_STATUS_NOT_FOUND).type("text").send("Not found."));

      // Listen to the port
      this.server = this.secure ? https.createServer(this._sslConfig(), this.express) : http.createServer(this.express);

      this.server
        .listen(this.port, () => this._performRequest(url).catch(reject))
        .on("error", reject);

      // Disable Keep-Alive since we only reply to a single request
      this.server.setTimeout(0);

      // Set the timeout handler if needed
      if(timeout > 0)
        this.timeout = setTimeout(() => this._handleTimeout(reject), timeout);
    });
  }

  /**
   * @param {string} url @nodoc
   * @param {function} callback @nodoc
   * @returns {Promise} @nodoc
   * @private
   */
  _performRequest(url, callback){
    const hasCallback = typeof callback === "function";

    return new Promise((resolve, reject) => {
      if(Clavem.debug)
        console.log(`Performing request with command: ${this.command.replace("{{URL}}", url)}`);

      childProcess.exec(this.command.replace("{{URL}}", url), error => {
        // The command exited successfully
        if(!error){
          if(hasCallback)
            this._invokeCallback(callback);

          return resolve();
        }

        // Failure, set the error
        const returnError = new ClavemError("errored", error);

        // Close the server, if any, then return
        return this._closeServer().then(() => {
          if(hasCallback)
            this._invokeCallback(callback, returnError);

          reject(returnError);
        });
      });
    });
  }

  /**
   *
   * @param {function} callback @nodoc
   * @returns {Promise} @nodoc
   * @private
   */
  _closeServer(callback){
    const hasCallback = typeof callback === "function";

    // No server, just resolve
    if(!this.server){
      if(hasCallback)
        this._invokeCallback(callback);

      return Promise.resolve();
    }

    return new Promise(resolve => {
      // Schedule a server close
      process.nextTick(() => {
        this.server.close(() => {
          clearTimeout(this.timeout);
          this.timeout = null;
          this.server = null;

          if(hasCallback)
            this._invokeCallback(callback);

          resolve();
        });
      });
    });
  }

  /**
   *@returns {object} @nodoc
   * @private
   */
  _sslConfig(){
    return {
      key: fs.readFileSync(path.resolve(__dirname, "ssl/server.key")), // eslint-disable-line no-sync
      cert: fs.readFileSync(path.resolve(__dirname, "ssl/server.crt")) // eslint-disable-line no-sync
    };
  }

  /**
   * @param {string} url @nodoc
   * @param {function} skipCallback @nodoc
   * @returns {string} @nodoc
   * @private
   */
  _buildFinalUrl(url, skipCallback){
    url = Validations.validateUrl(url, true);

    // If not HTTP(S), use the platform
    if(!url.protocol.match(/^http(s?)$/)){
      this.platform = new Platforms[url.hostname](this);

      // Replace the response handler
      this.responseHandler = (...args) => this.platform.handleResponse(...args);

      // Build the URL
      return this.platform.buildUrl(url);
    }else if(!skipCallback){ // Add callback if requested to
      if(typeof url.query !== "object")
        url.query = {};

      Reflect.deleteProperty(url, "search");

      url.query.oauth_callback = new BasePlatform(this).callbackUrl(); // eslint-disable-line camelcase
    }

    return url;
  }

  /**
   * @param {function} resolve @nodoc
   * @param {function} reject @nodoc
   * @param {object} res @nodoc
   * @param {object} req @nodoc
   * @private
   */
  _handleResponse(resolve, reject, res, req){
    res.set("Connection", "close"); // Disable Keep-Alive since we handle a single request

    if(Clavem.debug)
      console.log(`Received response: ${req.method} ${req.url}`);

    this.responseHandler(req, (error, token) => {
      let responseError = null;

      if(error)
        responseError = new ClavemError("errored", error);
      else if(token){
        this.status = "succeeded";
        this.token = token;
        this.tokenSerialized = typeof token === "string" ? token : JSON.stringify(token);
      }else
        responseError = new ClavemError("denied", "Authorization denied by the platform.");

      if(responseError)
        this.status = responseError.code.toLowerCase();

      res.send(mustache.render(this.responsePage, this)).end();

      this._closeServer().then(() => {
        if(token)
          return resolve(token);

        return reject(responseError);
      });
    });
  }

  /**
   * @param {function} reject @nodoc
   * @private
   */
  _handleTimeout(reject){
    this.status = "timeout";
    this.error = "Authorization timeout.";

    this._closeServer().then(() => reject(new ClavemError("timeout", "Authorization timeout.")));
  }

  /**
   * @param {function} callback @nodoc
   * @param {array} args @nodoc
   * @private
   */
  _invokeCallback(callback, ...args){
    // The callback uses setTimeout to being able to throw errors since most of the time it is inside a promise
    setTimeout(() => callback(...args), 0);
  }
}

/**
 * If debug is active for Clavem.
 *
 * @type {boolean}
 */
Clavem.debug = (process.env.NODE_DEBUG || "").indexOf("clavem") !== -1;

/**
 * The default HTTP address where bind for replies.
 *
 * @type {string}
 */
Clavem.defaultHost = "localhost";

/**
 * The default HTTP port where bind for replies.
 *
 * @type {number}
 */
Clavem.defaultPort = 7772;

/**
 * The default command to use to open the authentication URL. Default is `open \"{{URL}}\"`, where `{{URL}}` will replaced with the URL.
 *
 * @type {string}
 */
Clavem.defaultCommand = "open \"{{URL}}\"";

/**
 * The default handler to process incoming requests.
 *
 * @param {object} req The Express request object.
 * @param {function} callback The callback to invoke when all the operations are finished.
 */
Clavem.defaultHandler = function(req, callback){
  // The default handler only forwards the oauth_token parameter
  const token = req.query.oauth_token; // eslint-disable-line camelcase
  callback(null, typeof token === "object" || Validations.isPresent(token) ? token : null);
};

module.exports = Clavem;
