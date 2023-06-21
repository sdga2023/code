<script>
  import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab, scaleSequentialSqrt, scaleDivergingSqrt } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let type;
  export let legend_label;
  export let legend_units;
  export let received;
  export let provided;
  export let selectedCountry;

  $: countryVal = data?.find((d) => d.iso3 === selectedCountry)?.oda_pcap;

  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseBlue700,
    colors.ColorBaseBlue500,
    colors.ColorGrey200,
    colors.ColorBaseOrange500,
    colors.ColorBaseOrange700
  ]);

  let legendScale = scaleDivergingSqrt(ramp).domain([-500, 0, 500]).clamp(true);
</script>

{#if type === 'legend'}
  <Legend
    title={legend_label}
    color={legendScale}
    unitLabel={legend_units}
    tickLabels={[
      { label: 'donated >800$', value: -800 },
      { label: '50', value: -50 },
      { label: '0', value: 0 },
      { label: '50', value: 50 },
      { label: '>800$ received', value: 800 }
    ]}
    digits="0"
  />
{:else if type === 'reference-value'}
  {#if countryVal > 0}
    <p class="additional reference-label">{received}</p>
    <Number value={Math.abs(countryVal)} unit={'$'} fallback="-" digits={2} />
  {:else}
    <p class="additional reference-label">{provided}</p>
    <Number value={Math.abs(countryVal)} unit={'$'} fallback="-" digits={2} />
  {/if}
{/if}
