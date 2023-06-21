<script>
  import { scaleSequential, piecewise, interpolateLab } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import Legend from '../general/Legend.svelte';

  export let data;
  export let type;

  export let legend_label;
  export let legend_units;
  export let selectedCountry;

  /*
  const ramp = piecewise(interpolateLab, [
    colors.ColorBasePurple500,
    colors.ColorBaseTeal400,
    colors.ColorBaseGreen300,
    colors.ColorBaseGreen200,
    colors.ColorBaseGreen100
  ]);*/

  const ramp = piecewise(interpolateLab, [colors.ColorBaseYellow100, colors.ColorBaseGreen300, colors.ColorBaseTeal500]);
  const scale = scaleSequential(ramp).domain([0, 100]);

  $: countryVal = data?.find((d) => d.ISO3 === selectedCountry)?.coverage;
</script>

{#if type === 'legend'}
  <Legend title={legend_label} color={scale} unitLabel={legend_units} units="%" digits="0" />
{:else if type === 'reference-value'}
  <Number value={countryVal} fallback="-" unit="%" />
{/if}
