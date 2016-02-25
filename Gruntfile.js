module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  var userConfig = require( './build.config.js' );

  var config = {
    clean: [ 'bin' ],

    dom_munger: {
      main: {
        options: {
          read: {
            selector: 'script.application-src',
            attribute: 'src',
            writeto: 'appJSRefs',
            isPath: true
          }
        },
        src: 'client/index.html'
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

    delta: {
      tpls: {
        files: [ '<%= app.html %>'],
        tasks: [ 'html2js' ]
      },
      
      js: {
        files: [ '<%= dom_munger.data.appJSRefs %>' ],
        tasks: [ 'dom_munger', 'jshint:src' ]
      }
    }
  };

  grunt.initConfig( grunt.util._.extend( config, userConfig ) );

  grunt.registerTask('default', [
    'clean',
    'html2js'
  ]);

  grunt.registerTask('build', [
    'clean',
    'dom_munger',
    'jshint',
    'html2js'
  ]);

  grunt.renameTask('watch', 'delta');
  grunt.registerTask('watch', [
    'build',
    'delta'
  ]);
};