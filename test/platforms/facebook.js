/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/* globals describe, it, beforeEach */
/* eslint-disable camelcase, prefer-arrow-callback */

const expect = require("chai").expect;
const FacebookPlatform = require("../../lib/platforms/facebook");

describe("FacebookPlatform", function(){
  beforeEach(function(){
    this.subject = new FacebookPlatform(null);
    this.subject.clientId = "ID";
    this.subject.clientSecret = "SECRET";
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.authorizeUrl).to.eq("https://www.facebook.com/dialog/oauth");
      expect(this.subject.accessTokenUrl).to.eq("https://graph.facebook.com/oauth/access_token");
      expect(this.subject.refreshTokenUrl).to.eq("https://graph.facebook.com/oauth/access_token");
    });
  });

  describe("._refreshTokenPayload (private)", function(){
    it("should correctly return payload to refresh the token", function(){
      expect(this.subject._refreshTokenPayload("TOKEN")).to.eql({
        client_id: "ID", client_secret: "SECRET", fb_exchange_token: "TOKEN", grant_type: "fb_exchange_token"
      });
    });
  });
});

/* eslint-disable camelcase, prefer-arrow-callback */
