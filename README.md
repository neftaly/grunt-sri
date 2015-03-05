# grunt-sri

[![Build Status](https://travis-ci.org/neftaly/grunt-sri.svg?branch=master)](https://travis-ci.org/neftaly/grunt-sri)
[![Dependencies Status](https://david-dm.org/neftaly/npm-subresource.svg)](https://david-dm.org/mozilla/srihash.org)
[![Dev Dependencies Status](https://david-dm.org/neftaly/npm-subresource/dev-status.svg)](https://david-dm.org/mozilla/srihash.org#info=devDependencies)

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
        sri: {
            app: {
                options: {
                    algorithms: [
                        "sha256", // Default
                        "sha512"
                    ]
                },
                src: [
                    "public/**/*.css"
                ],
                dest: "./payload.json" // Default
            },
        }
    });

    grunt.registerTask("default", ["sri"]);
};
```

Run the command `grunt`. The manifest file will be created.



## Manifest
Metadata is stored in JSON format.

* The default manifest dest is `./payload.json`.
* File paths are relative to the CWD of Grunt.  
  This should be the project root.
* File identifiers are prefixed with the "@" symbol.  
  Custom identifiers & groups are planned for future release.

ID prefixes and the `payload` property are used for forward-compatibility.

Example:
```json
{
    "payload": {
        "@public/style.css": {
            "path": "./public/style.css",
            "type": null,
            "integrity": "sha256-XXXX sha512-XXXXXXXX",
            "hashes": {
                "sha256": "XXXX",
                "sha512": "XXXXXXXX",
            }
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
    href='/style.css?cache={ sri("@public/style.css")["hashes"]["sha256"] }'
    integrity='{ sri("@public/style.css")["integrity"] }'
    rel='stylesheet'>";
```

#### Javascript
**Note:** Node apps should use [subresource](https://github.com/neftaly/npm-subresource) or [handlebars-helper-sri](https://github.com/neftaly/handlebars-helper-sri), which don't require a build step.

```js
// ES6
var payload = require("./payload.json");
var sri = (id) => payload.payload[id];

var element = `<link
    href='/style.css?cache=${ sri("@public/style.css").hashes.sha256 }'
    integrity='${ sri("@public/style.css").integrity }'
    rel='stylesheet'>`;
```



## SemVer
This tool follows SemVer from v0.1.0, however it is important to note that the [SRI](http://www.w3.org/TR/SRI) spec is still in draft.

Changes to the V1 SRI spec will be tracked with minor releases.
