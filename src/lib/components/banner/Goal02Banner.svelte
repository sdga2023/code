<script>
  import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab, sum } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let type;
  export let legend_label;
  export let legend_units;
  export let country_data_label;
  export let billion;

  export let selectedCountry;
  $: console.log(data);
  $: countryVal = data?.find((d) => d.country_code === selectedCountry)?.mln_people_no_healthy_diet;
  // $: countryVal = data?.find((d) => d.ISO3 === selectedCountry)?.coverage;

  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseYellow200,
    colors.ColorBaseYellow300,
    colors.ColorBaseYellow400,
    colors.ColorBaseYellow500,
    colors.ColorBaseYellow600
  ]);

  let legendScale = scaleSequential(ramp).domain([0, 100]).clamp(true);
</script>

{#if type === 'legend'}
  <Legend
    title={legend_label}
    color={legendScale}
    unitLabel={legend_units}
    digits="0"
    tickLabels={[
      { value: 0, label: 0 },
      { value: 50, label: 50 },
      { value: 100, label: '>100' }
    ]}
  />
{:else if type === 'reference-value'}
  {#if selectedCountry === 'WLD'}
    <Number value={countryVal / 1000} digits="1" fallback="-" /><span class="units">{billion}</span>
  {:else if countryVal >= 100}
    <Number value={countryVal} digits="0" fallback="-" /><span class="units">{legend_units}</span>
  {:else if countryVal === 0}
    {'<0.1'}<span class="units">{legend_units}</span>
  {:else}
    <Number value={countryVal} digits="1" fallback="-" /><span class="units">{legend_units}</span>
  {/if}
  <!--
    {#if selectedCountry}
      <Number value={data.find((d) => d.country_code === selectedCountry)?.mln_people_no_healthy_diet} fallback="-" /><span class="units">
        {legend_units}
      </span>
    {:else if $referenceCountry}
      <Number value={data.find((d) => d.country_code === $referenceCountry)?.mln_people_no_healthy_diet} fallback="-" /><span class="units">
        {legend_units}
      </span>
    {:else}
      <Number value={sum(data, (d) => d.mln_people_no_healthy_diet)} fallback="-" /><span class="units">{legend_units}</span>
    {/if}
    -->
{/if}
