import StyleDictionary from 'style-dictionary';
import config from '../style-dictionary.config.js';

console.log(config);

StyleDictionary.extend(config)
  .registerTransform({
    type: 'value',
    transitive: false,
    name: 'unit',
    matcher: (token) => {
      return true;
    },
    transformer: (token) => {
      const defaultUnits = {
        sizing: 'px',
        spacing: 'px',
        paragraphSpacing: 'px',
        fontSizes: 'px',
        letterSpacing: 'em'
      };
      if (token.original.type === 'letterSpacing') {
        return +token.original.value.replace('%', '') / 100 + 'em';
      } else if (token.original.type === 'fontWeights') {
        switch (token.original.value) {
          case 'Regular':
            return '400';
          case 'Bold':
            return '700';
          case 'SemiBold':
            return '600';
          case 'Light':
            return '300';
          case 'ExtraLight':
            return '200';
          case 'Thin':
            return '100';
          case 'Medium':
            return '500';
          case 'ExtraBold':
            return '800';
          case 'Black':
            return '900';
          case 'ExtraBlack':
            return '950';
          case 'Italic':
            return 'italic';
          default:
            return token.original.value;
        }
      } else if (token.original.type === 'lineHeights') {
        if (token.original.value === 'AUTO') {
          return 'normal';
        }
        return token.value;
      } else if (String(token.unit) == 'undefined') {
        return token.original.value + (defaultUnits[token.original.type] || '');
      } else {
        return token.value + { pixel: 'px', percent: '%' }[token.unit];
      }
    }
  })
  .registerTransform({
    // uppercases region labels in variable names (not strictly kebab/CamelCase style):
    type: 'value',
    transitive: false,
    name: 'uppercaseregions',
    matcher: (token) => {
      return token.name.startsWith('color-vis-region') || token.name.startsWith('ColorVisRegion');
    },
    transformer: (token) => {
      if (token.name.startsWith('ColorVisRegion')) {
        // JS variable:
        const last = token.name.slice(-3);
        token.name = token.name.slice(0, token.name.length - 3) + last.toUpperCase();
      } else {
        // css variable:
        let parts = token.name.split('-');
        const last = parts.pop();
        token.name = parts.join('-') + '-' + last.toUpperCase();
      }
      return token.value;
    }
  })
  .registerTransformGroup({
    name: 'noop',
    transforms: []
  })
  .registerFormat({
    name: 'noop',
    formatter: function ({ dictionary, platform, options, file }) {
      return JSON.stringify(dictionary.tokens, null, 2);
    }
  })
  .buildAllPlatforms();
