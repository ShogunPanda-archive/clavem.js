/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it, beforeEach */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const Validations = require("../../lib/validations");
const PinterestPlatform = require("../../lib/platforms/pinterest");

describe("PinterestPlatform", function(){
  beforeEach(function(){
    this.subject = new PinterestPlatform({redirectUrl: "https://HOST:123/"});
    this.subject.clientId = "ID";
    this.subject.clientSecret = "SECRET";
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.authorizeUrl).to.eq("https://api.pinterest.com/oauth/");
      expect(this.subject.accessTokenUrl).to.eq("https://api.pinterest.com/v1/oauth/token");
    });
  });

  describe(".buildUrl", function(){
    it("should correctly make sure the scope is always present", function(){
      let url = null;

      url = Validations.validateUrl("clavem://id:secret@pinterest/cde", true, false);
      expect(this.subject.buildUrl(url)).to.eql(
        "https://api.pinterest.com/oauth/?client_id=id&response_type=code&redirect_uri=https%3A%2F%2FHOST%3A123%2F&scope=cde"
      );

      url = Validations.validateUrl("clavem://id:secret@pinterest", true, false);
      expect(this.subject.buildUrl(url)).to.eql(
        "https://api.pinterest.com/oauth/?client_id=id&response_type=code&redirect_uri=https%3A%2F%2FHOST%3A123%2F&scope=read_public"
      );

      url = Validations.validateUrl("clavem://id:secret@pinterest/", true, false);
      expect(this.subject.buildUrl(url)).to.eql(
        "https://api.pinterest.com/oauth/?client_id=id&response_type=code&redirect_uri=https%3A%2F%2FHOST%3A123%2F&scope=read_public"
      );

      url = Validations.validateUrl("clavem://pinterest/", true, false);
      expect(this.subject.buildUrl(url)).to.eql(
        "https://api.pinterest.com/oauth/?client_id=&response_type=code&redirect_uri=https%3A%2F%2FHOST%3A123%2F&scope=read_public"
      );
    });
  });
});

/* eslint-disable prefer-arrow-callback */
