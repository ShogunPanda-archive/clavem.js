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
      .option("-h, --host <HOST>", `The host where listen for the reply. Default is "${Clavem.defaultHost}".`, Clavem.defaultHost)
      .option("-p, --port <PORT>", `The port where listen for the reply. Default is ${Clavem.defaultPort}.`, Validations.validatePort, Clavem.defaultPort)
      .option("-S, --ssl", "Use SSL to get the reply.")
      .option("-c, --open-command <COMMAND>", "The command to open the URL. {{URL}} is replaced with the specified URL. Default is 'open \"{{URL}}\"'.")
      .option("-s, --skip-callback", "Do not append the \"oauth_callback\" parameter to the authorization URL.")
      .option("-t, --timeout <TIMEOUT>", "The amount of seconds to wait for response from the remote endpoint before failing.", Validations.validateTimeout, 0)
      .parse(process.argv);

    cli.url = Validations.validateUrl(cli.args[0], false);

    return new Clavem(cli.host, cli.port, cli.openCommand, cli.ssl).authorize(cli.url, cli.skipCallback, cli.timeout)
      .then(token => {
        console.log(`SUCCESS: Authorization succeded. The authorization token is: ${token}`);
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
