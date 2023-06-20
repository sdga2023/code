<script>
  import { isMobile } from '$lib/stores/isMobile';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import ReferenceCountrySelector from './ReferenceCountrySelector.svelte';
  import ReferenceFlag from './ReferenceFlag.svelte';
  import { _ } from 'svelte-i18n';
  import { clickOutside } from './tools/clickOutside';

  let lastReferenceCountry = null;
  let isOpen = false;

  $: {
    //if reference country is changed to a new country (not to null), hide selector
    if (isOpen && lastReferenceCountry !== $referenceCountry && $referenceCountry) {
      isOpen = false;
    }
    lastReferenceCountry = $referenceCountry;
  }

  function toggleSelector() {
    //toggle the selector
    isOpen = !isOpen;
  }
  function handleClickOutside(event) {
    isOpen = false;
  }
</script>

<div class="reference-container-mobile">
  <div class="flag-connector-box">
    <div class="flag-container" on:click={toggleSelector}>
      {#if !$isMobile}Your highlighted country{/if}<ReferenceFlag />
    </div>

    <div class="connector" />
  </div>

  <div class="selector-container" class:open={isOpen} use:clickOutside on:click_outside={handleClickOutside}>
    <ReferenceCountrySelector forceFocus={isOpen} />

    {#if !$referenceCountry}
      <p class="instruction inst-container">{$_(`header.refcountry.explanation`)}</p>
    {:else}
      <p class="instruction inst-container">
        <span>{$_(`country.${$referenceCountry.toLowerCase()}`)}</span>
        {$_(`header.refcountry.explanation2`)}
      </p>
    {/if}
  </div>
  <div class="selector-container-mask" />
</div>

<style>
  .flag-container {
    cursor: pointer;
  }
  .reference-container-mobile {
    height: 100%;
  }

  .flag-connector-box {
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }

  .connector {
    width: 3px;
    height: calc((var(--loop-header-height) - 24px /* <- flag icon height */) / 2);

    transition: background-color 0.5s ease;
  }

  .selector-container {
    position: absolute;

    top: var(--loop-header-height);
    right: 0;
    width: 500px;

    z-index: -2;

    background-color: #3c3b4fdd;
    color: white;

    padding: var(--space-s);
    opacity: 0;
    pointer-events: none;
  }

  .selector-container.open {
    opacity: 1;
    pointer-events: all;
  }

  .selector-container-mask {
    position: absolute;
    width: 100vw;
    height: var(--loop-header-height);

    top: 0;
    left: 0;

    z-index: -1;
    background-color: white;
  }
  .inst-container {
    font-size: var(--font-size-s);
    text-align: left;
    padding-top: var(--space-xs);
  }

  .inst-container span {
    text-transform: uppercase;
    font-style: normal;
    font-weight: var(--font-weights-semibold);
    color: var(--color-reference-country);
  }
  @media screen and (max-width: 872px) {
    .selector-container {
      width: 100vw;
    }
  }
</style>
