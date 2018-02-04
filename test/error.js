/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const ClavemError = require("../lib/error");

describe("ClavemError", function(){
  describe(".constructor", function(){
    it("should set the code and the message", function(){
      const subject = new ClavemError("foo", "message");
      expect(subject.code).to.eq("FOO");
      expect(subject.message).to.eq("message");
    });

    it("should set wrappedError", function(){
      const error = new RangeError("ERROR");
      const subject = new ClavemError("foo", error);
      expect(subject.message).to.eq("ERROR");
      expect(subject.wrappedError).to.equal(error);
    });

    it("should copy another ClavemError", function(){
      const error = new RangeError("ERROR");
      const original = new ClavemError("foo", error);
      const subject = new ClavemError("foo", original);

      expect(subject.message).to.eq("ERROR");
      expect(subject.wrappedError).to.equal(error);
    });
  });
});

/* eslint-enable prefer-arrow-callback */
