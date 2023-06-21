export default {
  source: ['src/design/temp/*.json'],
  platforms: {
    'web/js': {
      transforms: ['attribute/cti', 'name/cti/pascal', 'size/rem', 'color/hex', 'uppercaseregions'],
      buildPath: 'src/lib/styles/',
      files: [
        {
          destination: 'tokens.es6.js',
          format: 'javascript/es6'
        }
      ]
    },
    'web/css': {
      transforms: ['attribute/cti', 'name/cti/kebab', 'time/seconds', 'content/icon', 'size/rem', 'color/css', 'unit', 'uppercaseregions'],
      buildPath: 'src/lib/styles/',
      files: [
        {
          destination: '_variables.css',
          format: 'css/variables'
        }
      ]
    }
  }
};
