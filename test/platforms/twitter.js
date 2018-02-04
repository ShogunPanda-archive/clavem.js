/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it, beforeEach */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const TwitterPlatform = require("../../lib/platforms/twitter");

describe("TwitterPlatform", function(){
  beforeEach(function(){
    this.subject = new TwitterPlatform(null);
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.requestTokenUrl).to.eq("https://api.twitter.com/oauth/request_token");
      expect(this.subject.authenticateUrl).to.eq("https://api.twitter.com/oauth/authenticate");
      expect(this.subject.accessTokenUrl).to.eq("https://api.twitter.com/oauth/access_token");
    });
  });
});

/* eslint-enable prefer-arrow-callback */
