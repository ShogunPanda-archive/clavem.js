/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const urlParser = require("url");
const Platforms = require("./platforms");
const validPlatforms = Object.keys(Platforms).join(", ");

const MAX_PORT = 65535;

/**
 * Validation functions.
 *
 * @module clavem.validations
 */
module.exports = {
  /**
   * Checks if the value is a non empty string.
   *
   * @param {string} value The value to check.
   * @returns {boolean} `true` if the value is a non empty string, `false` otherwise.
   */
  isPresent(value){
    return typeof value === "string" && value.trim().length > 0;
  },

  /**
   * Checks if the value is a valid URL.
   *
   * @param {object} value The value to check.
   * @param {boolean} returnParsed Whether or not return the original URL or its parsed components.
   * @param {boolean} throwExceptions Whether or not throw exceptions in case of parsing errors.
   * @returns {string | object | null} The original URL, its parsed components or `null` in case of invalid URLs.
   */
  validateUrl(value, returnParsed = false, throwExceptions = true){
    try{
      if(typeof value !== "string")
        throw new TypeError("The URL is required and must be a string.");

      const parsed = urlParser.parse(value, true);
      parsed.original = value;
      parsed.protocol = typeof parsed.protocol === "string" ? parsed.protocol.slice(0, -1) : "";

      if(!parsed.protocol.match(/^http(s?)$/) && (parsed.protocol !== "clavem" || !Platforms[parsed.hostname]))
        throw new RangeError(`The URL must be a valid HTTP(s) address or a clavem:// URL whose host is a platform recognized by Clavem (${validPlatforms}).`);

      return returnParsed ? parsed : value;
    }catch(e){
      if(throwExceptions)
        throw e;
      else
        return null;
    }
  },

  /**
   * Checks if the value is a valid TCP port (between 1 and 65535).
   *
   * @param {object} value The value to check.
   * @returns {number} The original value as number if the value is a valid TCP port.
   */
  validatePort(value){
    value = parseInt(value, 0);

    if(isNaN(value) || value < 1 || value > MAX_PORT)
      throw new RangeError("Port must be a number between 1 and 65535.");

    return value;
  },

  /**
   * Checks if the value is a valid timeout (strictly positive number, denoting millseconds).
   *
   * @param {object} value The value to check.
   * @returns {number} The original value as number if the value is a valid timeout.
   */
  validateTimeout(value){
    value = parseInt(value, 0);

    if(isNaN(value) || value < 1)
      throw new RangeError("The timeout must be a number greater than 0.");

    return value;
  }
};
