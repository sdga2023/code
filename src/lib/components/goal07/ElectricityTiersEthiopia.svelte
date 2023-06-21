<script>
  import ElectricityTierMultiple from './ElectricityTierMultiple.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import * as Colors from '$lib/styles/tokens.es6';

  export let data;
  export let urban;
  export let rural;
  export let tier;
  export let tooltiprural;
  export let tooltipurban;

  const countries = ['ETH'];
  const legendItems = [0, 1, 2, 3, 4, 5].map((d) => {
    return { key: 'Tier ' + d, colour: Colors['ColorGrey' + (7 - d) * 100] };
  });
</script>

{#if data}
  <CategoricalLegend legendType="custom" customItems={legendItems} top={true} />
  {#each countries as country}
    <ElectricityTierMultiple
      {data}
      {country}
      height={400}
      {urban}
      {rural}
      showLabels={country == 'ETH'}
      {tier}
      {tooltiprural}
      {tooltipurban}
    />
  {/each}
{/if}
