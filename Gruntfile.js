module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  var userConfig = require( './build.config.js' );

  var config = {
    clean: [ 'bin' ],

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
    'html2js'
  ]);

  grunt.renameTask('watch', 'delta');
  grunt.registerTask('watch', [
    'build',
    'delta'
  ]);

};