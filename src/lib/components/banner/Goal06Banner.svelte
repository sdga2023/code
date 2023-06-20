<script>
  import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab, extent } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let type;
  export let legend_label;
  export let legend_units;
  export let selectedCountry;

  const WORLD_WATER_STRESS_LEVEL = 18;

  $: countryVal = selectedCountry === 'WLD' ? WORLD_WATER_STRESS_LEVEL : data?.find((d) => d.iso === selectedCountry)?.value ?? undefined;

  const ramp = piecewise(interpolateLab, [
    colors.ColorUnSdg6,
    colors.ColorBaseGreen400,
    colors.ColorBaseYellow500,
    colors.ColorBaseOrange600
  ]);

  let legendScale = scaleSequential(ramp).domain([0, 100]);

  // None (<25 percent), Low (25-50 percent), Medium (50-75 percent), High (75-100 percent), and Critical (>100 percent).
</script>

{#if type === 'legend'}
  <!-- <Legend title={legend_label} scale={legendScale} units="" digits="0" /> -->
  <Legend
    title={legend_label}
    color={legendScale}
    unitLabel={legend_units}
    digits="0"
    tickLabels={[
      { label: 'None', value: 0 },
      { label: 'Low', value: 25 },
      { label: 'Medium', value: 50 },
      { label: 'High', value: 75 },
      { label: 'Critical', value: 100 }
    ]}
  />
{:else if type === 'reference-value'}
  <p class="additional reference-label">
    {#if countryVal < 25}
      No stress (&lt;25%)
    {:else if countryVal <= 50}
      Low (25-50%)
    {:else if countryVal <= 75}
      Medium (50-75%)
    {:else if countryVal <= 100}
      High (75-100%)
    {:else if countryVal > 100}
      Critical (>100%)
    {:else}{/if}
  </p>

  {#if countryVal < 0.1}
    <Number value={countryVal} fallback={'-'} unit={legend_units} digits={2} />
  {:else if countryVal < 1}
    <Number value={countryVal} fallback={'-'} unit={legend_units} digits={1} />
  {:else}
    <Number value={countryVal} fallback={'-'} unit={legend_units} />
  {/if}
  <!-- {#if selectedCountry === 'COG'}
    <Number value={countryVal} fallback={'-'} unit={legend_units} digits={2} />
  {:else if ['PNG', 'LBR', 'ISL', 'SLE', 'CAF', 'COD', 'GNQ', 'FJI'].includes(selectedCountry)}
    <Number value={countryVal} fallback={'-'} unit={legend_units} digits={1} />
  {:else}
    <Number value={countryVal} fallback={'-'} unit={legend_units} />
  {/if} -->
{/if}
