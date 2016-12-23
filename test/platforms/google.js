/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/* globals describe, it, beforeEach */
/* eslint-disable camelcase, prefer-arrow-callback */

const expect = require("chai").expect;
const GooglePlatform = require("../../lib/platforms/google");

describe("GooglePlatform", function(){
  beforeEach(function(){
    this.subject = new GooglePlatform({redirectUrl: "https://HOST:123/"});
    this.subject.clientId = "ID";
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.authorizeUrl).to.eq("https://accounts.google.com/o/oauth2/v2/auth");
      expect(this.subject.accessTokenUrl).to.eq("https://www.googleapis.com/oauth2/v4/token");
      expect(this.subject.refreshTokenUrl).to.eq("https://www.googleapis.com/oauth2/v4/token");
    });
  });

  describe("._authorizePayload (private)", function(){
    it("should append the offline access type", function(){
      expect(this.subject._authorizePayload("http://cowtech.it")).to.eql({
        access_type: "offline", prompt: "consent", client_id: "ID", redirect_uri: "https://HOST:123/", response_type: "code"
      });
    });
  });
});

/* eslint-disable camelcase, prefer-arrow-callback */
