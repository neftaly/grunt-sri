/*
 * grunt-sri
 */

"use strict";

module.exports = function (grunt) {
    var tempFolder = "./tmp"; // Temporary folder for tests

    grunt.initConfig({
        "jslint": {
            all: {
                src: [
                    "Gruntfile.js",
                    "tasks/*.js",
                    "<%= mochaTest.tests %>"
                ],
                directives: {
                    node: true,
                    todo: true,
                    predef: [
                        "describe",
                        "it"
                    ]
                }
            }
        },

        "mochaTest": {
            "tests": ["test/*_test.js"]
        },

        // Test task
        "sri": {
            "single": ["test/fixtures/example.txt"],
            "multi": {
                "src": ["test/fixtures/example/*"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-jslint");
    grunt.loadNpmTasks("grunt-mocha-test");

    grunt.loadTasks("tasks"); // Load this project

    grunt.registerTask("prep", "Create temp folder", function () {
        if (grunt.file.exists(tempFolder)) {
            grunt.file.delete(tempFolder);
        }
        grunt.file.mkdir(tempFolder);
    });
    grunt.registerTask("clean", "Remove temp folder", function () {
        grunt.file.delete(tempFolder);
    });

    grunt.registerTask("test", [
        "prep",
        "sri",
        "mochaTest",
        "clean"
    ]);

    grunt.registerTask("default", ["jslint", "test"]);
};
