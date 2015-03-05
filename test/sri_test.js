"use strict";

var assert = require("assert");
var grunt = require("grunt");

describe("Default: sri-directives.json", function () {
    var path = "./tmp/sri-directives.json";

    it("File exists", function () {
        var expect = true,
            result = grunt.file.exists(path);
        assert.equal(expect, result);
    });

    it("Valid data", function () {
        var expect = require("./expect/default.json"),
            result = require(path);
        assert.deepEqual(expect, result);
    });

});
