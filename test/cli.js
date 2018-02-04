/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it, beforeEach */
/* eslint-disable no-unused-expressions, prefer-arrow-callback, no-undefined, no-magic-numbers */

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const expect = chai.expect;

const Clavem = require("../main");
const ClavemError = require("../lib/error");
const clavemCLI = require("../lib/cli");

chai.use(chaiAsPromised);

describe("CLI", function(){
  beforeEach(function(){
    this.cliMock = sinon.mock(Clavem.prototype);
    process.argv[2] = "http://google.it";
  });

  it("should correctly handle allowed authorizations", function(){
    const logStub = sinon.stub(console, "log");

    this.cliMock.expects("authorize").returns(Promise.resolve("TOKEN"));

    return expect(clavemCLI()).to.be.fulfilled.then(() => {
      this.cliMock.verify();
      logStub.restore();

      expect(logStub.calledWith("SUCCESS: Authorization succeded. The authorization token is: \"TOKEN\"")).to.be.ok;
    });
  });

  it("should correctly handle allowed authorizations in silent mode", function(){
    process.argv[2] = "-S";
    process.argv[3] = "http://google.it";

    const logStub = sinon.stub(console, "log");

    this.cliMock.expects("authorize").returns(Promise.resolve("TOKEN"));

    return expect(clavemCLI()).to.be.fulfilled.then(() => {
      this.cliMock.verify();
      logStub.restore();

      expect(logStub.calledWith("TOKEN")).to.be.ok;
    });
  });

  it("should correctly handle denied authorizations", function(){
    const errorStub = sinon.stub(console, "error");

    this.cliMock.expects("authorize").returns(Promise.reject(new ClavemError("denied")));

    return expect(clavemCLI()).to.be.rejected.then(error => {
      this.cliMock.verify();
      errorStub.restore();

      expect(error.code).to.equal("DENIED").to.be.ok;
      expect(errorStub.calledWith("ERROR: Authorization denied.")).to.be.ok;
    });
  });

  it("should correctly handle timeouts", function(){
    const errorStub = sinon.stub(console, "error");

    this.cliMock.expects("authorize").returns(Promise.reject(new ClavemError("timeout")));

    return expect(clavemCLI()).to.be.rejected.then(error => {
      this.cliMock.verify();
      errorStub.restore();

      expect(error.code).to.equal("TIMEOUT").to.be.ok;
      expect(errorStub.calledWith("ERROR: Authorization timed out.")).to.be.ok;
    });
  });

  it("should correctly handle authorization errors", function(){
    const errorStub = sinon.stub(console, "error");

    this.cliMock.expects("authorize").returns(Promise.reject(new ClavemError("other", "ERROR")));

    return expect(clavemCLI()).to.be.rejected.then(error => {
      this.cliMock.verify();
      errorStub.restore();

      expect(error.code).to.equal("OTHER").to.be.ok;
      expect(error.message).to.equal("ERROR").to.be.ok;
      expect(errorStub.calledWith("ERROR: Authorization failed due to an error - ERROR")).to.be.ok;
    });
  });

  it("should correctly handle unexpected errors", function(){
    const errorStub = sinon.stub(console, "error");

    this.cliMock.expects("authorize").throws(new TypeError("FOO"));

    return expect(clavemCLI()).to.be.rejected.then(() => {
      this.cliMock.verify();
      errorStub.restore();

      expect(errorStub.calledWith("ERROR: FOO")).to.be.ok;
    });
  });
});

/* eslint-enable no-unused-expressions, prefer-arrow-callback, no-undefined, no-magic-numbers */
