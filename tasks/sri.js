/*
 * grunt-sri
 */

"use strict";

var fs = require("fs"),
    async = require("async"),
    sriToolbox = require("sri-toolbox");

module.exports = function (grunt) {
    var generate,
        writeJson;


    generate = function (filePath, options, sriDataCallback) {
        options = {
            full: true,
            algorithms: options.algorithms
        };

        fs.readFile(filePath, function (err, data) {
            var output = sriToolbox.generate(options, data);
            output.type = output.type || null;
            output.path = filePath;
            sriDataCallback(err, output);
        });
    };


    writeJson = function (filePath, object, callback) {
        fs.writeFile(
            filePath,
            JSON.stringify(object),
            callback
        );
    };


    grunt.registerMultiTask("sri", "Generate SRI file hashes.", function () {
        var that = this,
            done = this.async(),
            options;

        options = this.options({
            "algorithms": grunt.option("algorithms") || ["sha256"],
            "dest": grunt.option("dest") || "./payload.json"
        });


        async.reduce(this.filesSrc, {},
            function (manifest, filePath, callback) {
                generate(filePath, options, function (err, sriData) {
                    manifest["@" + filePath] = sriData;
                    callback(err, manifest);
                });
            },
            function (err, manifest) {
                if (err) {
                    // Error generating SRI hashes
                    grunt.log.error("sri-gen: " + err);
                    return done(false);
                }
                writeJson(options.dest, { payload: manifest }, function (err) {
                    if (err) {
                        // Error writing JSON file
                        grunt.log.error("sri: " + err);
                        return done(false);
                    }
                    // Success
                    grunt.log.ok(
                        "Hashes generated for " + that.filesSrc.length + " " +
                            grunt.util.pluralize(
                                that.filesSrc.length,
                                "file/files"
                            )
                    );
                    return done();
                });
            });

    });

};
