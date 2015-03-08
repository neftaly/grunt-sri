/*
 * grunt-sri
 */

"use strict";

var fs = require("fs"),
    async = require("async"),
    curry = require("curry"),
    sriToolbox = require("sri-toolbox");

module.exports = function (grunt) {
    var generate,
        writeJson,
        writeLog,
        task;

    /**
     * Load file and generate hash from it
     */
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


    /**
     * Save JSON file to disk
     */
    writeJson = function (filePath, object, callback) {
        fs.writeFile(
            filePath,
            JSON.stringify(object),
            callback
        );
    };


    /**
     * Write status to STDOUT and end program
     *     * filesSrc & done should be pre-defined.
     *     * err should be supplied by writeJson.
     */
    writeLog = curry(function (fileCount, done, err) {
        if (err) {
            // Error writing JSON file
            grunt.log.error("sri: " + err);
            return done(false);
        }
        // Success
        grunt.log.ok(
            "Hashes generated for " + fileCount + " " +
                grunt.util.pluralize(fileCount, "file/files")
        );
        return done();
    });


    /**
     * Main Grunt task
     */
    task = function () {
        var done = this.async(),
            options,
            files;

        options = this.options({
            "algorithms": grunt.option("algorithms") || ["sha256", "sha512"],
            "dest": grunt.option("dest") || "./payload.json",
            "targetProp": grunt.option("targetProp") || null
        });

        // Build a file list.
        // Required as Grunt is designed for many-to-one mapping,
        // whereas we only ever want one-to-one mapping.
        files = this.filesSrc.map(function (src) {
            return {
                src: src,
                id: "@" + src
            };
        });

        // Iterate through the file list
        async.reduce(
            files,
            {},

            // Build manifest using the "reduce to object" pattern
            function (manifest, file, callback) {
                generate(file.src, options, function (err, sriData) {
                    // Attach a property to the WIP manifest object
                    manifest[file.id] = sriData;
                    callback(err, manifest);
                });
            },

            // Process completed manifest and finish up
            function (err, manifest) {
                var targetObj = {};

                if (err) {
                    // Error generating SRI hashes
                    grunt.log.error("sri-gen: " + err);
                    return done(false);
                }

                // Assign manifest to targetObj.targetProp, if appropriate
                if (options.targetProp) {
                    targetObj[options.targetProp] = manifest;
                } else {
                    targetObj = manifest;
                }

                writeJson(
                    options.dest,
                    targetObj,
                    writeLog(files.length, done)
                );
            }

        );
    };


    grunt.registerMultiTask("sri", "Generate SRI file hashes.", task);
};
