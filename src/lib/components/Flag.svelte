<script>
  import vars from '$lib/variables.js';
  import { _ } from 'svelte-i18n';
  import { ISO3ToISO2 } from './tools/iso3toiso2';

  export let selectedCountry;

  let countryISO2;

  // change flag:
  $: {
    const iso2 = ISO3ToISO2(selectedCountry);
    if (iso2 !== selectedCountry) {
      countryISO2 = iso2?.toLowerCase();
    } else {
      countryISO2 = null;
    }
  }
</script>

{#if countryISO2}
  <flag style={`background-image:url(${vars.pathPrefix}/assets/images/flags/${countryISO2}.png)`} />
{:else}
  <flag
    class="pin"
    style="
    -webkit-mask-image: url({vars.pathPrefix}/assets/icons/fontawesome/location-dot-solid.svg); 
    mask-image:url({vars.pathPrefix}/assets/icons/fontawesome/location-dot-solid.svg); 
    -webkit-mask-size: contain; 
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    border: 2px solid transparent;"
  />
{/if}

<style lang="scss">
  flag {
    display: inline-block;
    border-radius: 100%;
    border: 2px solid var(--color-reference-country);

    min-width: 24px;
    height: 24px;

    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;

    vertical-align: middle;
  }
  .pin {
    background-color: var(--color-reference-country);
  }
</style>
