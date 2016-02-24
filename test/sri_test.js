/* jshint mocha: true */

"use strict";

var assert = require("assert"),
    grunt = require("grunt"),
    fs = require("fs"),

    readJson = function (path) {
        return JSON.parse(
            fs.readFileSync(path, { encoding: "utf8" })
        );
    };


describe("default: payload.json", function () {
    var path = "./payload.json";

    it("File exists", function () {
        var expect = true,
            result = grunt.file.exists(path);
        assert.equal(expect, result);
    });

    it("Valid data", function () {
        var expect = require("./expect/default.json"),
            result = readJson(path);
        assert.deepEqual(expect, result);
    });

});


describe("custom: sri-directives.json", function () {
    var path = "./tmp/sri-directives.json";

    it("File exists", function () {
        var expect = true,
            result = grunt.file.exists(path);
        assert.equal(expect, result);
    });

    it("Valid data", function () {
        var expect = require("./expect/custom.json"),
            result = readJson(path);
        assert.deepEqual(expect, result);
    });

});


describe("custom merged: merged.json", function () {
    var path = "./tmp/merged.json";

    it("File exists", function () {
        var expect = true,
            result = grunt.file.exists(path);
        assert.equal(expect, result);
    });

    it("Valid data", function () {
        var expect = require("./expect/merged.json"),
            result = readJson(path);
        assert.deepEqual(expect, result);
    });

});
