<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import LineChartMultiple from './LineChartMultiple.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  export let data;
  export let gap;
  export let pp;

  const regions = ['LCN', 'SAS', 'MEA', 'SSF', 'ECS', 'EAS'];
</script>

{#if data}
  <CategoricalLegend legendType="gender" top={true} />
  <MultiplesContainer>
    {#each regions as region}
      <MultipleCell>
        <LineChartMultiple {data} {region} height={260} {gap} {pp} />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}
