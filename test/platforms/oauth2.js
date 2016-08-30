/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/* globals describe, it, beforeEach */
/* eslint-disable camelcase, no-magic-numbers, no-unused-expressions, prefer-arrow-callback, max-nested-callbacks */

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const request = require("request");
const sinon = require("sinon");

const expect = require("chai").expect;

const Validations = require("../../lib/validations");
const OAuth2Platform = require("../../lib/platforms/oauth2");

chai.use(chaiAsPromised);

describe("OAuth2Platform", function(){
  beforeEach(function(){
    this.subject = new OAuth2Platform({redirectUrl: "https://HOST:123/"});
    this.subject.accessTokenUrl = "http://localhost/access";
    this.subject.authorizeUrl = "http://localhost/authorize";
  });

  describe(".buildUrl", function(){
    it("should return the valid URL", function(){
      let url = Validations.validateUrl("clavem://id:secret@pinterest/cde", true, false);

      expect(this.subject.buildUrl(url)).to.eq("http://localhost/authorize?client_id=id&response_type=code&redirect_uri=https%3A%2F%2FHOST%3A123%2F&scope=cde");
      expect(this.subject.clientId).to.eq("id");
      expect(this.subject.clientSecret).to.eq("secret");

      url = Validations.validateUrl("clavem://id:secret@pinterest", true, false);
      expect(this.subject.buildUrl(url)).to.eq("http://localhost/authorize?client_id=id&response_type=code&redirect_uri=https%3A%2F%2FHOST%3A123%2F");
    });
  });

  describe(".handleResponse", function(){
    describe("when a valid code was received", function(){
      describe("when no token refresh is needed", function(){
        it("should exchange with a access token", function(done){
          const requestStub = sinon.stub(request, "post").yields(null, {statusCode: 200}, {access_token: "TOKEN"});

          this.subject.clientId = "id";
          this.subject.clientSecret = "secret";

          this.subject.handleResponse({code: "CODE"}, (error, token) => {
            requestStub.restore();

            expect(requestStub.calledWith(
              {
                url: "http://localhost/access", json: true,
                form: {client_id: "id", client_secret: "secret", redirect_uri: "https://HOST:123/", grant_type: "authorization_code", code: "CODE"}
              }
            )).to.be.ok;

            expect(token).to.eql("TOKEN");

            done();
          });
        });

        it("should handle network errors", function(done){
          const requestStub = sinon.stub(request, "post").yields("FAILED");

          this.subject.handleResponse({code: "CODE"}, (error, token) => {
            requestStub.restore();

            expect(error).to.eql("FAILED");
            expect(token).to.be.undefined;

            done();
          });
        });

        it("should handle denied requests", function(){
          const requestStub = sinon.stub(request, "get").yields(null, {statusCode: 401}, {a: 1});

          this.subject.accessTokenMethod = "get";
          this.subject.handleResponse({code: "CODE"}, (error, token) => {
            requestStub.restore();
            expect(error).to.eql('Invalid code exchange response: [401] {"a":1}');
            expect(token).to.be.undefined;
          });
        });
      });

      describe("when a token refresh is needed", function(){
        beforeEach(function(){
          this.subject.refreshTokenUrl = "http://localhost/refresh";
        });

        it("should refresh with a access token", function(done){
          const requestStub = sinon.stub(request, "post");

          requestStub.onFirstCall().yields(null, {statusCode: 200}, {access_token: "SHORT_TOKEN"});
          requestStub.onSecondCall().yields(null, {statusCode: 200}, {access_token: "TOKEN"});

          this.subject.clientId = "id";
          this.subject.clientSecret = "secret";

          this.subject.handleResponse({code: "CODE"}, (error, token) => {
            requestStub.restore();

            expect(requestStub.calledWith(
              {
                url: "http://localhost/refresh", json: true,
                form: {client_id: "id", client_secret: "secret", grant_type: "refresh_token", refresh_token: "SHORT_TOKEN"}
              }
            )).to.be.ok;

            expect(token).to.eql("TOKEN");
            done();
          });
        });

        it("should handle network errors", function(done){
          const requestStub = sinon.stub(request, "post");

          requestStub.onFirstCall().yields(null, {statusCode: 200}, {access_token: "SHORT_TOKEN"});
          requestStub.onSecondCall().yields("FAILED");

          this.subject.handleResponse({code: "CODE"}, (error, token) => {
            requestStub.restore();

            expect(error).to.eql("FAILED");
            expect(token).to.be.undefined;

            done();
          });
        });

        it("should handle denied requests", function(){
          const requestStub = sinon.stub(request, "get");

          requestStub.onFirstCall().yields(null, {statusCode: 200}, {access_token: "SHORT_TOKEN"});
          requestStub.onSecondCall().yields(null, {statusCode: 401}, {a: 1});

          this.subject.accessTokenMethod = "get";
          this.subject.handleResponse({code: "CODE"}, (error, token) => {
            requestStub.restore();
            expect(error).to.eql('Invalid refresh token exchange response: [401] {"a":1}');
            expect(token).to.be.undefined;
          });
        });
      });
    });

    describe("without a valid code", function(){
      it("should handle missing code", function(done){
        this.subject.handleResponse({}, (error, token) => {
          expect(error).to.be.null;
          expect(token).to.be.undefined;

          done();
        });
      });

      it("should handle authorization denied", function(done){
        this.subject.handleResponse({error: "access_denied"}, (error, token) => {
          expect(error).to.be.null;
          expect(token).to.be.undefined;

          done();
        });
      });

      it("should handle authorization aborted", function(done){
        this.subject.handleResponse({error: "user_cancelled_authorize"}, (error, token) => {
          expect(error).to.be.null;
          expect(token).to.be.undefined;

          done();
        });
      });

      it("should handle errors", function(done){
        this.subject.handleResponse({error: "ERROR", error_description: "DESCRIPTION"}, (error, token) => {
          expect(error).to.eql("DESCRIPTION");
          expect(token).to.be.undefined;

          done();
        });
      });
    });
  });
});

/* eslint-enable camelcase, no-magic-numbers, no-unused-expressions, prefer-arrow-callback, max-nested-callbacks */
