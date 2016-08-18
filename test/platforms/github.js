/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/* globals describe, it, beforeEach */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const GithubPlatform = require("../../lib/platforms/github");

describe("GithubPlatform", function(){
  beforeEach(function(){
    this.subject = new GithubPlatform(null);
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.authorizeUrl).to.eq("https://github.com/login/oauth/authorize");
      expect(this.subject.accessTokenUrl).to.eq("https://github.com/login/oauth/access_token");
    });
  });
});

/* eslint-enable prefer-arrow-callback */
