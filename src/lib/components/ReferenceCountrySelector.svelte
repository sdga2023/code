<script>
  import vars from '$lib/variables.js';
  import { _ } from 'svelte-i18n';
  import { ISO3ToISO2 } from './tools/iso3toiso2';
  import countriesISO from '../../data/other/wb_countries_iso3.json';
  import { faXmark } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa/src/fa.svelte';

  import MyTypeahead from '$lib/components/MyTypeahead.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import ReferenceFlag from './ReferenceFlag.svelte';
  import { isMobile } from '$lib/stores/isMobile';

  export let hp = false;
  export let forceFocus = false;

  $: countries = countriesISO?.map((iso) => ({ iso, label: $_(`country.${iso.toLowerCase()}`).toUpperCase() }));

  const extract = (c) => $_(`country.${c?.iso.toLowerCase()}`).toUpperCase();

  let value;
  let referenceFlag;

  // change input value when $referenceCountry is changed externally:
  let lastRefCountry = '';
  $: if ($referenceCountry) {
    if (lastRefCountry !== $referenceCountry) {
      value = $_(`country.${$referenceCountry.toLowerCase()}`).toUpperCase();
      lastRefCountry = $referenceCountry;
    }
  }

  function clearRefCountry(e) {
    referenceCountry.set(null);
    value = '';
    document.querySelector('.reference-country-selector input')?.focus();
  }

  // change flag:
  $: {
    const iso2 = ISO3ToISO2($referenceCountry);
    if (iso2 !== $referenceCountry) {
      referenceFlag = iso2?.toLowerCase();
    } else {
      referenceFlag = null;
    }
  }
</script>

<div class="reference-country-selector">
  <!--
  {#if !hp}
    <span class="explanation">{$_(`highlight`, { default: 'Your highlighted country' })}</span>
  {/if}
  -->
  <p aria-label={$_(`header.refcountry.explanation`, { default: 'Search for a country to highlight in charts across the Atlas!' })} />
  <MyTypeahead
    label={$_(`highlight`, { default: 'Your highlighted country' })}
    placeholder={$_('search.reference.country', { default: 'Choose a country...' })}
    data={countries}
    hideLabel={hp}
    {extract}
    inputAfterSelect="update"
    {forceFocus}
    bind:value
    on:select={({ detail }) => {
      referenceCountry.set(detail.original.iso);
    }}
    on:clear={clearRefCountry}
  />
  {#if value}
    <div
      class="close-button"
      on:click={clearRefCountry}
      on:keypress={clearRefCountry}
      role="button"
      aria-label={$_('alt.clear', { default: 'Clear Selection' })}
    >
      <Fa icon={faXmark} size="lg" />
    </div>
  {/if}
  {#if !$isMobile || hp}
    {#if referenceFlag}
      <ReferenceFlag />
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
  {/if}
</div>

<style type="text/scss">
  .close-button {
    border-radius: 100%;
    background-color: var(--color-theme-bg-weaker);
    position: absolute;
    right: 53px;
    color: var(--color-grey-600);
    cursor: pointer;
    width: 25px;
    height: 25px;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .close-button:hover {
    background-color: var(--color-theme-primary);
    color: var(--color-theme-bg);
  }
  .explanation {
    color: var(--color-reference-country);
    font-size: var(--font-size-s);
  }

  //styles that apply to all reference-country-selectors
  .reference-country-selector {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-right: 2px;
    z-index: 999;
    pointer-events: all;

    :global([data-svelte-typeahead]) {
      color: var(--color-theme-text);
      outline: none;
      background-color: transparent !important;
      flex: 1;
    }

    :global(.pin) {
      background-color: var(--color-reference-country);
      width: 34px;
      height: 30px;
    }

    :global(flag) {
      border-radius: 100%;
      border: 2px solid var(--color-reference-country);
      min-width: 34px;
      min-height: 34px;
      width: 34px;
      height: 34px;

      background-size: cover;
      background-position: center top;
      background-repeat: no-repeat;
    }

    &:hover :global([data-svelte-typeahead]) {
      opacity: 1;
    }

    :global([data-svelte-typeahead] form) {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }
    :global([data-svelte-typeahead] label) {
      color: var(--color-reference-country);
      line-height: 120%;
      text-align: right;
    }

    :global([data-svelte-typeahead] li) {
      background-color: var(--color-theme-bg-weaker);
      font-size: var(--font-size-m);

      padding: var(--space-2xs) var(--space-xs);
      pointer-events: all;
    }

    :global([data-svelte-typeahead] li:hover) {
      background-color: var(--color-theme-bg-weakest);
    }
    :global([data-svelte-typeahead] li.selected) {
      background-color: var(--color-theme-bg-weakest);
    }

    :global([data-svelte-typeahead] mark) {
      background-color: var(--color-theme-bg-weaker);
      color: var(--color-reference-country);
    }

    :global([data-svelte-typeahead] input) {
      color: var(--color-reference-country);
      font-size: var(--font-size-m);
      font-weight: var(--font-weights-semibold);
      text-align: left;
      border-radius: 30px;
      width: auto;
      border: 1px solid var(--color-reference-country);
      background-color: var(--color-theme-bg-weaker);
      flex: 1;
      height: 34px;
    }

    :global([data-svelte-typeahead] input::placeholder) {
      color: var(--color-theme-dark-text-weaker);
      font-weight: var(--font-weights-regular);
      font-style: italic;
    }

    :global(::-webkit-search-cancel-button) {
      border: 1px solid var(--color-theme-text);
      display: none;
    }

    p {
      color: var(--color-theme-bg-weakest);
      margin: 0 0 var(--space-xs) 0;
    }
  }

  :global(.selector-container .reference-country-selector [data-svelte-typeahead] input) {
    background-color: var(--color-theme-bg);
  }

  //styles for Navigation
  :global(.navbar flag) {
    margin-left: 6px;
  }

  :global(.navbar) .reference-country-selector {
    min-width: 400px;
  }

  /* phone: */

  @media screen and (max-width: 872px) {
    :global(.navbar) .reference-country-selector .close-button {
      right: 8px;
    }

    .reference-country-selector .close-button {
      right: 48px;
    }

    :global(.navbar) .reference-country-selector {
      max-width: 500px;
      min-width: auto;
      width: 100%;
    }

    .reference-country-selector {
      gap: 6px;
      :global([data-svelte-typeahead]) {
        min-width: 220px;
      }

      :global([data-svelte-typeahead] input) {
        max-width: 100%;
        width: 100%;
      }
    }
  }
</style>
