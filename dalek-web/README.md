# AngularJS/ExpressJS Seed #

This is a seed for an AngularJS and ExpressJS application.  This setup should allow you to get an application quickly up a running all locally (no need for a vm to emulate a server) with a computer that has node with AngularJS for the front-end and ExpressJS as the middle/back-end.

## Setup ##

* Download the repository
* Make sure you have the following npm packages installed globally:
    * grunt-cli
    * bower
    * karma (if you want you do test, and you SHOULD)
* Run the commands npm install && bower install
* Go to the web folder and run node app-dev.js or node app.js (make sure to to run grunt build first in order to build the index.html that app.js uses)

## What Does It Have ##

Here is what is included so far.  Since I have not created many AngularJS application and so far nothing really complex/large, I will probably be make updates as I progress with my large side project I am working on which uses AngularJS heavily.

* Includes a basic structure for angular applications that have worked for me
* This uses Grunt and Bower for a lot of the work
* Includes a number of custom grunt commands (will look into using existing grunt plugins or converting my commands to plugins at some point)

### Apache ###

There is also an example vhost config and a .htaccess files included in this package incase you want to run apache instead of ExpressJS.

## Grunt ##

The Gruntfile.js include the grunt-contrib-watch (automatically watches .scss files in web/app) and grunt-contrib-sass to compile scss files.  There are also a few of custom grunt commands included in this:

* build - Builds a productions version of you html file (might change to build a production version of the web folder but still thinking about that)
* ts - Compiles TypeScript files into JavaScript files (requires the node TypeScript module), works with watch (has not been tested for a while, right remove)

## License ##

MIT
