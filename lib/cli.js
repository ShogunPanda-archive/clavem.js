/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const Clavem = require("../main");
const Validations = require("../lib/validations");
const cli = require("commander");

/**
 * Starts a authentication via command-line.
 *
 * @module clavem.cli
 * @returns {Promise} The authentication result.
 */
module.exports = function(){
  try{
    cli.version("1.0.0")
      .option("-u, --redirect-url <URL>",
        `The URL where redirect the authorization URL to. It will listen to the URL port locally. Default is "${Clavem.defaultRedirectUrl}".`,
        Clavem.defaultRedirectUrl
      )
      .option("-c, --open-command <COMMAND>", "The command to open the URL. {{URL}} is replaced with the authorization URL. Default is 'open \"{{URL}}\"'.")
      .option("-s, --skip-callback", "Do not append the \"oauth_callback\" parameter to the authorization URL.")
      .option("-S, --silent", "In case of success, only print the token on the console in order to simplify scripting.")
      .option("-t, --timeout <TIMEOUT>", "The amount of seconds to wait for response from the remote endpoint before failing.", Validations.validateTimeout, 0)
      .parse(process.argv);

    cli.url = Validations.validateUrl(cli.args[0], false, false);

    return new Clavem(cli.redirectUrl, cli.openCommand).authorize(cli.url, cli.skipCallback, cli.timeout)
      .then(token => {
        console.log(cli.silent ? token : `SUCCESS: Authorization succeded. The authorization token is: ${JSON.stringify(token)}`);
      })
      .catch(e => {
        switch(e.code){
          case "DENIED":
            console.error("ERROR: Authorization denied.");
            break;
          case "TIMEOUT":
            console.error("ERROR: Authorization timed out.");
            break;
          default:
            console.error(`ERROR: Authorization failed due to an error - ${e.message}`);
            break;
        }

        return Promise.reject(e);
      });
  }catch(e){
    console.error(`ERROR: ${e.message}`);
    return Promise.reject(e);
  }
};
