/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it, beforeEach */
/* eslint-disable no-unused-expressions, prefer-arrow-callback, no-undefined, no-magic-numbers */

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const chaiHTTP = require("chai-http");
const sinon = require("sinon");
const childProcess = require("child_process");

const expect = chai.expect;

const Clavem = require("../main");
const ClavemError = require("../lib/error");
const Validations = require("../lib/validations");
const Platforms = require("../lib/platforms");
const BasePlatform = require("../lib/platforms/base");

let port = 7773;

chai.use(chaiAsPromised);
chai.use(chaiHTTP);

describe("Clavem", function(){
  describe(".constructor", function(){
    it("should save parameters, load the response page and prepare for execution", function(){
      const testPort = 123;
      const subject = new Clavem(`http://HOST:${testPort}`, "COMMAND");

      expect(subject.redirectUrl).to.eq(`http://HOST:${testPort}`);
      expect(subject.command).to.eq("COMMAND");
      expect(subject.responseHandler).to.be.a("function");
      expect(subject.responsePage).to.be.a("string");
      expect(subject.responsePage.length).to.be.above(0);
      expect(subject.status).to.eq("waiting");
    });

    it("should have good defaults for redirectUrl and command", function(){
      const subject = new Clavem();

      expect(subject.redirectUrl).to.eq("http://localhost:7772");
      expect(subject.command).to.eq("open \"{{URL}}\"");
    });
  });

  describe(".completed", function(){
    it("should correctly return the status", function(){
      const subject = new Clavem();
      expect(subject.completed()).not.to.be.ok;
      subject.status = "succedeed";
      expect(subject.completed()).to.be.ok;
    });
  });

  describe(".succeeded", function(){
    it("should correctly return the status", function(){
      const subject = new Clavem();
      expect(subject.succeeded()).not.to.be.ok;
      subject.status = "succeeded";
      expect(subject.succeeded()).to.be.ok;
    });
  });

  describe(".failed", function(){
    it("should correctly return the status", function(){
      const subject = new Clavem();
      expect(subject.failed()).not.to.be.ok;
      subject.status = "denied";
      expect(subject.failed()).to.be.ok;
    });
  });

  describe(".errored", function(){
    it("should correctly return the status", function(){
      const subject = new Clavem();
      expect(subject.errored()).not.to.be.ok;
      subject.status = "errored";
      expect(subject.errored()).to.be.ok;
    });
  });

  describe(".denied", function(){
    it("should correctly return the status", function(){
      const subject = new Clavem();
      expect(subject.denied()).not.to.be.ok;
      subject.status = "denied";
      expect(subject.denied()).to.be.ok;
    });
  });

  describe(".timedOut", function(){
    it("should correctly return the status", function(){
      const subject = new Clavem();
      expect(subject.timedOut()).not.to.be.ok;
      subject.status = "timeout";
      expect(subject.timedOut()).to.be.ok;
    });
  });

  describe(".authorize", function(){
    beforeEach(function(){
      this.port = port++;
      this.subject = new Clavem(`http://localhost:${this.port}`);
    });

    it("should build the final URL, then perform the entire authorization", function(done){
      const performStub = sinon.stub(this.subject, "_performAuthorization").returns(Promise.resolve());

      this.subject.authorize("http://cowtech.it", false, () => {
        performStub.restore();

        expect(performStub.calledWith(`http://cowtech.it/?oauth_callback=http%3A%2F%2Flocalhost%3A${this.port}`)).to.be.ok;
        done();
      });
    });

    it("should not append a callback", function(done){
      const performStub = sinon.stub(this.subject, "_performAuthorization").returns(Promise.resolve());

      this.subject.authorize("http://cowtech.it", true, function(){
        performStub.restore();

        expect(performStub.calledWith("http://cowtech.it/")).to.be.ok;
        done();
      });
    });

    it("should handle weird URL query strings", function(){
      const performStub = sinon.stub(this.subject, "_performAuthorization").returns(Promise.resolve("OK"));

      const urlParserStub = sinon.stub(Validations, "validateUrl").returns({protocol: "http", host: "cowtech.it"});

      const restore = function(){
        performStub.restore();
        urlParserStub.restore();
      };

      return expect(this.subject.authorize("http://cowtech.it")).to.be.become("OK").then(restore).catch(error => {
        restore();
        return Promise.reject(error);
      });
    });

    it("should validate timeouts", function(){
      const performStub = sinon.stub(this.subject, "_performRequest").returns(Promise.resolve("OK"));

      return expect(this.subject.authorize("http://cowtech.it", -10)).to.rejected.then(error => {
        performStub.restore();

        expect(error.code).to.eq("ERRORED");
        expect(error.message).to.eq("The timeout must be a number greater than 0.");
      });
    });

    it("should return tokens to the callback", function(done){
      const performStub = sinon.stub(this.subject, "_performRequest").returns(Promise.resolve("OK"));

      setTimeout(() => {
        chai.request(this.subject.express).get("/?oauth_token=foo").end();
      }, 10);

      this.subject.authorize("http://cowtech.it", (error, token) => {
        performStub.restore();

        expect(error).to.be.null;
        expect(token).to.eq("foo");

        done();
      });
    });

    it("should handle error with the callback", function(done){
      const performStub = sinon.stub(this.subject, "_performAuthorization");

      this.subject.authorize("http://cowtech.it", -10, error => {
        performStub.restore();

        expect(performStub.called).not.to.be.ok;
        expect(error).to.be.instanceof(ClavemError);
        expect(error.code).to.eq("ERRORED");
        expect(error.message).to.eq("The timeout must be a number greater than 0.");
        expect(error).to.be.instanceof(ClavemError);

        expect(this.subject.status).to.eq("errored");
        expect(this.subject.error).to.be.instanceof(ClavemError);
        expect(this.subject.error.code).to.eq("ERRORED");
        expect(this.subject.error.message).to.eq("The timeout must be a number greater than 0.");

        done();
      }).catch(() => false);
    });

    it("should start an Express server and then perform the request", function(done){
      const performStub = sinon.stub(this.subject, "_performRequest").returns(Promise.resolve("OK"));

      const promise = this.subject.authorize("http://cowtech.it").catch(() => false);

      // Wait for the server to start
      setTimeout(() => {
        chai.request(this.subject.express).get("/").end(function(){
          performStub.restore();

          expect(performStub.called).to.be.ok;
          expect(promise).to.be.fulfilled;
          done();
        });
      }, 10);
    });

    describe("using the default handler", function(){
      it("should execute the open command and correctly handle string tokens", function(){
        const debug = Clavem.debug;
        Clavem.debug = "clavem";

        this.subject.command = "echo \"{{URL}}\"";
        const execSpy = sinon.spy(childProcess, "exec");
        const logStub = sinon.stub(console, "log");

        const promise = this.subject.authorize("http://cowtech.it", true).catch(() => false);

        setTimeout(() => {
          chai.request(this.subject.express).get("/?oauth_token=foo").end(function(){
            expect(execSpy.calledWith("echo \"http://cowtech.it\"")).to.be.ok;
          });
        }, 10);

        const restore = function(){
          Clavem.debug = debug;
          logStub.restore();
          execSpy.restore();
        };

        return expect(promise).to.become("foo").then(restore).catch(error => {
          restore();
          return Promise.reject(error);
        });
      });

      it("should execute the open command and correctly handle object tokens", function(){
        this.subject.command = "echo \"{{URL}}\"";
        const execSpy = sinon.spy(childProcess, "exec");

        const promise = this.subject.authorize("http://cowtech.it", true);

        setTimeout(() => {
          chai.request(this.subject.express).get("/?oauth_token[a]=foo").end(function(){
            expect(execSpy.calledWith("echo \"http://cowtech.it\"")).to.be.ok;
          });
        }, 10);

        const restore = () => execSpy.restore();

        return expect(promise).to.become({a: "foo"}).then(restore).catch(error => {
          restore();
          return Promise.reject(error);
        });
      });
    });

    it("should handle opening errors", function(){
      this.subject.command = "echo \"{{URL}}\"";
      const execStub = sinon.stub(childProcess, "exec", (command, cb) => cb("ERROR"));

      const promise = this.subject.authorize("http://cowtech.it", true);

      const restore = () => execStub.restore();

      return expect(promise).to.be.rejected.then(error => {
        restore();

        expect(error.code).to.eq("ERRORED");
        expect(error.message).to.eq("ERROR");
      }).catch(restore);
    });

    it("should handle HTTP errors", function(){
      const performStub = sinon.stub(this.subject, "_performRequest").returns(Promise.resolve("OK"));

      const restore = () => performStub.restore();

      this.subject = new Clavem("https://localhost");
      return expect(this.subject.authorize("http://cowtech.it")).to.be.rejected.then(error => {
        restore();

        expect(error.code).to.eq("ERRORED");
        expect(error.message).to.eq("listen EACCES 0.0.0.0:80");
      }).catch(restore);
    });

    it("should propagate HTTP errors to the callback", function(done){
      const performStub = sinon.stub(this.subject, "_performRequest").returns(Promise.resolve("OK"));
      const setuidStub = sinon.stub(process, "setuid");
      const oldUid = process.env.SUDO_UID;
      process.env.SUDO_UID = 123;

      this.subject = new Clavem("https://localhost");
      this.subject.authorize("http://cowtech.it", error => {
        performStub.restore();
        setuidStub.restore();

        expect(setuidStub.calledWith(0)).to.be.ok;
        expect(error.code).to.eq("ERRORED");
        expect(error.message).to.eq("listen EACCES 0.0.0.0:443");

        process.env.SUDO_UID = oldUid;
        done();
      }).catch(() => false);
    });

    it("should handle timeouts", function(){
      const performStub = sinon.stub(this.subject, "_performRequest").returns(Promise.resolve("OK"));

      const restore = () => performStub.restore();
      return expect(this.subject.authorize("http://cowtech.it", 10)).to.be.rejected.then(error => {
        restore();

        expect(error.code).to.eq("TIMEOUT");
        expect(error.message).to.eq("Authorization timeout.");
      });
    });

    it("should reject non / paths", function(done){
      const performStub = sinon.stub(this.subject, "_performRequest").returns(Promise.resolve("OK"));

      this.subject.authorize("http://cowtech.it", null);

      // Wait for the server to start
      this.subject.secure = true;

      setTimeout(() => {
        chai.request(this.subject.express).get("/whatever").end(response => {
          performStub.restore();

          expect(response).to.have.status(404);
          done();
        });
      }, 10);
    });

    describe("using custom platforms", function(){
      it("should not allow invalid platforms", function(){
        const performStub = sinon.stub(this.subject, "_performRequest").returns(Promise.resolve("OK"));

        return expect(this.subject.authorize("invalid://cowtech.it")).to.be.rejected.then(error => {
          performStub.restore();

          expect(error.code).to.eq("ERRORED");
          expect(error.message).to.match(
            /The URL must be a valid HTTP\(s\) address or a clavem:\/\/ URL whose host is a platform recognized by Clavem \(.+\)\./
          );
        });
      });

      it("should handle success", function(done){
        class CustomPlatform extends BasePlatform{
          buildUrl(url){
            url.query.handled = true;
            return url;
          }

          handleResponse(req, callback){
            callback(null, "bar");
          }
        }

        Platforms.custom = CustomPlatform;

        const execStub = sinon.stub(childProcess, "exec", (command, cb) => cb(null));

        setTimeout(() => {
          chai.request(this.subject.express).get("/?custom_token=bar").end();
        }, 10);

        this.subject.authorize("clavem://a:b@custom", (error, token) => {
          execStub.restore();
          expect(execStub.calledWith("open \"clavem://a:b@custom?handled=true\"")).to.be.ok;

          expect(error).to.be.null;
          expect(token).to.eq("bar");

          done();
        });
      });

      it("should handle failures", function(done){
        class CustomPlatform extends BasePlatform{
          buildUrl(url){
            url.query.handled = true;
            return url;
          }

          handleResponse(req, callback){
            callback(new TypeError("UNAUTHORIZED"));
          }
        }

        Platforms.custom = CustomPlatform;

        const execStub = sinon.stub(childProcess, "exec");

        setTimeout(() => {
          chai.request(this.subject.express).get("/").end();
        }, 10);

        this.subject.authorize("clavem://a:b@custom", (error, token) => {
          execStub.restore();

          expect(error).to.be.instanceof(ClavemError);
          expect(error.code).to.eq("ERRORED");
          expect(error.message).to.eq("UNAUTHORIZED");
          expect(token).to.be.undefined;

          done();
        }).catch(() => false);
      });
    });
  });

  describe("._performRequest (private)", function(){
    beforeEach(function(){
      this.subject = new Clavem(`http://localhost:${port++}`);
    });

    it("should perform success callback", function(done){
      this.subject.command = "echo \"{{URL}}\"";
      const execSpy = sinon.spy(childProcess, "exec");

      this.subject._performRequest("http://cowtech.it", error => {
        execSpy.restore();

        expect(error).to.be.undefined;
        expect(execSpy.calledWith("echo \"http://cowtech.it\"")).to.be.ok;
        done();
      });
    });

    it("should perform failure callback", function(done){
      this.subject.command = "echo \"{{URL}}\"";
      const execStub = sinon.stub(childProcess, "exec", (command, cb) => cb(new RangeError("ERROR")));

      this.subject._performRequest("http://cowtech.it", error => {
        execStub.restore();

        expect(execStub.calledWith("echo \"http://cowtech.it\"")).to.be.ok;
        expect(error.code).to.eq("ERRORED");
        expect(error.message).to.eq("ERROR");
        done();
      }).catch(() => false);
    });
  });

  describe("._closeServer (private)", function(){
    beforeEach(function(){
      this.subject = new Clavem(`http://localhost:${port++}`);
    });

    it("should not do anything if no server was started ", function(){
      return expect(this.subject._closeServer(() => true)).to.become(undefined);
    });

    it("should close the server", function(done){
      this.subject.command = "echo \"{{URL}}\"";

      this.subject.authorize("http://cowtech.it", true);

      setTimeout(() => {
        const closeSpy = sinon.spy(this.subject.server, "close");

        this.subject._closeServer(error => {
          closeSpy.restore();
          expect(closeSpy.called).to.be.ok;
          expect(error).to.be.undefined;
          done();
        });
      }, 10);
    });
  });

  describe(".defaultHandler", function(){
    beforeEach(function(){
      this.subject = new Clavem(`http://localhost:${port++}`);
    });

    it("should accept if there is a oauth_token parameter", function(){
      this.subject.command = "echo \"{{URL}}\"";

      let response = null;
      const promise = this.subject.authorize("http://cowtech.it", true);

      setTimeout(() => {
        chai.request(this.subject.express).get("/?oauth_token=foo").end((error, r) => {
          response = r;
        });
      }, 10);

      return expect(promise).to.become("foo").then(function(){
        return new Promise(resolve => {
          setTimeout(function(){
            expect(response).to.have.status(200);
            expect(response).be.html;
            resolve();
          }, 10);
        });
      });
    });

    it("should reject all other cases", function(){
      this.subject.command = "echo \"{{URL}}\"";

      const promise = this.subject.authorize("http://cowtech.it", true);

      setTimeout(() => {
        chai.request(this.subject.express).get("/").end();
      }, 10);

      return expect(promise).to.be.rejected.then(error => {
        expect(error.code).to.eq("DENIED");
        expect(error.message).to.eq("Authorization denied by the platform.");
      });
    });
  });
});

/* eslint-enable no-unused-expressions, prefer-arrow-callback, no-undefined, no-magic-numbers */
