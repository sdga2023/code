<script>
  import { max } from 'd3-array';
  import HomicideRateVictimsChart from './HomicideRateVictimsChart.svelte';
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';

  export let data;
  export let labels;

  let cellWidth = 'var(--col-3)';
  let cellHeight = 170;

  const regions = ['EAS', 'ECS', 'LCN', 'MEA', 'NAC', 'SAS', 'SSF'];
</script>

{#if data}
  <MultiplesContainer>
    {#each regions.sort((a, b) => data.filter((d) => d.iso3c === b && d.year === 2021)[0].total - data.filter((d) => d.iso3c === a && d.year === 2021)[0].total) as region}
      <MultipleCell>
        <HomicideRateVictimsChart
          data={data.filter((d) => d.iso3c === region)}
          width={cellWidth}
          height={cellHeight}
          {region}
          {labels}
          maxTotal={max(data, (d) => d.total)}
        />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}
