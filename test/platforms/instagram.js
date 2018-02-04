/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it, beforeEach */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const InstagramPlatform = require("../../lib/platforms/instagram");

describe("InstagramPlatform", function(){
  beforeEach(function(){
    this.subject = new InstagramPlatform(null);
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.authorizeUrl).to.eq("https://api.instagram.com/oauth/authorize");
      expect(this.subject.accessTokenUrl).to.eq("https://api.instagram.com/oauth/access_token");
    });
  });
});

/* eslint-enable prefer-arrow-callback */
