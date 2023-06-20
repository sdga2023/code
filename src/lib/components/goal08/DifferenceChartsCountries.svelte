<script>
  import SmallMultipleContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import DifferenceChartMultiple from './DifferenceChartMultiple.svelte';

  export let data;
  export let id;
  export let change;
  export let absolutedifference;

  let countriesToShowMap = {
    'idn-ind': ['IDN', 'IND'],
    chn: ['CHN'],
    'cod-ecu': ['COD', 'ECU'],
    'nic-guy': ['NIC', 'GUY'],
    tourism: ['BHS', 'FJI', 'MUS', 'THA']
  };

  $: countriesToShow = id ? countriesToShowMap[id] : [];
  let lastSingleCountry;
  $: if (countriesToShow.length % 2 == 1) {
    lastSingleCountry = countriesToShow.pop();
  }
  let w
  $: singleChartWidth = w > 559 ? w/2 - 48 : w - 48
</script>

<SmallMultipleContainer>
  {#each countriesToShow as country}
    <MultipleCell>
      <DifferenceChartMultiple {data} geoType={'country'} geo={country} height={250} {change} {absolutedifference} {id} />
    </MultipleCell>
  {/each}
</SmallMultipleContainer>

{#if lastSingleCountry}
  <div class="single-country-container" bind:clientWidth={w}>
    {#if w}
    <div class="single-country-chart" style:width={singleChartWidth+'px'}>
    <DifferenceChartMultiple {data} geoType={'country'} geo={lastSingleCountry} height={250} {change} {absolutedifference} {id} />
  </div>
  {/if}
  </div>
{/if}

<style>
  .single-country-container {
    width: 100%;
    padding: var(--space-m) var(--space-l);
  }
  .single-country-chart {
    margin: auto;
  }
</style>
