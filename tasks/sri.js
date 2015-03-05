/*
 * grunt-sri
 */

"use strict";

var fs = require("fs"),
    sriToolbox = require("sri-toolbox");

module.exports = function (grunt) {

    function generate(filePath, options) {
        var data,
            output;

        /*
        //grunt.verbose.error();
        grunt.log.error();
        grunt.fail.warn("Option not allowed.");
        return false;
        */

        /*jslint stupid:true */
        // TODO: async
        data = fs.readFileSync(filePath);
        /*jslint stupid:false */

        output = sriToolbox.generate({
            full: true,
            algorithms: options.algorithms
        }, data);

        // TODO: have sriToolbox generate "null" for undefined types
        output.type = output.type || null;

        return output;
    }

    grunt.registerMultiTask("sri", "Generate SRI file hashes.", function () {
        var options,
            manifest;

        options = this.options({
            "algorithms": grunt.option("algorithms") || ["sha256"],
            "dest": grunt.option("dest") || "./payload.json"
        });

        manifest = {};
        this.filesSrc.forEach(function (filePath) {
            var id = "@" + filePath;
            manifest[id] = generate(filePath, options);
            manifest[id].path = filePath;
        });

        fs.writeFile(
            options.dest,
            JSON.stringify({ payload: manifest }),
            function (err) {
                if (err) {
                    grunt.log.error("sri: " + err);
                    grunt.log.writeln();
                    return false;
                }
                return grunt.log.ok(
                    this.filesSrc.length + " " +
                        grunt.util.pluralize(this.filesSrc.length, "path/paths") +
                        " hashed."
                );
            }
        );
    });

};
