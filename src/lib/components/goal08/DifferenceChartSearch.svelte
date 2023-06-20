<script>
  import { CountryPicker } from '$lib/components';
  import DifferenceChartMultiple from './DifferenceChartMultiple.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';

  export let data;
  export let change;
  export let absolutedifference;

  $: selectedCountry = $referenceCountry ? $referenceCountry : "GRC";

</script>

<div class="picker-container">
<CountryPicker bind:selectedCountry />
</div>
{#if selectedCountry}
  <div>
    <DifferenceChartMultiple {data} geoType={'country'} geo={selectedCountry} height={450} noTitle={true} {change} {absolutedifference}/>
  </div>
{/if}

<style>
  .picker-container {
    margin-top: 3px;
  }
</style>
