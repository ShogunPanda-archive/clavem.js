/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it, beforeEach */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const LivePlatform = require("../../lib/platforms/live");

describe("LivePlatform", function(){
  beforeEach(function(){
    this.subject = new LivePlatform(null);
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.authorizeUrl).to.eq("https://login.live.com/oauth20_authorize.srf");
      expect(this.subject.accessTokenUrl).to.eq("https://login.live.com/oauth20_token.srf");
      expect(this.subject.refreshTokenUrl).to.eq("https://login.live.com/oauth20_token.srf");
    });
  });
});

/* eslint-enable prefer-arrow-callback */
