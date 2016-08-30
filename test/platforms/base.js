/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/* globals describe, it, beforeEach */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const urlParser = require("url");
const BasePlatform = require("../../lib/platforms/base");

describe("BasePlatform", function(){
  beforeEach(function(){
    this.subject = new BasePlatform({redirectUrl: "http://HOST:123/"});
  });

  describe(".constructor", function(){
    it("should save client and parser", function(){
      expect(this.subject.client.redirectUrl).to.eq("http://HOST:123/");
      expect(this.subject.urlParser).to.eql(urlParser);
    });
  });

  describe(".callbackUrl", function(){
    it("should return a valid HTTP link", function(){
      this.subject.client.secure = false;
      expect(this.subject.callbackUrl()).to.eq("http://HOST:123/");
    });
  });

  describe(".buildUrl", function(){
    it("should show a warning about override", function(){
      class OtherPlatform extends BasePlatform{

      }

      expect(() => new OtherPlatform().buildUrl()).to.throw("OtherPlatform.buildUrl must override BasePlatfom.buildUrl.");
    });
  });
});

/* eslint-enable prefer-arrow-callback */
