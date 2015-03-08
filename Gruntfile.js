/*
 * grunt-sri
 */

"use strict";

module.exports = function (grunt) {
    /*
        General tasks
    */

    // Linting
    grunt.config("jslint", {
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
    });

    // Test harness
    grunt.config("mochaTest", {
        "tests": ["test/*_test.js"]
    });

    grunt.loadTasks("tasks"); // Load this project
    grunt.loadNpmTasks("grunt-jslint");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.registerTask("default", ["jslint", "test"]);


    /*
        Module-test-specific tasks
    */

    grunt.config("sri", {
        // Create a manifest with the default settings
        "default": {
            "src": [
                "test/fixtures/example/*",
                "test/fixtures/example.txt"
            ]
        },

        // Create a second manifest with custom settings
        "custom": {
            "options": {
                "algorithms": ["sha256"],
                "dest": "./tmp/sri-directives.json",
                "targetProp": "payload"
            },
            "src": [
                "test/fixtures/example/*",
                "test/fixtures/example.txt"
            ]
        }
    });

    grunt.registerTask("prep", "Prepare for tests", function () {
        if (grunt.file.exists("./payload.json")) {
            grunt.file.delete("./payload.json");
        }
        if (grunt.file.exists("./tmp")) {
            grunt.file.delete("./tmp");
        }
        grunt.file.mkdir("./tmp");
    });

    grunt.registerTask("clean", "Cleanup after tests", function () {
        grunt.file.delete("./payload.json");
        grunt.file.delete("./tmp");
    });

    grunt.registerTask("test", [
        "prep",
        "sri",
        "mochaTest",
        "clean"
    ]);

};
