<script>
  import { max } from 'd3-array';

  import ExcessChartMultiple from './ExcessChartMultiple.svelte';

  export let data;

  let incomes, maxDeaths;

  $: if (data) {
    console.log(data);
    incomes = [...new Set(data.map((d) => d.income))];
    maxDeaths = max(data.map((d) => d['acm.mean']));
  }
</script>

<div class="excess-chart">
  {#if data}
    {#each incomes as income}
      <ExcessChartMultiple data={data.filter((d) => d.income === income)} {maxDeaths} />
    {/each}
  {/if}
</div>

<style>
  .excess-chart {
    grid-column: full;
    padding: var(--space-m);

    display: flex;
    flex-flow: row wrap;
  }
</style>
