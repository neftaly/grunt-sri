/*
 * grunt-sri
 */

"use strict";

var fs = require("fs"),
    async = require("async"),
    R = require("ramda"),
    sriToolbox = require("sri-toolbox"),

    grunt,

    fileList,
    generate,
    saveJson,
    writeLog,
    task;


R.dunder = R.__;


/**
 * Build a file list.
 *    Grunt is designed for many-to-one mapping,
 *    whereas we only ever want one-to-one mapping.
 */
fileList = R.reduce(function (fileProps, fileProp) {
    return R.concat(
        fileProps,
        // For each of the many, create one new entry
        fileProp.src.map(function (src) {
            return R.merge(fileProp, {
                id: "@" + (fileProp.id || src),
                src: src
            });
        })
    );
}, [], R.dunder);


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
        output.path = filePath;
        sriDataCallback(err, output);
    });
};


/**
 * Save object to to disk as JSON file
 */
saveJson = function (options, manifest, callback) {
    var writeJson = function (err, oldData) {
        var targetObj = {};

        // Seed targetObj with oldData, if appropriate
        if (err) {
            callback(err, oldData);
        } else if (!err && oldData) {
            targetObj = JSON.parse(oldData);
        }

        // Assign manifest to targetObj.targetProp, if appropriate
        if (options.targetProp) {
            targetObj[options.targetProp] = targetObj[options.targetProp] || {};
            targetObj[options.targetProp] = R.merge(targetObj[options.targetProp], manifest);
        } else {
            targetObj = R.merge(targetObj, manifest);
        }

        fs.writeFile(
            options.dest,
            JSON.stringify(targetObj, null, options.pretty ? 2 : 0),
            callback
        );
    };

    if (options.merge && grunt.file.exists(options.dest)) {
        fs.readFile(options.dest, { encoding: "utf8" }, writeJson);
    } else {
        writeJson();
    }
};


/**
 * Write status to STDOUT and end program
 *     * filesSrc & done should be pre-defined.
 *     * err should be supplied by saveJson.
 */
writeLog = R.curry(function (fileCount, done, err) {
    if (err) {
        // Error writing JSON file
        grunt.log.error("Error saving JSON: " + err);
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
        fileCount = this.filesSrc.length,
        options;

    options = this.options({
        "dest": grunt.option("dest") || "./payload.json",
        "merge": grunt.option("merge") || false,
        "algorithms": grunt.option("algorithms") || ["sha256", "sha512"],
        "targetProp": grunt.option("targetProp") || null
    });

    // Iterate through the file list
    async.reduce(
        fileList(this.files),
        {},

        // Build manifest using the "reduce to object" pattern
        function (manifest, file, callback) {
            generate(file.src, options, function (err, sriData) {
                // Make relative if a cwd is specified
                if (file.orig && file.orig.cwd) {
                    file.id = file.id.replace(file.orig.cwd, "");
                    sriData.path = sriData.path.replace(file.orig.cwd, "");
                }
                // Attach a property to the WIP manifest object
                manifest[file.id] = sriData;
                callback(err, manifest);
            });
        },

        // Process completed manifest and finish up
        function (err, manifest) {
            if (err) {
                // Error generating SRI hashes
                grunt.log.error("Error loading resource: " + err);
                return done(false);
            }

            saveJson(
                options,
                manifest,
                writeLog(fileCount, done)
            );
        }

    );
};


/**
 * Exports
 */
module.exports = function (gruntInstance) {
    // Make grunt globally accessible
    grunt = gruntInstance;

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
