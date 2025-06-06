// Karma configuration file
// Configuración de pruebas unitarias para el frontend Angular
// Desarrollado por Juan José Ariza V.

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        // Configuración adicional de Jasmine
        random: true, // Ejecutar pruebas en orden aleatorio
        seed: '12345', // Semilla para orden aleatorio
        failSpecWithNoExpectations: true // Fallar specs sin expectations
      }
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/products-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' }, // Reporte HTML para navegador
        { type: 'text-summary' }, // Resumen en consola
        { type: 'lcov' }, // Para integración con herramientas CI/CD
        { type: 'cobertura' } // Para integración con Jenkins/Azure DevOps
      ],
      check: {
        global: {
          statements: 80, // 80% de statements cubiertos
          branches: 75,   // 75% de branches cubiertos
          functions: 80,  // 80% de funciones cubiertas
          lines: 80       // 80% de líneas cubiertas
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
    
    // Configuración para CI/CD
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-web-security',
          '--disable-gpu',
          '--remote-debugging-port=9222'
        ]
      }
    },
    
    // Configuración de archivos
    files: [
      // Archivos adicionales si es necesario
    ],
    
    // Configuración de preprocesadores
    preprocessors: {
      // Configuración automática por Angular CLI
    },
    
    // Configuración de timeout
    browserNoActivityTimeout: 60000, // 60 segundos
    captureTimeout: 60000,
    
    // Configuración para desarrollo
    webpack: {
      // Configuración adicional de webpack si es necesaria
    }
  });
  
  // Configuración específica para CI
  if (process.env.CI) {
    config.browsers = ['ChromeHeadlessCI'];
    config.singleRun = true;
    config.autoWatch = false;
    console.log('Configuración de Karma para CI activada - Juan José Ariza V.');
  } else {
    console.log('Configuración de Karma para desarrollo activada - Juan José Ariza V.');
  }
}; 