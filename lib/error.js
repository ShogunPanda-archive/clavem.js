/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/**
 * Error raised by Clavem whenever the authentication goes wrong.
 *
 * @memberOf clavem.errors
 */
class ClavemError extends Error{
  /**
   * Creates a new error.
   *
   * @param {string} code The code of the error.
   * @param {Error | null} error The wrapped error.
   */
  constructor(code, error){
    if(error instanceof ClavemError){
      super(error.message);

      /**
       * The wrapped error.
       *
       * @type {Error}
       */
      this.wrappedError = error.wrappedError;
    }else{
      super(error ? error.message || error : code);

      if(error instanceof Error)
        this.wrappedError = error;
    }

    /**
     * The error code.
     *
     * @type {string}
     */
    this.code = code.toString().toUpperCase();
  }
}

/**
 * @namespace clavem.errors
 */
module.exports = ClavemError;
