<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import RedListSlopeMultiple from './RedListSlopeMultiple.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import CountryPicker from '../general/CountryPicker.svelte';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';

  export let data;
  export let strongdecline;
  export let decline;
  export let slightdecline;
  export let slightimprovement;

  const trendClasses = ['(-0.26,-0.05]', '(-0.05,-0.02]', '(-0.02,0]', '(0,0.03]'];
  const titles = [strongdecline, decline, slightdecline, slightimprovement];

  let selectedCountry;
  let countriesToRemove = countriesISO.filter((d) => ![...new Set(data.map((c) => c.iso3c))].includes(d));
  let remove = (iso) => countriesToRemove.includes(iso);
</script>

{#if data}
  <CountryPicker bind:selectedCountry {remove} clear={() => (selectedCountry = null)} />
  <CategoricalLegend top={true} legendType="regions" />
  <MultiplesContainer>
    {#each trendClasses as trendClass, i}
      <MultipleCell cols="3">
        <RedListSlopeMultiple data={data.filter((d) => d.class == trendClass)} {trendClass} title={titles[i]} bind:selectedCountry />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}
