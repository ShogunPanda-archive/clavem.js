/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it, beforeEach */
/* eslint-disable prefer-arrow-callback */

const expect = require("chai").expect;
const DropboxPlatform = require("../../lib/platforms/dropbox");

describe("DropboxPlatform", function(){
  beforeEach(function(){
    this.subject = new DropboxPlatform(null);
  });

  describe(".constructor", function(){
    it("should correctly set URLs", function(){
      expect(this.subject.authorizeUrl).to.eq("https://www.dropbox.com/1/oauth2/authorize");
      expect(this.subject.accessTokenUrl).to.eq("https://api.dropboxapi.com/1/oauth2/token");
    });
  });
});

/* eslint-enable prefer-arrow-callback */
