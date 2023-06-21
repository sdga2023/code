<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import AirTrafficMultiple from './AirTrafficMultiple.svelte';
  import { _ } from 'svelte-i18n';
  import { CountryPicker } from '$lib/components';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';

  export let data;
  export let passengers;
  export let freight;
  export let departures;

  $: metricsMap = {
    passengers: passengers,
    freight: freight,
    departures: departures
  };

  let worldData = data.filter((d) => d.iso3c == 'WLD');
  $: countryData = selectedCountry ? data.filter((d) => d.iso3c == selectedCountry) : [];

  let metrics = ['passengers', 'freight', 'departures'];

  let selectedCountry;

  let countriesToRemove = countriesISO.filter((d) => !data.map((d) => d.iso3c).includes(d));
  let remove = (iso) => countriesToRemove.includes(iso);
</script>

{#if data}
<CountryPicker bind:selectedCountry {remove} />
  <MultiplesContainer>
    {#each metrics as metric}
      <MultipleCell>
        <AirTrafficMultiple data={worldData} {metricsMap} {metric} height={260} />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}

{#if countryData.length > 0}
  <h1 class="multiple-title">{$_(`country.${selectedCountry.toLowerCase()}`)}</h1>
  <MultiplesContainer>
    {#each metrics as metric}
      <MultipleCell>
        <AirTrafficMultiple data={countryData} {metricsMap} {metric} height={260} />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}

<style>
  .subtitle {
    text-align: center;
    font-family: var(--font-families-open-sans);
    font-size: var(--font-size-m);
    margin-top: var(--space-2xs);
    color: var(--color-theme-text-weaker);
    letter-spacing: var(--letter-spacing-0);
  }
  .multiple-title {
    color: var(--color-theme-text);
    font-weight: var(--font-weights-regular);
    font-family: var(--font-families-andes);
    line-height: var(--line-heights-auto);
    font-size: var(--font-size-l);
    letter-spacing: var(--letter-spacing-5);
    padding: var(--space-l) 0 var(--space-2xs) 0;
    text-align: center;
  }
</style>
