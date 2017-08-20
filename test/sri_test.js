/* eslint-env mocha */

"use strict";

var assert = require("assert"),
    grunt = require("grunt"),
    path = require("path");


describe("default: payload.json", function () {
    var testFile = "./payload.json";

    it("File exists", function () {
        var expect = true,
            result = grunt.file.exists(testFile);
        assert.equal(expect, result);
    });

    it("Valid data", function () {
        var expect = grunt.file.readJSON(path.join(__dirname, "./expect/default.json")),
            result = grunt.file.readJSON(testFile);
        assert.deepEqual(expect, result);
    });

});

describe("custom:cwd", function () {
    var testFile = "./tmp/cwd.json";

    it("File exists", function () {
        var expect = true,
            result = grunt.file.exists(testFile);
        assert.equal(expect, result);
    });

    it("Valid data", function () {
        var expect = grunt.file.readJSON(path.join(__dirname, "./expect/cwd.json")),
            result = grunt.file.readJSON(testFile);
        assert.deepEqual(expect, result);
    });

});


describe("custom: sri-directives.json", function () {
    var testFile = "./tmp/sri-directives.json";

    it("File exists", function () {
        var expect = true,
            result = grunt.file.exists(testFile);
        assert.equal(expect, result);
    });

    it("Valid data", function () {
        var expect = grunt.file.readJSON(path.join(__dirname, "./expect/custom.json")),
            result = grunt.file.readJSON(testFile);
        assert.deepEqual(expect, result);
    });

});


describe("custom merged: merged.json", function () {
    var testFile = "./tmp/merged.json";

    it("File exists", function () {
        var expect = true,
            result = grunt.file.exists(testFile);
        assert.equal(expect, result);
    });

    it("Valid data", function () {
        var expect = grunt.file.readJSON(path.join(__dirname, "./expect/merged.json")),
            result = grunt.file.readJSON(testFile);
        assert.deepEqual(expect, result);
    });

});
