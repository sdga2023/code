<script>
  import vars from '$lib/variables.js';
  import { _ } from 'svelte-i18n';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import { isScreenshotting } from '$lib/stores/isScreenshotting';
  import MyTypeahead from '$lib/components/MyTypeahead.svelte';
  import { onMount } from 'svelte';
  import { faXmark } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa/src/fa.svelte';

  export let selectedCountry;
  export let remove;
  export let clear = () => (selectedCountry = null);
  export let select;
  export let top = false;
  export let additionalCountries;

  $: countries = [...countriesISO?.map((iso) => ({ iso, label: $_(`country.${iso.toLowerCase()}`) })), ...(additionalCountries || [])];

  let value;
  let internalFilter = () => false;

  let lastValue, lastSelectedCountry;

  onMount(() => {
    // if (additionalCountries) {
    //   countries = [...countries, ...additionalCountries];
    // }

    if (selectedCountry) {
      if (!remove || !remove(selectedCountry)) {
        value = $_(`country.${selectedCountry.toLowerCase()}`);

        lastValue = value;
        lastSelectedCountry = selectedCountry;
      }
    }
  });

  function clearCountry(e) {
    lastValue = value;
    lastSelectedCountry = selectedCountry;
    value = '';
  }

  $: {
    if (lastSelectedCountry !== selectedCountry) {
      const newSelectedCountry = countries.find((c) => c.iso === selectedCountry);
      if (newSelectedCountry) {
        value = newSelectedCountry.label;
      } else {
        value = '';
      }
    } else {
      const currentlySelectedCountry = countries.find((c) => c.label === value);
      if (currentlySelectedCountry) {
        selectedCountry = currentlySelectedCountry.iso;
      }
    }
    lastSelectedCountry = selectedCountry;
    lastValue = value;
  }

  $: if (remove) {
    internalFilter = (d) => {
      return remove(d.iso);
    };
  }

  const extract = (c) => $_(`country.${c?.iso.toLowerCase()}`);
</script>

{#if !$isScreenshotting}
  <div class="country-selector" class:top>
    <i style="background-image:url({vars.pathPrefix}/assets/icons/fontawesome/magnifying-glass-solid.svg);" />
    <MyTypeahead
      autoselect
      placeholder={$_('search.country', { default: 'Search for a country...' })}
      data={countries}
      {extract}
      filter={internalFilter}
      bind:value
      on:select={select}
      on:clear={clear}
    >
      <svelte:fragment slot="no-results">
        {$_('search.no.results', { default: 'No results found for' })} "{value}"
      </svelte:fragment>
    </MyTypeahead>
    {#if value}
      <div class="close-button" on:click={clearCountry}><Fa icon={faXmark} size="sm" /></div>
    {/if}
  </div>
{/if}

<style type="text/scss">
  .country-selector {
    position: relative;
    width: 300px;
    max-width: 90%;
    z-index: 99;
    display: flex;
    align-items: center;
    margin: 0 auto var(--space-l) auto;
    padding: 3px 25px 0 0;

    &.top {
      margin: var(--space-s) auto var(--space-s) auto;
    }

    .close-button {
      border-radius: 100%;
      background-color: var(--color-theme-bg-weaker);
      position: absolute;
      right: 27px;
      color: var(--color-grey-600);
      cursor: pointer;
      width: 23px;
      height: 23px;

      display: flex;
      justify-content: center;
      align-items: center;
    }
    .close-button:hover {
      background-color: var(--color-theme-primary);
      color: var(--color-theme-bg);
    }

    i {
      display: inline-block;
      width: var(--font-size-l);
      height: var(--font-size-l);

      background-size: contain;
      border: 2px solid transparent;
      stroke: var(--color-theme-text-weaker);
      background-repeat: no-repeat;

      margin-right: var(--space-xs);
    }

    :global([data-svelte-typeahead]) {
      outline: none;
      background-color: transparent !important;
      border: none;

      flex-grow: 1;
    }

    :global([data-svelte-typeahead] li) {
      background-color: var(--color-theme-bg-weaker);

      color: var(--color-theme-text-weaker);
      font-size: var(--font-size-m);
    }

    :global([data-svelte-typeahead] li:hover) {
      color: var(--color-theme-primary);
    }
    :global([data-svelte-typeahead] li.selected) {
      color: var(--color-theme-primary);
    }

    :global([data-svelte-typeahead] mark) {
      background-color: var(--color-grey-200);
    }

    :global([data-svelte-typeahead] label) {
      display: none;
    }

    :global([data-svelte-typeahead] input) {
      padding: 0 var(--space-3xs) 0 calc(var(--space-s));
      border: 0;
      color: var(--color-theme-text);
      font-size: var(--font-size-m);
      letter-spacing: var(--letter-spacing-5);
      background-color: var(--color-theme-bg);
      text-align: left;
      border-radius: 20px;
      border: 1px solid var(--color-grey-400);
    }
    :global([data-svelte-typeahead] input::placeholder) {
      color: var(--color-theme-text-weaker);
      font-weight: var(--font-weights-regular);
    }

    :global([data-svelte-typeahead] input:hover) {
      color: var(--color-theme-primary);
    }

    :global(::-webkit-search-cancel-button) {
      display: none;
    }

    :global([data-svelte-typeahead] .no-results) {
      background-color: var(--color-theme-bg);
      color: var(--color-theme-text-weaker);
      font-style: italic;
    }

    p {
      color: var(--color-theme-bg-weakest);
      margin: 0 0 var(--space-xs) 0;
    }
  }
</style>
