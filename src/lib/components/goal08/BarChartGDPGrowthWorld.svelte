<script>
  import BarChartMultiple from './BarChartMultiple.svelte';
  export let data;
  export let bartype;
</script>

{#if data}
  <BarChartMultiple {data} region={'WLT'} height={400} {bartype}/>
{/if}
