<script>
  import CountryPicker from '../general/CountryPicker.svelte';
  import Number from '../general/Number.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { _ } from 'svelte-i18n';
  export let data;

  let selectedCountry;

  const lostCover = 253300;
  $: areaRatio = selectedCountry
    ? lostCover / data.find((d) => d.iso3c == selectedCountry).area
    : $referenceCountry
        ? lostCover / data.find((d) => d.iso3c == $referenceCountry).area
        : null
  $: countryToDisplay = selectedCountry 
    ? selectedCountry
    : $referenceCountry
        ? $referenceCountry
        : null
</script>

<CountryPicker bind:selectedCountry />

{#if areaRatio}
  <p>
    Total tree cover loss was 111,000 square kilometers, which is equal to <span class="strong"
      ><Number value={areaRatio * 100} digits={0} unit={'%'} /> of the surface area of {$_(
        `country.${countryToDisplay.toLowerCase()}`
      )}</span
    >
    (<Number value={data.find((d) => d.iso3c == countryToDisplay).area} /> square kilometers)
  </p>
{:else}
  <p>Pick a country to compare its surface area to the 111,000 square kilometers of tree cover that was lost.</p>
{/if}
