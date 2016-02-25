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
          },
          prefix: {
            selector:'script.application-src',
            attribute:'src',
            value:'/client/'
          },
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
    'clean',
    'dom_munger',
    'jshint',
    'html2js'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

  grunt.renameTask('watch', 'delta');
  grunt.registerTask('watch', [
    'build',
    'delta'
  ]);
};