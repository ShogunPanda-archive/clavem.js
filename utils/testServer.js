#!/usr/bin/env node

/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

// Requires
const urlParser = require("url");
const validations = require("../lib/validations");
const server = require("express")();

// Constants
const PORT = 7779;
const MS_TO_S = 1E3;
const HTTP_RESPONSE_REDIRECT = 302;
const HTTP_RESPONSE_BAD_REQUEST = 400;

server.use((req, res) => {
  // Get parameters
  const token = req.query.requestedToken;
  const url = validations.validateUrl(req.query.oauth_callback, true, false); // eslint-disable-line camelcase
  let wait = parseInt(req.query.wait, 0);

  // Adjust timeout
  wait = (isNaN(wait) || wait < 0 ? 0 : wait) * MS_TO_S;

  setTimeout(() => {
    // Validate the URL
    if(!url)
      return !res.status(HTTP_RESPONSE_BAD_REQUEST).type("text").end("The oauth_callback parameter is missing or it is not a valid HTTP(s) address.");

    if(!url.query)
      url.query = {};

    // Generate the right redirect
    if(validations.isPresent(token))
      url.query.oauth_token = token;  // eslint-disable-line camelcase
    else
      url.query.failure = "FAILED";

    // Redirect the client
    return res.redirect(HTTP_RESPONSE_REDIRECT, urlParser.format(url));
  }, wait);
});

// Listen block
server.listen(PORT, () => {
  console.log(`Clavem Test server listing on port ${PORT} ...`);
  console.log("-- Use the \"requestedToken\" request parameter to get a successful redirect to a URL that will contain the \"oauth_token\" request parameter.");
  console.log("-- Everything else will result a failure redirect to a URL that will contain the \"failure\" request parameter.");
  console.log("-- Use the \"wait\" parameter to specify how many seconds to wait for. Non numeric or negative values are ignored.");
});
