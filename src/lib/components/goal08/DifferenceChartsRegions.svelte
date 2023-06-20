<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import DifferenceChartMultiple from './DifferenceChartMultiple.svelte';
  
  export let data;
  export let change;
  export let absolutedifference;

  const regions = ['LCN', 'SAS', 'MEA', 'SSF', 'ECS', 'EAS'];
</script>

{#if data}
  <MultiplesContainer>
    {#each regions as region}
      <MultipleCell>
        <DifferenceChartMultiple {data} geoType={'region'} geo={region} height={250} {change} {absolutedifference}/>
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}
