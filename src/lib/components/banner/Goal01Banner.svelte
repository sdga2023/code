<script>
  import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let type;
  export let legend_label_title;
  export let legend_label_poor;
  export let legend_label_other;
  export let legend_units;

  export let selectedCountry;

  $: d = data?.find((d) => d.iso3c === selectedCountry);
  $: countryVal = selectedCountry && data && d && d.greyout === 0 ? d.poor_in_millions : null;
</script>

{#if type === 'legend'}
  <!--<Legend title={legend_label} scale={legendScale} units="" digits="0" />-->
  <CategoricalLegend
    legendType="custom"
    customItems={[
      { key: legend_label_title, colour: colors.ColorThemeDarkBg },
      { key: legend_label_poor, colour: colors.ColorBaseRed500 },
      { key: legend_label_other, colour: colors.ColorBaseBlue300 }
    ]}
  />
{:else if type === 'reference-value'}
  {#if d}
    {#if d.greyout === 1}
      <Number value={undefined} fallback="-" />
    {:else if countryVal === 0}
      <span class="prefix">&lt;</span><Number value={1} /><span class="units">{legend_units}</span>
    {:else}
      <Number value={countryVal} fallback="-" /><span class="units">{legend_units}</span>
    {/if}
  {/if}
{/if}
