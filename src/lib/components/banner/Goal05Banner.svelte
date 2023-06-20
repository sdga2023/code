<script>
  import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab, scaleDiverging } from 'd3';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let type;
  export let legend_label;
  export let selectedCountry;
  export let legend_units;

  $: countryVal = data?.find((d) => d.iso3c === selectedCountry)?.gap;

  const ramp = piecewise(interpolateLab, [
    colors.ColorBasePurple600,
    colors.ColorBasePurple400,
    colors.ColorBasePurple300,
    colors.ColorBasePurple200,
    colors.ColorBasePurple100,
    '#dddddd',
    colors.ColorBaseYellow100,
    colors.ColorBaseYellow200,
    colors.ColorBaseOrange300,
    colors.ColorBaseOrange400,
    colors.ColorUnSdg5
  ]);

  let legendScale = scaleDiverging(ramp).domain([-5, 0, 5]);
</script>

{#if type === 'legend'}
  <!--<Legend title={legend_label} scale={legendScale} units="" digits="0" />-->
  <Legend
    title={legend_label}
    color={legendScale}
    tickLabels={[
      { label: '+5h spent by men ', value: -5 },
      { label: '0', value: 0 },
      { label: '+5h spent by women', value: 5 }
    ]}
    digits="0"
    unitLabel={legend_units}
  />
{:else if type === 'reference-value'}
  {#if selectedCountry === 'WLD'}
    <div><p class="additional reference-label">{$_(`average`)}</p></div>
  {/if}
  {#if countryVal}
    +<Number value={countryVal} fallback="-" digits="1" /><span class="units">{legend_units}</span>
  {:else}
    -
  {/if}
{/if}
