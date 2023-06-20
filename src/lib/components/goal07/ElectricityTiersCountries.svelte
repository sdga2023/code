<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import ElectricityTierMultiple from './ElectricityTierMultiple.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import * as Colors from '$lib/styles/tokens.es6';

  export let data;
  export let urban;
  export let rural;
  export let tier;
  export let tooltiprural;
  export let tooltipurban;

  const countries = ['NER', 'RWA', /*'ETH',*/ 'KEN', 'ZMB', 'NGA', 'LBR', 'STP', 'KHM', 'MMR', 'BGD', 'HND'];
  const legendItems = [0, 1, 2, 3, 4, 5].map((d) => {
    return { key: 'Tier ' + d, colour: Colors['ColorGrey' + (7 - d) * 100] };
  });
</script>

{#if data}
  <CategoricalLegend legendType="custom" customItems={legendItems} top={true} />
  <MultiplesContainer>
    {#each countries as country}
      <MultipleCell>
        <ElectricityTierMultiple
          {data}
          {country}
          height={250}
          {urban}
          {rural}
          showLabels={country == 'NER'}
          {tier}
          {tooltiprural}
          {tooltipurban}
        />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}
