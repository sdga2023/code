<script>
  import GlobeLegend from '../general/GlobeLegend.svelte';
  import {
    extent,
    interpolateLab,
    piecewise,
    scaleDiverging,
    scaleDivergingLog,
    scaleDivergingSqrt,
    scaleLinear,
    scaleSequential,
    scaleSequentialLog
  } from 'd3';
  import { DivergingNegPos } from '$lib/styles/colorscales.js';
  import Number from '../general/Number.svelte';
  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import Legend from '../general/Legend.svelte';

  export let data;
  export let type;
  export let legend_label;
  export let legend_units;

  export let selectedCountry;

  $: countryVal =
    selectedCountry && data && data.find((d) => d.iso3c === selectedCountry)
      ? data.find((d) => d.iso3c === selectedCountry).GDP_growth_rate
      : undefined;

  // let legendScale = scaleSequential(DivergingNegPos).domain([-35, 35]);

  legend_units = '%';
  /*
  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseRed200,
    colors.ColorBasePink400,
    colors.ColorBaseDarkPurple600,
    colors.ColorBaseBlue400,
    colors.ColorBaseBlue200
  ]);*/
  const ramp = piecewise(interpolateLab, [
    //  colors.ColorBaseRed700,
    colors.ColorBaseRed700,
    colors.ColorBasePink600,
    colors.ColorBasePink500,
    colors.ColorBaseDarkPurple300,
    colors.ColorBaseBlue500,
    colors.ColorBaseTeal600,
    colors.ColorBaseTeal700

    //  colors.ColorBaseTeal700

    //    colors.ColorBaseBlue800,
  ]);

  let legendScale = scaleDivergingSqrt(ramp).domain([-50, 0, 50]);
</script>

{#if type === 'legend'}
  <Legend
    title={legend_label}
    color={legendScale}
    tickLabels={[
      { label: '-50%', value: -50 },
      { label: '-10', value: -10 },
      { label: '0', value: 0 },
      { label: '+10', value: 10 },
      { label: '+50%', value: 50 }
    ]}
    digits="0"
  />
{:else if type === 'reference-value'}
  {#if countryVal > 0}
    +<Number value={countryVal} unit={legend_units} fallback="-" digits={1} />
  {:else}
    <Number value={countryVal} unit={legend_units} fallback="-" digits={1} />
  {/if}
{/if}
