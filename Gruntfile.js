var fs = require('fs');
var glob = require('glob');
var exec = require('child_process').exec;
var sys = require('sys');
var colors = require('colors');
var execSync = require('execSync');
var uglifyjs = require('uglify-js');
var cleanCss = require('clean-css');
var mkdirp = require('mkdirp');
var path = require('path');
var rimraf = require('rimraf');
var crypto = require('crypto');
var xRegExp = require('xregexp').XRegExp;
var _ = require('lodash');
var timer = require("grunt-timer");

module.exports = function(grunt) {
  timer.init(grunt);
  var globalConfig = {
    webDirectory: 'dalek-web/web'
  };
  grunt.initConfig({
    globalConfig: globalConfig,
    build: {
      path: '<%= globalConfig.webDirectory %>',
      buildFileName: 'index.html',
      sourceFileName: 'index-dev.html',
      utFileName: 'index-ut.html',
      utJavascriptFiles: [
        'components/angular-mockable-http-provider/mockable-http-provider.js',
        'app/ui-testing.js'
      ]
    },
    watch: {
      sass: {
        files: [
          '<%= globalConfig.webDirectory %>/app/**/*.scss'
        ],
        tasks: ['sass'],
        options: {
          nospawn: true
        }
      }
    },
    sass: {
      dist: {
        files: {
          '<%= globalConfig.webDirectory %>/app/styles/main.css': [
            '<%= globalConfig.webDirectory %>/app/styles/main.scss'
          ]
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma/unit-tests.phantom.js'
      }
    },
    complexity: {
      //these value should ensure no error as these settings are just for reference (to compare maintainability of the difference piece of code)
      reference: {
        src: [
          '<%= globalConfig.webDirectory %>/app/application.js',
          '<%= globalConfig.webDirectory %>/app/misc/**/*.js',
          '<%= globalConfig.webDirectory %>/app/components/**/*.js',
          '<%= globalConfig.webDirectory %>/app/models/**/*.js'
        ],
        options: {
          errorsOnly: false, // show only maintainability errors
          cyclomatic: 1000,
          halstead: 1000,
          maintainability: 50
        }
      }
    },
      jshint: {
        all: {
          src: [
            '<%= globalConfig.webDirectory %>/app/application.js',
            '<%= globalConfig.webDirectory %>/app/misc/**/*.js',
            '<%= globalConfig.webDirectory %>/app/components/**/*.js',
            '<%= globalConfig.webDirectory %>/app/models/**/*.js'
          ],
          options: {
            bitwise: true, //prevent bitwise operations as they're usually not needed
            camelcase: true, //force variable/member name to be camelCased
            curly: true, //force curly braces around all conditionals
            eqeqeq: true, //for ===/!== instead of ==/!=
            es3: false, //we support ES5 and above, no need for this
            forin: true, //for in loops should make sure to filter items to not get prototype data
            immed: true, //immediate function invocations need to be wrapped in parentheses for readability
            indent: 2, //all application should should be indenting 2 spaces
            latedef: true, //make sure variables are define before use for readability
            newcap: true, //function constructors should be PascalCase
            noarg: true, //this is a work around for a problem that no longer exists
            noempty: true,
            nonew: false, //while we should prefer prototypal inheritance, I am no convince the there is no reason not to use function constructors
            plusplus: true, //just use += 1 or -= 1 for readability
            quotmark: false, //since sometimes you need either double or single quote inside the signle, both should be allowed to avoid havingt to escape
            undef: true, //there is on reason to use an undefined variable
            unused: false,
            strict: false, //not stardard enough to safely use I think
            trailing: true, //there is no reason to have a trailing space
            maxparams: 20, //set so high because of DI with angular can cause a lot of parameters but should never be more then 20
            maxdepth: 3, //more than 3 levels of depth for a function and we should look at refacting the code
            maxstatements: 40, //more than 40 statements per function and we should look at refactoring the code
            maxlen: 160, //line should be no longer than 160 characters
            asi: false, //we always want to show semi-solon warnings
            boss: false, //we always want to show warnings about assignments happening where comparisons are expected
            debug: false, //we should never have debugger code when linting code (which should only happen when building for for production)
            eqnull: false, //we want to show warnings where we have == null to make it more defined to prevent weird things from happening
            esnext: false, //we are not using ES6 code
            evil: false, //we should not be using eval
            expr: false, //we want to should warning where we have expressions and are expecting assignments/function calls
            funcscope: true, //we can declare variable anywhere we want, I don't think there is any real disadvantage (and ES6 is getting block level scope)
            globalstrict: true, //not sure what this is so let not worry about it
            iterator: false, //__iterator__ is not available in all browsers so it should not be used
            lastsemic: false, //we want to know about missing semi-colon everywhere they should be
            laxbreak: true, //allows line breaks anywhere you want
            laxcomma: false, //commas should never be at the beginning of the line,
            loopfunc: false, //this can help identifiy place where a closure need to be added to avoid bugs
            moz: false, //we are not using mozillajavascript extensions
            multistr: false, //there is no reasn for multi-lines strings
            proto: false, //sticking with what I think is the default
            scripturl: false, //sticking with what I think is the default
            smarttabs: false, //sticking with what I think is the default
            shadow: false, //sticking with what I think is the default
            sub: true, //allows array accessor where dot notation might be cleaner (obj['test'] vs obj.test)
            supernew: false, //sticking with what I think is the default
            validthis: true, //strict mode related so we don't need to warnings to show up

            //helps define some globals
            browser: true,
            jquery: true,

            globals: {
              //library/helper globals
              '_': false, // underscore's global
              'angular': false, // angular's global

              //testing globals
              'it': false,
              'expect': false,
              'describe': false,
              'beforeEach': false,
              'module': false,
              'inject': false
            }
          }
        }
      }
  });

  //load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-complexity');

  //this task will include everything in to to generate the final production version of the code
  grunt.registerTask('dist', ['jshint', 'sass', 'karma', 'build', 'complexity:reference']);

  //custom tasks
  grunt.registerTask('build', 'Builds a production version of your application', function() {
    //when deleting build files, lets not delete these
    var dontDeleteFiles = ['.svn', '.git', '.gitignore', '.gitkeep'];

    //we need to keep tracking of some meta data about the build files to be able to deteremine if we need to generate them
    var buildMetaDataFilePath = __dirname + '/build-meta-data.json';
    var currentBuildMetaData = {};
    var lastBuildMetaData = {};

    if(fs.existsSync(buildMetaDataFilePath)) {
      lastBuildMetaData = JSON.parse(fs.readFileSync(buildMetaDataFilePath, 'ascii'))
    }

    if(!currentBuildMetaData['workingFiles']) {
      currentBuildMetaData['workingFiles'] = {};
    }

    if(!lastBuildMetaData['workingFiles']) {
      lastBuildMetaData['workingFiles'] = {};
    }

    //lets cache all the files that have changed upfront
    var changedFiles = {};
    var changedFilesKeys = [];

    for(var resourcePath in lastBuildMetaData['workingFiles']) {
      if(
      lastBuildMetaData['workingFiles'][resourcePath]
      && getFileHash(resourcePath) !== lastBuildMetaData['workingFiles'][resourcePath].fileHash
      ) {
        changedFiles[resourcePath] = lastBuildMetaData['workingFiles'][resourcePath].compiledFilePath;
      }
    }

    changedFilesKeys = Object.keys(changedFiles);

    /**
     * Tells whether or not the any of the files in the list has a changed one
     *
     * @param files
     * @returns {*}
     */
    function hasChangedFile(files) {
      for(var file in files) {
        if(changedFilesKeys.indexOf(path.relative(__dirname, files[file])) !== -1) {
          return true;
        }
      }

      return false;
    }

    /**
     * Determines if the passed in files list is the same list of files used the last time the compiled files was generated
     *
     * @param originalFileName
     * @param files
     * @returns {boolean}
     */
    function hasSameFiles(originalFileName, files) {
      if(!lastBuildMetaData['buildFiles'] || !lastBuildMetaData['buildFiles'][originalFileName]) {
        return false;
      }

      for(var file in files) {
        if(lastBuildMetaData['buildFiles'][originalFileName].indexOf(path.relative(__dirname, files[file])) === -1) {
          return false
        }
      }

      return files.length === lastBuildMetaData['buildFiles'][originalFileName].length;


    }

    /**
     * Returns all the compiled files that used the files of files during the last build
     *
     * @param files
     * @returns {Array}
     */
    function getCompiledFiles(files) {
      var filePaths = [];

      for(file in files) {
        if(
        filePaths.indexOf(lastBuildMetaData['workingFiles'][path.relative(__dirname, files[file])]) === -1
        && lastBuildMetaData['workingFiles'][path.relative(__dirname, files[file])]
        ) {
          filePaths.push(lastBuildMetaData['workingFiles'][path.relative(__dirname, files[file])].compiledFilePath);
        }
      }

      return filePaths;
    }

    /**
     * Generates a sha1 hash of the contents of a files
     *
     * @param filePath
     * @returns {*}
     */
    function getFileHash(filePath) {
      var shasum = crypto.createHash('sha1');

      if(fs.existsSync(filePath)) {
        return shasum.update(fs.readFileSync(filePath, 'ascii')).digest('hex');
      } else {
        return false;
      }

    }

    /**
     * Adds meta data information for the build
     *
     * @param filePath
     * @param compiledFilePath
     * @param originalFileName
     */
    function addBuildMetaDataFile(filePath, compiledFilePath, originalFileName) {
      filePath = path.relative(__dirname, filePath);

      currentBuildMetaData['workingFiles'][filePath] = {
        //a hash of the file is probably a more accurate way of determine if the file has changed than last modified datetime
        fileHash: getFileHash(filePath),
        compiledFilePath: path.relative(__dirname, compiledFilePath)
      };

      if(!currentBuildMetaData['buildFiles']) {
        currentBuildMetaData['buildFiles'] = {};
      }

      if(!currentBuildMetaData['buildFiles'][originalFileName]) {
        currentBuildMetaData['buildFiles'][originalFileName] = [];

        if(lastBuildMetaData['buildFiles']) {
          lastBuildMetaData['buildFiles'][originalFileName] = [];
        }
      }

      currentBuildMetaData['buildFiles'][originalFileName].push(filePath);
    }

    function buildCssFiles(files, destinationFile) {
      function buildCompiledFile(files, destinationFile, originalFileName) {
        if(
        (!currentBuildMetaData['workingFiles'] || Object.keys(currentBuildMetaData['workingFiles']).length === 0)
        && (!lastBuildMetaData['workingFiles'] || Object.keys(lastBuildMetaData['workingFiles']).length === 0)
        && fs.existsSync(path.dirname(destinationFile))
        ) {
          var items = fs.readdirSync(path.dirname(destinationFile));

          for(var z = 0; z < items.length; z += 1) {
            if(dontDeleteFiles.indexOf(items[z]) === -1) {
              console.log(('removing file ' + path.dirname(destinationFile) + '/' + items[z]).yellow);
              rimraf.sync(path.dirname(destinationFile) + '/' + items[z]);
            }
          }
        }

        if(!fs.existsSync(path.dirname(destinationFile))) {
          mkdirp.sync(path.dirname(destinationFile));
        }

        files.forEach(function(filePath){
          addBuildMetaDataFile(filePath, destinationFile, originalFileName);
          console.log(('adding ' + filePath + ' to ' + destinationFile).green);
          source = fs.readFileSync(filePath, 'ascii');
          minSource = cleanCss.process(source);

          fs.appendFileSync(destinationFile, minSource, 'ascii');
        });
      };

      var shasum = crypto.createHash('sha1');
      var fileHashPrefix = shasum.update(new Date().getTime() + destinationFile).digest('hex');
      var source, minSource;
      var originalFileName = path.basename(destinationFile);

      //we want to add in a hash to the destination file name in order to make sure the browser redownloads the files on next update
      destinationFile = path.dirname(destinationFile) + '/' + fileHashPrefix + '-' + path.basename(destinationFile);

      var changedFile = hasChangedFile(files);
      var sameFiles = hasSameFiles(originalFileName, files);
      var compiledFiles = getCompiledFiles(files);

      if(changedFile || !sameFiles) {
        for(compiledFile in compiledFiles) {
          if(fs.existsSync(compiledFiles[compiledFile])) {
            console.log(('removing file ' + compiledFiles[compiledFile]).yellow);
            rimraf.sync(compiledFiles[compiledFile]);
          }
        }

        buildCompiledFile(files, destinationFile, originalFileName);
      } else if(!changedFile && sameFiles && !fs.existsSync(compiledFiles[0])) {
        buildCompiledFile(files, destinationFile, originalFileName);
      } else {
        destinationFile = compiledFiles[0];
      }

      return destinationFile;
    };

    function buildJavascriptFiles(files, destinationFile) {
      function buildCompiledFile(files, destinationFile, originalFileName) {
        if(
        (!currentBuildMetaData['workingFiles'] || Object.keys(currentBuildMetaData['workingFiles']).length === 0)
        && (!lastBuildMetaData['workingFiles'] || Object.keys(lastBuildMetaData['workingFiles']).length === 0)
        && fs.existsSync(path.dirname(destinationFile))
        ) {
          var items = fs.readdirSync(path.dirname(destinationFile));

          for(var z = 0; z < items.length; z += 1) {
            if(dontDeleteFiles.indexOf(items[z]) === -1) {
              console.log(('removing file ' + path.dirname(destinationFile) + '/' + items[z]).yellow);
              rimraf.sync(path.dirname(destinationFile) + '/' + items[z]);
            }
          }
        }

        files.forEach(function(filePath){
          addBuildMetaDataFile(filePath, destinationFile, originalFileName);
          console.log(('adding ' + filePath + ' to ' + destinationFile).green);
          source = fs.readFileSync(filePath, 'ascii');

          //lets just use the simple version for now
          //todo: think: look into more advance options at some point
          var minSource = uglifyjs.minify(source, {fromString: true});

          fs.appendFileSync(destinationFile, minSource.code, 'ascii');
        });
      };

      var shasum = crypto.createHash('sha1');
      var fileHashPrefix = shasum.update(new Date().getTime() + destinationFile).digest('hex');
      var parser = uglifyjs.parser;
      var uglify = uglifyjs.uglify;
      var source, minSource;
      var originalFileName = path.basename(destinationFile);

      //we want to add in a hash to the destination file name in order to make sure the browser redownloads the files on next update
      destinationFile = path.dirname(destinationFile) + '/' + fileHashPrefix + '-' + path.basename(destinationFile);
      var changedFile = hasChangedFile(files);
      var sameFiles = hasSameFiles(originalFileName, files);
      var compiledFiles = getCompiledFiles(files);

      if(changedFile || !sameFiles) {
        for(compiledFile in compiledFiles) {
          if(fs.existsSync(compiledFiles[compiledFile])) {
            console.log(('removing file ' + compiledFiles[compiledFile]).yellow);
            rimraf.sync(compiledFiles[compiledFile]);
          }
        }

        buildCompiledFile(files, destinationFile, originalFileName);
      } else if(!changedFile && sameFiles && !fs.existsSync(compiledFiles[0])) {
        buildCompiledFile(files, destinationFile, originalFileName);
      } else {
        destinationFile = compiledFiles[0];
      }

      return destinationFile;
    };

    function parseForBuildComments(htmlParserHandler) {
      var cssFiles = Object.create(null);
      var javascriptFiles = Object.create(null);
      var stack = htmlParserHandler.dom;
      var tracking = false;
      var trackingType = null;
      var currentFile = null;
      var temp = null;

      function traverse(element) {
        if(element.type === 'comment' || (tracking === true && (element.type === 'tag' || element.type === 'script'))) {
          if(element.type === 'comment') {
            if(element.raw.indexOf('START-CSS-MIN') !== -1) {
              temp = element.raw.split(':')[1].trim();

              /*if(temp.slice(0, 1) !== '/'){
               temp = '/' + temp;
               }*/

              currentFile = /*__dirname + '/' + applicationPath + */temp;

              if(cssFiles[currentFile] === undefined) {
                cssFiles[currentFile] = [];
              }

              tracking = true;
              trackingType = 'css';
            } else if(element.raw.indexOf('START-JS-MIN') !== -1) {
              temp = element.raw.split(':')[1].trim();

              /*if(temp.slice(0, 1) !== '/'){
               temp = '/' + temp;
               }*/

              currentFile = /*__dirname + '/' + applicationPath + */temp;

              if(javascriptFiles[currentFile] === undefined) {
                javascriptFiles[currentFile] = [];
              }

              tracking = true;
              trackingType = 'js';
            } else if(element.raw.indexOf('END-CSS-MIN') !== -1) {
              tracking = false;
              trackingType = null;
            } else if(element.raw.indexOf('END-JS-MIN') !== -1) {
              tracking = false;
              trackingType = null;
            }
          } else {
            if(tracking === true) {
              if(trackingType === 'css') {
                if(element.attribs.href.slice(0, 1) !== '/'){
                  element.attribs.href = '/' + element.attribs.href;
                }
                cssFiles[currentFile].push(__dirname + '/' + applicationPath + element.attribs.href);
              } else {
                if(element.attribs.src.slice(0, 1) !== '/'){
                  element.attribs.src = '/' + element.attribs.src;
                }
                javascriptFiles[currentFile].push(__dirname + '/' + applicationPath +  element.attribs.src);
              }
            }
          }
        }

        if (element.children) {
          element.children.forEach(traverse);
        }
      };

      stack.forEach(traverse);

      return {
        cssFiles: cssFiles,
        javascriptFiles: javascriptFiles
      }
    };

    var applicationPath = grunt.config.get('build').path;
    var applicationAbsolutePath = __dirname + '/' + applicationPath;
    var buildIndexFilePath = applicationAbsolutePath + '/' + grunt.config.get('build').buildFileName;
    var sourceIndexFilePath = applicationAbsolutePath + '/' + grunt.config.get('build').sourceFileName;
    var htmlparser = require("htmlparser");
    var rawHtml = fs.readFileSync(sourceIndexFilePath, 'ascii');

    var handler = new htmlparser.DefaultHandler(function (error, dom) {
      if (error) {
        console.log(error.red);
      }
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);
    filesToBuild = parseForBuildComments(handler);

    for(var desinationFile in filesToBuild.cssFiles) {
      var regexp = xRegExp('<!-- START-CSS-MIN:' + desinationFile.replace(applicationAbsolutePath + '/', '') + ' -->(.*?)<!-- END-CSS-MIN -->', 's');
      var text = xRegExp.exec(rawHtml, regexp);

      if(text) {
        text = text[0];
        var newFileName = buildCssFiles(filesToBuild.cssFiles[desinationFile], applicationPath + '/' + desinationFile);
        rawHtml = rawHtml.replace(text, '<link type="text/css" rel="stylesheet" href="' + newFileName.replace(applicationPath + '/', '') + '">');
      }
    }

    for(var desinationFile in filesToBuild.javascriptFiles) {
      var regexp = xRegExp('<!-- START-JS-MIN:' + desinationFile.replace(applicationAbsolutePath + '/', '') + ' -->(.*?)<!-- END-JS-MIN -->', 's');
      var text = xRegExp.exec(rawHtml, regexp);

      if(text) {
        text = text[0];
        var newFileName = buildJavascriptFiles(filesToBuild.javascriptFiles[desinationFile], applicationPath + '/' + desinationFile);
        rawHtml = rawHtml.replace(text, '<script type="text/javascript" src="' + newFileName.replace(applicationPath + '/', '') + '"></script>');
      }
    }

    console.log(('writing out ' + buildIndexFilePath + ' file').green);
    fs.writeFileSync(buildIndexFilePath, rawHtml, 'ascii');

    //if we have gotten here then it is safe to write the new build meta data file
    currentBuildMetaData = _.merge(lastBuildMetaData, currentBuildMetaData);
    console.log(('writing out build meta data file ' + buildMetaDataFilePath).green);
    fs.writeFileSync(buildMetaDataFilePath, JSON.stringify(currentBuildMetaData, null, 2), 'ascii');
  });

  //todo: this should just be a different target for the main build task
  grunt.registerTask('build-ut', 'Builds a UI testing version of your application', function() {
    var applicationPath = grunt.config.get('build').path;
    var applicationAbsolutePath = __dirname + '/' + applicationPath;
    var buildIndexFilePath = applicationAbsolutePath + '/' + grunt.config.get('build').utFileName;
    var sourceIndexFilePath = applicationAbsolutePath + '/' + grunt.config.get('build').sourceFileName;
    var htmlparser = require("htmlparser");
    var rawHtml = fs.readFileSync(sourceIndexFilePath, 'ascii');

    var handler = new htmlparser.DefaultHandler(function (error, dom) {
      if (error) {
        console.log(error.red);
      }
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);

    var regexp = xRegExp('<!-- UT-INCLUDE -->', 's');
    var text = xRegExp.exec(rawHtml, regexp);
    var utReplace = '';

    if(text) {
      text = text[0];

      grunt.config.get('build').utJavascriptFiles.forEach(function(filePath) {
        utReplace += '<script type="text/javascript" src="' + filePath + '"></script>\n';
      });

      rawHtml = rawHtml.replace(text, utReplace);
    }
    rawHtml = rawHtml.replace('app/components/core/constants.js', 'app/components/core/constants-ut.js');

    console.log(('writing out ' + buildIndexFilePath + ' file').green);
    fs.writeFileSync(buildIndexFilePath, rawHtml, 'ascii');
  });
};