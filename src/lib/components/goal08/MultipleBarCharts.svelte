<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import BarChartMultiple from './BarChartMultiple.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let bartype;

  const regions = ['LCN', 'SAS', 'MEA', 'SSF', 'ECS', 'EAS'];
</script>

{#if data}
  {#if bartype == 'unemployment'}
    <CategoricalLegend
      legendType="custom"
      customItems={[{ key: 'Higher unemployment compared to 2019', colour: Colors.ColorVisBinaryNeg }]}
      itemSymbol={'square'}
      top={true}
    />
  {/if}
  <MultiplesContainer>
    {#each regions as region}
      <MultipleCell>
        <BarChartMultiple {data} {region} height={260} {bartype} />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}
