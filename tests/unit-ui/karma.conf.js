'use strict';

module.exports = config => {

  config.set({
    frameworks: ['jasmine'],
    reporters: ['spec', 'kjhtml'],
    port: 9876,
    colors: true,
    client: {
      captureConsole: true
    },
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    browsers: ['Chrome', 'Firefox'],
    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,
    customLaunchers: {  
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    // // Continuous Integration mode
    // // if true, it capture browsers, run tests and exit
    singleRun: true,
    files: [
      'karma.shim.js',
      '../../node_modules/jquery/dist/jquery.min.js',
      '../../node_modules/angular/angular.js',
      '../../node_modules/angular-mocks/angular-mocks.js',
      '../../node_modules/underscore/underscore.js',
      '../../src/ui/app.js',
      '../../src/ui/services/*.js',
      './**/*-test.js'
    ]
  });
};
