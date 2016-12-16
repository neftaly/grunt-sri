# grunt-sri

[![Build Status](https://travis-ci.org/neftaly/grunt-sri.svg?branch=master)](https://travis-ci.org/neftaly/grunt-sri)
[![Dependencies Status](https://david-dm.org/neftaly/grunt-sri.svg)](https://david-dm.org/neftaly/grunt-sri)
[![Dev Dependencies Status](https://david-dm.org/neftaly/grunt-sri/dev-status.svg)](https://david-dm.org/neftaly/grunt-sri#info=devDependencies)

This tool generates a JSON manifest of file hashes & [sub-resource integrity](https://srihash.org/) data.


## Install

```shell
npm install --save-dev grunt-sri
```


## Usage

Add the following to your `Gruntfile.js`:

```js
module.exports = function (grunt) {
    "use strict";

    grunt.loadNpmTasks("grunt-sri");

    grunt.initConfig({
        "sri": {

            // Use the default settings for *everything* in ./public/css
            "bobsDefaultTask": {
                "src": [
                    "public/**/*.css"
                ]
            },

            // Create a second manifest with custom settings
            "janesCustomTask": {
                "options": {
                    "algorithms": ["sha256"],
                    "dest": "./public/sri-directives.json",
                    "targetProp": "payload"
                },
                "files": [
                    {
                        src: "public/css/example.css",
                        type: "text/css",
                        id: "cssfile1"
                    },
                    {
                        src: "public/css/other.css"
                    }
                ]
            }

        }

    });

    grunt.registerTask("default", ["sri"]);
};
```

Run the command `grunt`. The manifest file will be created.


## Options

* String **dest**: Target JSON file.  
  Default `"./payload.json"`
* Boolean **merge**: Merge results with existing JSON file.  
  Default `false` (overwrite)
* Array **algorithms**: List of desired hash algorithms.  
  Default `["sha256", "sha512"]`
* String **targetProp**: Target JS object property name.  
  Default `null`
* Boolean **pretty**: Stringify the JSON output in a pretty format.  
  Default `false`


## Manifest

Metadata is stored in JSON format.

* The default manifest dest is `./payload.json`.
* File paths are relative to the CWD of Grunt.  
  This should be the project root.
* File identifiers are prefixed with the "@" symbol.  
  If no ID is specified, the path will be used.

Example:

```json
{
    "@cssfile1": {
        "path": "public/css/example.css",
        "type": "text/css",
        "integrity": "type:text/css sha256-XXXX sha512-XXXXXXXX",
        "hashes": {
            "sha256": "XXXX",
            "sha512": "XXXXXXXX"
        }
    }
}
```

### Implementation

Data from the manifest can be loaded into markup.
Use the `integrity` property for SRI integrity attributes, a hash from `hashes` as a URL parameter for client-side caching, etc.

#### PHP

```php
// In production, consider compiling JSON to PHP assoc arrays
$payload = json_decode(file_get_contents("./payload.json"), true);
$sri = function (id) {
    return $payload["payload"][id];
}

$element = "<link
    href='/style.css?cache={ sri("@cssfile1")["hashes"]["sha256"] }'
    integrity='{ $sri("@cssfile1")["integrity"] }'
    rel='stylesheet'>";
```

#### JavaScript

**Note:** Node apps should use [subresource](https://github.com/neftaly/npm-subresource) or [handlebars-helper-sri](https://github.com/neftaly/handlebars-helper-sri), which don't require a build step.

```js
// ES6
var payload = require("./payload.json");
var sri = (id) => payload.payload[id];

var element = `<link
    href='/style.css?cache=${ sri("@cssfile1").hashes.sha256 }'
    integrity='${ sri("@cssfile1").integrity }'
    rel='stylesheet'>`;
```


## SemVer

This tool follows SemVer from v0.1.0, as [SRI is now a W3C recommendation](https://www.w3.org/TR/SRI/).

Changes to the V1 SRI spec will be tracked with minor releases.
