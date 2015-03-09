/*
 * grunt-sri
 */

"use strict";

var fs = require("fs"),
    async = require("async"),
    curry = require("curry"),
    sriToolbox = require("sri-toolbox"),

    fileList,
    generate,
    writeJson,
    writeLog,
    task;


/**
 * Build a file list.
 *    Required as Grunt is designed for many-to-one mapping,
 *    whereas we only ever want one-to-one mapping.
 */
fileList = function (filesArray, filesObj) {
    // Deal with "Files Array Format" Gruntfile
    var fileProps = Object.keys(filesObj).reduce(function (list, key) {
        var file = filesObj[key],
            src;
        if (file.src.length === 1) {
            src = file.src[0];
            if (list[src]) {
                throw new Error("Duplicate resource: " + src + ".");
            }
            list[src] = {
                "id": "@" + (file.id || src),
                "src": src,
                "type": file.type
            };
        }
        return list;
    }, {});

    // Deal with "Compact Format" Gruntfile
    return filesArray.map(function (src) {
        if (fileProps[src]) {
            return fileProps[src];
        }
        return {
            "src": src,
            "id": "@" + src
        };
    });
};


/**
 * Load file and generate hash from it
 */
generate = function (filePath, options, sriDataCallback) {
    options = {
        full: true,
        type: options.type,
        algorithms: options.algorithms
    };
    fs.readFile(filePath, function (err, data) {
        var output = sriToolbox.generate(options, data);
        if (!output.type) {
            output.type = null;
        }
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
writeLog = curry(function (grunt, fileCount, done, err) {
    if (err) {
        // Error writing JSON file
        grunt.log.error("Error writing file: " + err);
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
task = function (grunt) {
    var done = this.async(),
        fileCount = this.filesSrc.length,
        options;

    options = this.options({
        "algorithms": grunt.option("algorithms") || ["sha256", "sha512"],
        "dest": grunt.option("dest") || "./payload.json",
        "targetProp": grunt.option("targetProp") || null
    });

    // Iterate through the file list
    async.reduce(
        fileList(this.filesSrc, this.files),
        {},

        // Build manifest using the "reduce to object" pattern
        function (manifest, file, callback) {
            options.type = file.type;
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
                grunt.log.error("Error loading resource: " + err);
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
                writeLog(grunt, fileCount, done)
            );
        }

    );
};


/**
 * Exports
 */
module.exports = function (grunt) {
    // Attach Grunt task
    grunt.registerMultiTask(
        "sri",
        "Generate SRI file hashes.",
        function () {
            // registerMultiTask attaches a "this" context to this function,
            // so we need to pass it on to task
            return task.call(this, grunt);
        }
    );
};
