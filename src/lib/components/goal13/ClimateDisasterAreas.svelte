<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import ClimateDisasterMultiple from './ClimateDisasterMultiple.svelte';

  export let data;
  export let drought;
  export let flood;
  export let storm;
  export let wildfire;
  export let temperature;
  export let yaxistitle;

  $: disastersMap = {
    drought: drought,
    flood: flood,
    storm: storm,
    wildfire: wildfire,
    temperature: temperature
  };

  let disasters = ['flood', 'storm', 'temperature', 'wildfire', 'drought'];
</script>

{#if data}
  <MultiplesContainer>
    {#each disasters as disaster}
      <MultipleCell>
        <ClimateDisasterMultiple data={data.filter(d => d.type == disaster)} {disastersMap} {disaster} {yaxistitle} height={260} />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}