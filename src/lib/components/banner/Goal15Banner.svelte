<script>
  import GlobeLegend from '../general/GlobeLegend.svelte';
  import { scaleSequential } from 'd3';
  import Number from '../general/Number.svelte';
  import { interpolateLab, piecewise } from 'd3';
  import { BlueRamp } from '$lib/styles/colorscales.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import Legend from '../general/Legend.svelte';

  export let data;
  export let type;
  export let legend_label;
  export let legend_units;
  export let selectedCountry;

  $: countryVal =
    selectedCountry && data && data.find((d) => d.iso3c === selectedCountry)
      ? data.find((d) => d.iso3c === selectedCountry).forests_2020
      : null;

  const ramp = piecewise(interpolateLab, [
    '#DDD6CF',
    '#fcd163',
    '#99b718',
    '#66a000',
    '#3e8601',
    '#207401',
    '#056201',
    '#004c00',
    '#011301'
  ]);

  let legendScale = scaleSequential(ramp).domain([0, 30]);
</script>

{#if type === 'legend'}
  <Legend title={legend_label} color={legendScale} unitLabel={legend_units} digits="0" />
{:else if type === 'reference-value'}
  {#if countryVal < 1}
  &lt;1%
  {:else}
  <Number value={countryVal} unit="%" fallback="-" />
  {/if}
  
{/if}
