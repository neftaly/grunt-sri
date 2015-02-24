# grunt-sri [![Build Status](https://travis-ci.org/neftaly/grunt-sri.svg?branch=master)](https://travis-ci.org/neftaly/grunt-sri)
This tool generates a JSON manifest of [SRI](https://srihash.org/) data, to be served in HTML elements.

Once the DB has been generated, only the `_sri` property will be over-written. You can safely rename the identifier, set a custom `content-type`, or add custom properties.

The default DB path is `./sri-directives.json`. Pre-1.0.0, storing the manifest in `package.json` is not recommended.

```javascript
{
    "manifest": {

        ...

        "short_file_identifier": { // Defaults to the file path
            "content-type": "application/javascript",
            "path": "./relative/file/path",
            "_sri": { // Underscore denotes a computed property
                "sha256": "hash",
                "sha512": "hash",
                "integrity": "SRI hash"
            }
        }

        ...

    }
}
```

## SemVer
Minor releases < 1.0.0 will contain breaking changes.

A major release will be made after the W3C spec is finalized.

## Usage
Add the following to your `Gruntfile.js`:
```javascript
module.exports = function (grunt) {
    "use strict";

    grunt.loadNpmTasks("grunt-sri");
    
    grunt.initConfig({
        sri: {
            app: {
                options: {
                    algorithms: [
                        "sha256",
                        "sha512"
                    ]
                },
                src: [
                    "public/**/*.css"
                ],
                dest: "./sri-directives.json"
            },
        }
    });

    grunt.registerTask("default", ["sri"]);
};
```

Run the command `grunt`.

The file `sri-directives.json` will be produced:
```javascript
{
    "manifest": {
        "public/style.css": {
            "content-type": "text/css",
            "path": "public/style.css",
            "_sri": {
                "sha256": "XXXX",
                "sha512": "XXXXXXXX",
                "integrity": "type:text/css sha256-XXXX sha512-XXXXXXXX"
            }
        }
    }
}
```

## Using `sri-directives.json`
Data from the JSON file can be loaded directly into your markup.

##### Template Strings
```javascript
require ("better-require");
var manifest = require("./sri-directives.json").manifest;

var sri = function (identifier) {
    return manifest[identifier]._sri.integrity,
}

var html = `<link integrity="${ sri("public/style.css") }" href="/style.css" rel="stylesheet">`;
```

##### React
```javascript
require ("better-require");
var manifest = require("./sri-directives.json").manifest;

var sriLink = React.createClass({
    render: function () {
        var integrity = manifest[this.props.sri]._sri.integrity,
            href = this.props.href,
            rel = this.props.rel;
        return <link integrity={integrity} href={href} rel={rel}>;
    }
});

React.render(
    <sriLink sri="public/style.css" href="/style.css" rel="stylesheet" />,
    document.head // hopefully you're doing this server-side
);
```

##### Handlebars
The tool [handlebars-helper-sri](https://github.com/neftaly/handlebars-helper-sri) has been provided for use with Handlebars.

```html
<link integrity="{{sri "public/style.css"}}" href="/style.css" rel="stylesheet">
```
