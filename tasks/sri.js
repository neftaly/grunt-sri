/*
 * grunt-sri
 */

"use strict";

module.exports = function (grunt) {

    function sri(filepath, options) {
        /* // error
        //grunt.verbose.error();
        grunt.log.error();
        grunt.fail.warn("Option not allowed.");
        return false;
        */
        return filepath + " " + options;
    }

    grunt.registerMultiTask("sri", "Generate SRI file hashes.", function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            "force": grunt.option("force") === true
        });

        // hash specified file
        this.filesSrc.forEach(function (filepath) {
            sri(filepath, options);
        });
        grunt.log.ok(
            this.filesSrc.length + " " +
                grunt.util.pluralize(this.filesSrc.length, "path/paths") +
                " hashed."
        );
    });

};
