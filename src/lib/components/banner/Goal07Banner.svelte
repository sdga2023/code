<script>
  //import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let type;
  export let legend_label;
  export let country_data_units;

  export let selectedCountry;

  $: countryVal =
    selectedCountry && data && data.find((d) => d.iso3c === selectedCountry)
      ? data.find((d) => d.iso3c === selectedCountry && d.date == 2020)?.value
      : null;

  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseBlue200,
    colors.ColorBasePurple300,
    colors.ColorBasePink400,
    colors.ColorBasePink500,
    colors.ColorBasePink600
  ]);

  //let legendScale = scaleSequential(ramp).domain([0, 100]);
</script>

{#if type === 'legend'}
  {legend_label}
{:else if type === 'reference-value'}
  <Number value={countryVal} unit={country_data_units} fallback="-" />
{/if}
