/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it, beforeEach */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const LinkedInPlatform = require("../../lib/platforms/linked_in");

describe("LinkedInPlatform", function(){
  beforeEach(function(){
    this.subject = new LinkedInPlatform(null);
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.authorizeUrl).to.eq("https://www.linkedin.com/oauth/v2/authorization");
      expect(this.subject.accessTokenUrl).to.eq("https://www.linkedin.com/oauth/v2/accessToken");
    });
  });
});

/* eslint-enable prefer-arrow-callback */
