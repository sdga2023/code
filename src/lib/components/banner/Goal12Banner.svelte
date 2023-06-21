<script>
  import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab, scaleDivergingSqrt, scaleDiverging } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let type;
  export let legend_label;
  export let selectedCountry;

  $: countryVal = data?.find((d) => d.code === selectedCountry)?.growth_nca ?? 0;

  const ramp = piecewise(interpolateLab, [
    //  colors.ColorBaseRed700,
    colors.ColorBaseYellow600,
    colors.ColorBaseYellow500,
    colors.ColorBaseYellow400,
    colors.ColorBaseYellow300,
    '#dddddd',
    colors.ColorBaseTeal300,
    colors.ColorBaseTeal400,
    colors.ColorBaseTeal500,
    colors.ColorBaseBlue600

    //  colors.ColorBaseTeal700

    //    colors.ColorBaseBlue800,
  ]);

  let legendScale = scaleDiverging(ramp).domain([-100, 0, 200]).clamp(true);
</script>

{#if type === 'legend'}
  <!--<Legend title={legend_label} scale={legendScale} units="" digits="0" />-->
  <Legend
    title={legend_label}
    color={legendScale}
    tickLabels={[
      { label: '-100%', value: -100 },
      { label: '-50', value: -50 },
      { label: '0', value: 0 },
      { label: '+100', value: 100 },
      { label: '>+200%', value: 200 }
    ]}
    digits="0"
  />
{:else if type === 'reference-value'}
  {#if countryVal > 0}
    +<Number value={countryVal} fallback="-" unit="%" digits="1" />
  {:else}
    <Number value={countryVal} fallback="-" unit="%" digits="1" />
  {/if}
{/if}
