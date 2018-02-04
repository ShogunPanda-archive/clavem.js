/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it, beforeEach */
/* eslint-disable camelcase, no-magic-numbers, no-unused-expressions, prefer-arrow-callback */

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const request = require("request");
const sinon = require("sinon");

const expect = require("chai").expect;

const Validations = require("../../lib/validations");
const OAuth1Platform = require("../../lib/platforms/oauth1");

chai.use(chaiAsPromised);

describe("OAuth1Platform", function(){
  beforeEach(function(){
    this.subject = new OAuth1Platform({redirectUrl: "https://HOST:123/"});
    this.subject.requestTokenUrl = "http://localhost/request";
    this.subject.authenticateUrl = "http://localhost/authenticate";
    this.subject.accessTokenUrl = "http://localhost/access";
  });

  describe(".buildUrl", function(){
    it("should get a access token, save the token and the secret and then return the valid URL", function(){
      const requestStub = sinon.stub(request, "post").yields(null, {statusCode: 200}, "oauth_token=TOKEN&oauth_token_secret=SECRET");

      const url = Validations.validateUrl("clavem://id:secret@pinterest", true, false);

      return expect(this.subject.buildUrl(url)).to.become("http://localhost/authenticate?oauth_token=TOKEN").then(() => {
        requestStub.restore();
        expect(requestStub.calledWith(
          {url: "http://localhost/request", oauth: {consumer_key: "id", consumer_secret: "secret", callback: "https://HOST:123/"}}
        )).to.be.ok;
        expect(this.subject.clientId).to.eq("id");
        expect(this.subject.clientSecret).to.eq("secret");
        expect(this.subject.oauthToken).to.eq("TOKEN");
        expect(this.subject.oauthSecret).to.eq("SECRET");
      });
    });

    it("should handle network errors", function(){
      const requestStub = sinon.stub(request, "post").yields("FAILED");

      const url = Validations.validateUrl("clavem://id:secret@pinterest", true, false);

      return expect(this.subject.buildUrl(url)).to.be.rejected.then(error => {
        requestStub.restore();
        expect(error).to.eq("FAILED");
      });
    });

    it("should handle denied requests", function(){
      const requestStub = sinon.stub(request, "post").yields(null, {statusCode: 401}, {a: 1});

      const url = Validations.validateUrl("clavem://id:secret@pinterest", true, false);

      return expect(this.subject.buildUrl(url)).to.be.rejected.then(error => {
        requestStub.restore();
        expect(error).to.eq('Invalid request token response: [401] {"a":1}');
      });
    });
  });

  describe(".handleResponse", function(){
    it("should not make HTTP requests for invalid response", function(done){
      const requestStub = sinon.stub(request, "post");

      this.subject.handleResponse({query: {denied: true}}, (error, token) => {
        requestStub.restore();

        expect(requestStub.called).not.to.be.ok;
        expect(error).to.be.null;
        expect(token).to.be.undefined;

        done();
      });
    });

    it("should exchange token, secret and verifier for the credentials", function(done){
      const requestStub = sinon.stub(request, "post").yields(null, {statusCode: 200}, {oauth_token: "TOKEN", oauth_token_secret: "SECRET"});

      this.subject.clientId = "id";
      this.subject.clientSecret = "secret";
      this.subject.oauthToken = "REQUEST_TOKEN";
      this.subject.oauthSecret = "REQUEST_SECRET";

      this.subject.handleResponse({oauth_verifier: "VERIFIER"}, (error, token) => {
        requestStub.restore();

        expect(requestStub.calledWith(
          {
            url: "http://localhost/access",
            oauth: {consumer_key: "id", consumer_secret: "secret", token: "REQUEST_TOKEN", token_secret: "REQUEST_SECRET", verifier: "VERIFIER"}
          }
        )).to.be.ok;

        expect(token).to.eql({token: "TOKEN", secret: "SECRET"});

        done();
      });
    });

    it("should handle network errors", function(done){
      const requestStub = sinon.stub(request, "post").yields("FAILED");

      this.subject.handleResponse({oauth_verifier: "VERIFIER"}, (error, token) => {
        requestStub.restore();

        expect(error).to.eql("FAILED");
        expect(token).to.be.undefined;

        done();
      });
    });

    it("should handle denied requests", function(){
      const requestStub = sinon.stub(request, "post").yields(null, {statusCode: 401}, {a: 1});

      this.subject.handleResponse({oauth_verifier: "VERIFIER"}, (error, token) => {
        requestStub.restore();
        expect(error).to.eql('Invalid access token response: [401] {"a":1}');
        expect(token).to.be.undefined;
      });
    });
  });
});

/* eslint-enable camelcase, no-magic-numbers, no-unused-expressions, prefer-arrow-callback */
