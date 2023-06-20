<script>
  import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let type;
  export let legend_label;
  export let legend_units;

  export let selectedCountry;

  $: countryVal = data?.find((d) => d.iso3c === selectedCountry)?.acled;

  const ramp = piecewise(interpolateLab, [colors.ColorBaseRed500, colors.ColorBaseYellow200, colors.ColorBaseYellow100]);

  let legendScale = scaleSequential(ramp).domain([0, 5000]);
</script>

{#if type === 'legend'}
  <Legend title={legend_label} color={legendScale} digits="0" unitLabel={legend_units} />
{:else if type === 'reference-value'}
  <Number value={countryVal} digits="0" fallback="-" />
{/if}
