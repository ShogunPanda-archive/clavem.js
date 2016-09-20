# clavem.js

[![Package Version](https://badge.fury.io/js/clavem.png)](http://badge.fury.io/js/clavem)
[![Dependency Status](https://gemnasium.com/ShogunPanda/clavem.js.png?travis)](https://gemnasium.com/ShogunPanda/clavem.js)
[![Build Status](https://secure.travis-ci.org/ShogunPanda/clavem.js.png?branch=master)](http://travis-ci.org/ShogunPanda/clavem.js)
[![Coverage Status](https://coveralls.io/repos/github/ShogunPanda/clavem.js/badge.svg?branch=master)](https://coveralls.io/github/ShogunPanda/clavem.js?branch=master)

A local callback server for oAuth web-flow.

https://github.com/ShogunPanda/clavem.js

## Supported implementations.

Clavem.js supports and has been tested on [NodeJS](http://nodejs.org) 6.0+. 

## Usage from the CLI

Clavem.js allows you to handle a full oAuth authentication flow directly from the console.

Simply install it by issuing:

```bash
npm install -g clavem
```

Then run the command providing the main URL. 

Let's say you have a Facebook Apps whose id is `abcd` and secret is `1234`, you can obtain a token by running:
 
```bash
clavem "clavem://abcd:1234@facebook/manage_pages"
```

where `manage_pages` must be a comma separated list of scopes you want to have access to.

The executable will open the user's browser, handle the authentication and then print the result both on the browser and on the console.

## Usage from the API

The API equivalent for the CLI example above is like the following:

```javascript
const Clavem = require("clavem");

const client = new Clavem();

client.authorize("clavem://abcd:1234@facebook/manage_pages")
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
    });
```

## API Documentation

The API documentation can be found [here](https://sw.cowtech.it/clavem.js/docs).

## Contributing to clavem.js

* Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet.
* Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it.
* Fork the project.
* Start a feature/bugfix branch.
* Commit and push until you are happy with your contribution.
* Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.

## Copyright

Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.

Licensed under the MIT license, which can be found at http://opensource.org/licenses/MIT.
