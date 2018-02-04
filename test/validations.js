/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it */
/* eslint-disable prefer-arrow-callback, no-unused-expressions, no-magic-numbers */

const expect = require("chai").expect;
const Validations = require("../lib/validations");

describe("Validations", function(){
  describe(".isPresent", function(){
    it("should return true for non empty-string", function(){
      expect(Validations.isPresent("ABC")).to.be.ok;
      expect(Validations.isPresent("CE")).to.be.ok;
    });

    it("should return false everything else", function(){
      expect(Validations.isPresent(null)).not.to.be.ok;
      expect(Validations.isPresent(undefined)).not.to.be.ok; // eslint-disable-line no-undefined
      expect(Validations.isPresent([])).not.to.be.ok;
      expect(Validations.isPresent({})).not.to.be.ok;
      expect(Validations.isPresent(0)).not.to.be.ok;
      expect(Validations.isPresent("")).not.to.be.ok;
      expect(Validations.isPresent(" ")).not.to.be.ok;
    });
  });

  describe(".validateUrl", function(){
    it("should correctly parse a URL", function(){
      expect(Validations.validateUrl("http://cowtech.it")).not.to.throw;
      expect(Validations.validateUrl("http://cowtech.it")).to.eq("http://cowtech.it");
    });

    it("should return the parsed URL if requested to", function(){
      expect(JSON.stringify(Validations.validateUrl("http://cowtech.it", true))).to.eql(JSON.stringify({
        protocol: "http", slashes: true, auth: null,
        host: "cowtech.it", port: null, hostname: "cowtech.it",
        hash: null, search: "", query: {},
        pathname: "/", path: "/",
        href: "http://cowtech.it/", original: "http://cowtech.it"
      }));
    });

    it("should only parse strings", function(){
      expect(() => Validations.validateUrl(123)).to.throw(TypeError);
    });

    it("should reject unknown protocols, accepting only HTTP(S) and platform tags", function(){
      expect(() => Validations.validateUrl("http://cowtech.it")).not.to.throw(RangeError);
      expect(() => Validations.validateUrl("https://cowtech.it")).not.to.throw(RangeError);
      expect(() => Validations.validateUrl("clavem://a:b@facebook")).to.throw(RangeError);
      expect(() => Validations.validateUrl("clavem://a:b@facebook", false, false)).not.to.throw(RangeError);
      expect(() => Validations.validateUrl("other")).to.throw(RangeError);
    });

    it("should reject invalid URLS by returning null, if asked to", function(){
      expect(Validations.validateUrl("ftp://cowtech.it", false, false, false)).to.be.null;
    });
  });

  describe(".validatePort", function(){
    it("should return true for numbers between 1 and 65535", function(){
      expect(Validations.validatePort(1)).to.be.ok;
      expect(Validations.validatePort(65535)).to.be.ok;
      expect(Validations.validatePort(10)).to.be.ok;
      expect(Validations.validatePort("200")).to.be.ok;
    });

    it("should return false everything else", function(){
      expect(() => Validations.validatePort("0")).to.throw(RangeError);
      expect(() => Validations.validatePort(0)).to.throw(RangeError);
      expect(() => Validations.validatePort(65536)).to.throw(RangeError);
      expect(() => Validations.validatePort(70000)).to.throw(RangeError);
      expect(() => Validations.validatePort("other")).to.throw(RangeError);
    });
  });

  describe(".validateTimeout", function(){
    it("should return true for numbers greater than 0", function(){
      expect(Validations.validateTimeout(1)).to.be.ok;
      expect(Validations.validateTimeout(65535)).to.be.ok;
      expect(Validations.validateTimeout(10)).to.be.ok;
      expect(Validations.validateTimeout("200")).to.be.ok;
    });

    it("should return false everything else", function(){
      expect(() => Validations.validateTimeout("0")).to.throw(RangeError);
      expect(() => Validations.validateTimeout(0)).to.throw(RangeError);
      expect(() => Validations.validateTimeout(-1)).to.throw(RangeError);
      expect(() => Validations.validateTimeout("other")).to.throw(RangeError);
    });
  });
});

/* eslint-enaable prefer-arrow-callback, no-unused-expressions, no-magic-numbers */
