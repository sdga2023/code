<script>
  import { locale } from 'svelte-i18n';

  export let value;
  export let digits = null;
  export let unit = '';
  export let fallback = null;

  const currencyMap = {
    $: 'USD',
    '€': 'EUR',
    '¥': 'JPY'
  };

  let unitSymbol;
  let formattingStyle = 'decimal';
  let formattedValue = '';
  $: {
    const numberifiedValue = ('' + value).replace(/[^-\d\.]/g, '');
    if (numberifiedValue === '' || isNaN(numberifiedValue) || numberifiedValue === null) {
      formattedValue = fallback ? fallback : '';
    } else {
      let parsedValue = Number.parseFloat(numberifiedValue);

      // try to detect a currency symbol in value
      unitSymbol = Object.keys(currencyMap).find((symbol) => ('' + value).includes(symbol));
      if (unitSymbol || Object.keys(currencyMap).includes(unit)) {
        formattingStyle = 'currency';
        if (unit) {
          unitSymbol = unit;
        }
      } else if (('' + value).includes('%') || unit === '%') {
        // or a percentage symbol
        unitSymbol = '%';
        formattingStyle = 'percent';

        // for Intl.NumberFormat, percentage values needs to be between 0 and 1, so divide by 100:
        parsedValue /= 100;
      } else if (unit) {
        unitSymbol = unit;
        formattingStyle = 'unit';
      }

      let formattingOptions = {
        style: formattingStyle,
        currency: currencyMap[unitSymbol],
        currencyDisplay: 'narrowSymbol'
      };

      if (digits || digits === 0) {
        formattingOptions.minimumFractionDigits = digits;
        formattingOptions.maximumFractionDigits = digits;
      }

      formattedValue = new Intl.NumberFormat($locale, formattingOptions).format(parsedValue);
    }
  }
</script>

{formattedValue}
