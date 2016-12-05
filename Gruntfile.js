/*
 * grunt-sri
 */

"use strict";

module.exports = function (grunt) {
    /*
        General tasks
    */

    // Linting
    grunt.config("jshint", {
        all: [
            "Gruntfile.js",
            "tasks/*.js",
            "<%= mochaTest.tests %>"
        ],
        options: {
            jshintrc: ".jshintrc"
        }
    });

    // Test harness
    grunt.config("mochaTest", {
        "tests": ["test/*_test.js"]
    });

    grunt.loadTasks("tasks"); // Load this project
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.registerTask("default", ["test"]);


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

        // Create a second manifest with relative paths
        "cwd": {
            "options": {
                "dest": "./tmp/cwd.json"
            },
            "cwd": "test/fixtures/",
            "src": [
                "example/*",
                "example.txt"
            ],
            "expand": true
        },

        // Create a second manifest with custom settings
        "custom": {
            "options": {
                "algorithms": ["sha256"],
                "dest": "./tmp/sri-directives.json",
                "targetProp": "payload"
            },
            "files": [
                {
                    src: "test/fixtures/example/example.js",
                    id: "js1",
                    type: "application/javascript"
                },
                {
                    src: "test/fixtures/example/example.css",
                    type: "text/css"
                },
                {
                    src: "test/fixtures/example.txt",
                    id: "txt1"
                }
            ]
        },

        // Create a third manifest
        "merged-1": {
            "options": {
                "algorithms": ["sha256"],
                "dest": "./tmp/merged.json",
                "targetProp": "merged",
                "merge": true
            },
            "files": [
                {
                    src: "test/fixtures/example/example.js",
                    id: "part1",
                    type: "application/javascript"
                }
            ]
        },
        // Merge a separate result with the third manifest
        "merged-2": {
            "options": {
                "algorithms": ["sha256"],
                "dest": "./tmp/merged.json",
                "targetProp": "merged",
                "merge": true
            },
            "files": [
                {
                    src: "test/fixtures/example/example.js",
                    id: "part2"
                }
            ]
        },
        // Merge a separate targetProp-free result with the third manifest
        "merged-3": {
            "options": {
                "algorithms": ["sha512"],
                "dest": "./tmp/merged.json",
                "merge": true
            },
            "files": [
                {
                    src: "test/fixtures/example/example.js",
                    id: "part3"
                }
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
        "jshint",
        "prep",
        "sri",
        "mochaTest",
        "clean"
    ]);

};
