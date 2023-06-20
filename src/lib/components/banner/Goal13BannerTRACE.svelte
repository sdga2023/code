<script>
  import GlobeLegend from '../general/GlobeLegend.svelte';
  import { scaleSequential } from 'd3';
  import { DivergingNegPos } from '$lib/styles/colorscales.js';
  import Number from '../general/Number.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let type;
  export let legend_label;
  export let legend_units;
  export let fossil_fuel_operations
  export let manufacturing
  export let mineral_extraction
  export let power
  export let transportation
  export let waste
  export let agriculture


  export let selectedCountry;

  $: countryVal =
    selectedCountry && data && data.find((d) => d.iso3c === selectedCountry)
      ? data.find((d) => d.iso3c === selectedCountry).emispercap
      : null;

  //let legendScale = scaleSequential(DivergingNegPos).domain([-35, 35]);

  const colorScale = [
        {key: fossil_fuel_operations, colour: colors.ColorBaseBlue500},
        {key: manufacturing, colour: colors.ColorBaseRed500},
        {key: mineral_extraction, colour: colors.ColorBasePink500},
        {key: power, colour: colors.ColorBaseGreen500},
        {key: transportation, colour: colors.ColorBaseYellow500},
        {key: waste, colour: colors.ColorBaseTeal500},
        {key: agriculture, colour: colors.ColorBaseOrange500}
]
</script>

{#if type === 'legend'}
  <CategoricalLegend legendType="custom" customItems={colorScale}></CategoricalLegend>
  <!--GlobeLegend title={legend_label} scale={legendScale} units={legend_units} digits="0" /-->
{:else if type === 'reference-value'}
  {#if countryVal}
    <Number value={countryVal} digits={1} units={legend_units} />
  {:else}
    No data
  {/if}
{/if}
