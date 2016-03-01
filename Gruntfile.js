module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  var userConfig = require( './build.config.js' );

  var config = {
    clean: {
      init: [ 'bin' ],
      temp: [ 'temp' ]
    },

    dom_munger: {
      dist: {
        options: {
          read: [{
            selector: 'script.application-dependency',
            attribute: 'src',
            writeto: 'vendorJSRefs',
            isPath: true
          }, {
            selector: 'script.application-src',
            attribute: 'src',
            writeto: 'appJSRefs',
            isPath: true
          }]
        },
        src: 'client/index.html',
        dest: 'bin/index.html'
      }
    },

    jshint: {
      src: [
        '<%= dom_munger.data.appJSRefs %>'
      ]
    },

    html2js: {
      app: {
        options: {
          base: 'client/src'
        },
        src: [ '<%= app.html %>' ],
        dest: 'bin/assets/app-templates.js'
      }
    },

    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      compile: {
        files: {
          'temp/wait-times.js': [ 'temp/wait-times.js' ]
        }
      }
    },

    concat: {
      app: {
        src: [ '<%= dom_munger.data.appJSRefs %>' ],
        dest: 'temp/wait-times.js'
      },
      vendor: {
        src: [ '<%= dom_munger.data.vendorJSRefs %>' ],
        dest: 'temp/wait-times-vendor.js'
      }
    },

    uglify: {
      options: {
        sourceMap: true,
        sourceMapName: 'bin/assets/wait-times.map'
      },
      dist: {
        files: {
          'bin/assets/wait-times-vendor.js' : [ 'temp/wait-times-vendor.js' ],
          'bin/assets/wait-times.js' : [ 'temp/wait-times.js' ]
        }
      }
    },

    delta: {
      tpls: {
        files: [ '<%= app.html %>'],
        tasks: [ 'html2js' ]
      },

      js: {
        files: [ '<%= dom_munger.data.appJSRefs %>' ],
        tasks: [ 'dom_munger', 'jshint:src' ]
      },

      index: {
        files: [ 'client/index.html' ],
        tasks: [ 'dom_munger' ]
      }
    }
  };

  grunt.initConfig( grunt.util._.extend( config, userConfig ) );

  grunt.registerTask('build', [
    'clean:init',
    'dom_munger',
    'jshint',
    'html2js'
  ]);

  grunt.registerTask('asdf', 'foo foo', function() {
    grunt.log.writeln(JSON.stringify(config.dom_munger.data.vendorJSRefs));
    grunt.log.writeln(JSON.stringify(config.dom_munger.data.appJSRefs));
  });

  grunt.registerTask('default', [
    'clean:init',
    'clean:temp',
    'dom_munger:dist',

    'asdf',

    'jshint',
    'html2js',
    'concat:app',
    'concat:vendor',
    'ngAnnotate',
    'uglify:dist',
    'clean:temp'
  ]);

  grunt.renameTask('watch', 'delta');
  grunt.registerTask('watch', [
    'build',
    'delta'
  ]);
};