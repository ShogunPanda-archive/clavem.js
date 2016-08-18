/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/* globals describe, it, beforeEach */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const TumblrPlatform = require("../../lib/platforms/tumblr");

describe("TumblrPlatform", function(){
  beforeEach(function(){
    this.subject = new TumblrPlatform(null);
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.requestTokenUrl).to.eq("https://www.tumblr.com/oauth/request_token");
      expect(this.subject.authenticateUrl).to.eq("https://www.tumblr.com/oauth/authorize");
      expect(this.subject.accessTokenUrl).to.eq("https://www.tumblr.com/oauth/access_token");
    });
  });
});

/* eslint-enable prefer-arrow-callback */
