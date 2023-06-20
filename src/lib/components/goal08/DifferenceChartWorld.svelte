<script>
  import DifferenceChartMultiple from './DifferenceChartMultiple.svelte';
  export let data;
  export let precovid;
  export let current;
  export let annotation;
  export let change;
  export let absolutedifference;
</script>

{#if data}
  <DifferenceChartMultiple {data} geoType={'region'} geo={'WLD'} height={400} {precovid} {current} noTitle={true} {annotation} {change} {absolutedifference}/>
{/if}
