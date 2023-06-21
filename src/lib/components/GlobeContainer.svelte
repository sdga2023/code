<script>
  import Globe from './Globe.svelte';
  import variables from '$lib/variables';
  import { _ } from 'svelte-i18n';

  import { browser } from '$app/environment';
  import { base } from '$app/paths';

  import { referenceCountry } from '$lib/stores/referenceCountry.js';

  import { activeGoal } from '$lib/stores/activeGoal';
  import { onDestroy } from 'svelte';
  import { isScreenshotting } from '$lib/stores/isScreenshotting';
  import { isMobile } from '$lib/stores/isMobile';
  import ReferenceFlag from './ReferenceFlag.svelte';

  export let country_data_label = '';
  export let isGlobeReady = false;

  let selectedCountry = '';

  let clientWidth = 0;
  let clientHeight = 0;

  let switchOpen = $isMobile;

  const SCREENSHOT_HEIGHT = 1050;

  $: maxGlobeWidth = browser && window.innerWidth <= 1024 ? 500 : $isScreenshotting ? SCREENSHOT_HEIGHT : 520;

  $: globeWidth = 0;
  $: globeHeight = 0;

  $: {
    if (!browser || window.innerWidth <= 1024) {
      globeWidth = clientWidth;
      globeHeight = globeWidth;
    } else {
      globeHeight = Math.max(400, Math.min(Math.min(clientWidth * 0.8, window.innerHeight * 0.5), maxGlobeWidth));
      globeHeight = $isScreenshotting ? SCREENSHOT_HEIGHT : globeHeight;
      globeWidth = globeHeight;
    }
  }

  // select reference country on chapter change:
  let lastActiveGoal;
  $: if ($activeGoal && $activeGoal !== lastActiveGoal) {
    selectedCountry = $referenceCountry;
    lastActiveGoal = $activeGoal;
  }

  // select reference country when changed:
  const unsubscribe = referenceCountry.subscribe((newValue) => {
    selectedCountry = newValue;
  });

  // $: switchOpen = (!$referenceCountry && !selectedCountry) || selectedCountry !== $referenceCountry || $isMobile;

  // $: $mobileRefOpen = selectedCountry !== $referenceCountry || (!$referenceCountry && !selectedCountry);

  onDestroy(unsubscribe);
</script>

<div
  class="globe-container"
  style="--globe-width: {globeWidth}px; --max-globe-width: {maxGlobeWidth}px"
  class:screenshotting={$isScreenshotting}
>
  {#if !$isScreenshotting}
    <div class="globier-container" bind:clientWidth bind:clientHeight>
      {#if browser}
        <Globe width={globeWidth} height={globeHeight} globedescription={$_(`alt.globe`) + ' ' + country_data_label} bind:selectedCountry />
      {/if}

      <div
        class="value-container"
        class:refcountry={selectedCountry === $referenceCountry && $referenceCountry}
        class:visible={isGlobeReady}
      >
        <p class="reference-label">{selectedCountry ? $_(`country.${selectedCountry.toLowerCase()}`) : $_(`worldwide`)}</p>
        <div class="reference-value"><slot name="reference-value" selectedCountry={selectedCountry ? selectedCountry : 'WLD'} /></div>
        <p class="ref-data-description">
          {country_data_label}
        </p>
        {#if !$isMobile}
          <div class="inst-container">
            <div class="compare">
              {#if $referenceCountry && selectedCountry !== $referenceCountry}
                <!-- refCountry != selectedCountry -->
                compared to
                <span style="color:white; font-weight:bold; font-style:normal"
                  ><slot name="refVal" selectedCountry={$referenceCountry} /></span
                >
                in
                <span class="ref">{$_(`country.${$referenceCountry?.toLowerCase()}`)}</span>, your highlight country.
                <span
                  class="link"
                  role="button"
                  on:click={() => ($referenceCountry = selectedCountry)}
                  on:keypress={() => ($referenceCountry = selectedCountry)}
                >
                  →&nbsp;{$_(`header.refcountry.button.switch`, { default: 'Switch to' })}
                  {$_(`country.${selectedCountry.toLowerCase()}`)}</span
                >&nbsp;
                <div class="summary">
                  <div class="bg" aria-label="footnote"><label class="footnote" aria-hidden="true" for="info">i</label></div>
                  <input type="checkbox" role="switch" aria-label="read footnote" id="info" />
                  <div class="details">
                    <span class="ref">{$_(`country.${$referenceCountry.toLowerCase()}`)}</span> will be highlighted in visualizations across
                    the Atlas wherever data for it is available. You can change it by using the <ReferenceFlag /> in the header.
                  </div>
                </div>
              {:else if $referenceCountry && selectedCountry === $referenceCountry}
                <!-- refCountry == selectedCountry -->
                <span class="ref">{$_(`country.${$referenceCountry.toLowerCase()}`)}</span> is your highlight country.&nbsp;
                <div class="summary">
                  <div class="bg" aria-label="footnote"><label class="footnote" aria-hidden="true" for="info">i</label></div>
                  <input type="checkbox" role="switch" aria-label="read footnote" id="info" />
                  <div class="details">
                    <span class="ref">{$_(`country.${$referenceCountry.toLowerCase()}`)}</span> is currently highlighted in visualizations
                    across the Atlas wherever data for it is available. You can change it by using the <ReferenceFlag /> in the header.
                  </div>
                </div>
              {:else if !$referenceCountry && !selectedCountry}
                Select a highlight country using the <ReferenceFlag /> in the header.&nbsp;
                <div class="summary">
                  <div class="bg" aria-label="footnote"><label class="footnote" aria-hidden="true" for="info">i</label></div>
                  <input type="checkbox" role="switch" aria-label="read footnote" id="info" />
                  <div class="details">
                    The country you choose will be highlighted in visualizations across the Atlas wherever data for it is available.
                  </div>
                </div>
              {:else if selectedCountry && !$referenceCountry}
                Select a highlight country using the <ReferenceFlag /> in the header or
                <span
                  class="link"
                  role="button"
                  on:click={() => ($referenceCountry = selectedCountry)}
                  on:keypress={() => ($referenceCountry = selectedCountry)}
                >
                  →&nbsp;{$_(`header.refcountry.button.choose`, { default: 'Choose' })}
                  {$_(`country.${selectedCountry.toLowerCase()}`)}.</span
                >&nbsp;
                <div class="summary">
                  <div class="bg" aria-label="footnote"><label class="footnote" aria-hidden="true" for="info">i</label></div>
                  <input type="checkbox" role="switch" aria-label="read footnote" id="info" />
                  <div class="details">
                    The country you choose will be highlighted in visualizations across the Atlas wherever data for it is available.
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
    <div class="legend-container" class:visible={isGlobeReady}>
      <slot name="legend" />
    </div>
  {:else if browser}
    <Globe width={globeWidth} height={globeHeight} bind:selectedCountry />
  {/if}
</div>

<style>
  .summary {
    vertical-align: middle;
  }
  .summary input:checked ~ div.details {
    border-top: 1px solid var(--color-grey-400);
    border-bottom: 1px solid var(--color-grey-400);
    font-style: italic;
    font-size: unset;
    padding: var(--space-xs) 0;
    margin: var(--space-s) 0;
  }

  .link {
    color: var(--color-theme-dark-primary);
    cursor: pointer;
  }

  .link:hover {
    text-decoration: underline;
  }

  .compare {
    font-size: var(--font-size-s);
    color: var(--color-theme-dark-text-weaker);
    font-style: italic;
    line-height: 145%;
  }

  .compare .number {
    font-weight: var(--font-weights-semibold);
  }

  .compare :global(.additional) {
    display: none;
  }
  .globe-container {
    width: calc(50vw - 66px);
    position: absolute;
    right: 0;
    top: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--color-theme-dark-text);
    height: 100%;
    padding-top: var(--space-xl);
  }
  .globe-container.screenshotting {
    left: 220px;
    padding-top: 0;
  }

  .globier-container {
    position: relative;
    width: 100%;
    display: flex;
    max-height: var(--max-globe-width);
  }
  .legend-container {
    width: var(--globe-width);
    height: 80px;
    text-align: center;
    font-size: var(--font-size-s);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    row-gap: var(--space-xs);
  }

  .reference-container {
    position: absolute;
    right: 0;
    top: 0;

    width: 500px;
    height: var(--space-4xl);
    color: var(--color-theme-dark-text);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  /*
  .reference-container {
    order: -1;
    position: sticky;
    z-index: 3;
    top: var(--loop-header-height);
    align-self: flex-end;
  }
  .reference-container.floaty {
    position: fixed;
    top: var(--loop-header-height);
  }
  .reference-container.hidden {
    display: none;
  }
*/
  .inst-container {
    padding: var(--space-xs) 0;
    display: flex;
    flex-direction: column;
    row-gap: var(--space-xs);
    font-style: italic;
    color: var(--color-theme-dark-text-weaker);
    min-height: 80px;
    font-size: var(--font-size-s);
  }
  .inst-container :global(flag) {
    height: 17px;
    min-width: 17px;
  }

  .inst-container label {
    font-style: normal;
  }
  .ref {
    text-transform: uppercase;
    font-style: normal;
    font-weight: var(--font-weights-semibold);
    color: var(--color-reference-country);
  }

  .value-container {
    color: var(--color-theme-dark-text);
    z-index: 2;
    background-color: #100e2baa;
    width: var(--col-3);
    min-width: var(--col-3);
    margin-right: var(--space-m);
    padding: var(--space-xs);
    align-self: flex-end;
  }
  .legend-container,
  .value-container {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease-in-out;
  }
  .legend-container.visible,
  .value-container.visible {
    opacity: 1;
    pointer-events: all;
  }

  .refcountry {
    color: var(--color-reference-country);
  }

  .reference-label {
    line-height: 120%;
  }

  .value-container :global(.additional) {
    pointer-events: none;
    text-transform: uppercase;
    font-size: var(--font-size-m);
    line-height: 0%;
    padding: 0 0 var(--space-m) 0;
    font-weight: var(--font-weights-regular);
    letter-spacing: var(--letter-spacing-5);
    color: var(--color-theme-dark-text-weaker);
  }

  .value-container :global(.units) {
    font-size: var(--font-size-l);
    padding-left: var(--space-2xs);
    line-height: 100%;
  }

  .value-container :global(.prefix) {
    font-size: var(--font-size-2xl);
    padding-right: var(--space-2xs);
    line-height: 100%;
  }

  .value-container .compare :global(.units),
  .value-container .compare :global(.prefix) {
    font-size: var(--font-size-s);
  }

  .value-container :global(.reference-value) {
    font-family: var(--font-families-andes);
    font-size: var(--font-size-4xl);
    line-height: 100%;
    padding-top: var(--space-s);
    display: inline-block;
  }
  .value-container :global(.reference-value span) {
    line-height: 100%;
  }

  .value-container .ref-data-description {
    line-height: 145%;
    font-size: var(--font-size-s);
  }

  button {
    color: var(--color-theme-dark-text);
    font-size: var(--font-size-s);
    width: 100%;
  }
  button:hover {
    color: var(--color-theme-dark-text);
  }

  @media screen and (max-width: 1024px) {
    .globe-container {
      width: 100%;
      max-width: var(--max-globe-width);
      padding: var(--space-l) var(--space-m) var(--space-l) var(--space-m);
      align-items: center;
      position: static;
    }

    .globier-container {
      align-items: flex-end;
      max-width: var(--max-globe-width);
      margin-bottom: var(--space-m);
    }
    .value-container {
      position: static;
      margin: 0;
      width: var(--col-3);
    }

    .reference-container {
      order: -1;
      position: sticky;
      z-index: 3;
      top: var(--loop-header-height);
      align-self: flex-end;
    }
    .reference-container :global(.ref-data-description),
    .value-container :global(.ref-data-description) {
      padding-bottom: 0;
    }
  }
  @media screen and (hover: none) {
    .reference-container {
      top: 50px;
      right: 0px;
      width: 480px;
    }
  }
  @media screen and (max-width: 872px) {
    .selector {
      display: block;
    }
    .reference-container {
      margin: 0;
      width: 100vw;
      transform: translate(0, -200px);
      top: calc(var(--loop-header-height));
      position: sticky;
      right: 0;

      height: 0;
      transition: transform 0.5s;
    }
    .reference-container.open {
      transform: translate(0, 0);
    }
    .triangle-up {
      display: none;
    }
  }
  @media screen and (max-height: 750px) {
    /*  .reference-container {
      top: 0;
    }*/
  }
  @media screen and (max-width: 872px), (max-height: 599px) {
    .value-container {
      position: static;
      margin: 0;
      min-width: 50%;
    }
    .inst-container {
      min-height: 40px;
    }

    .reference-container {
      top: var(--loop-header-height);
    }
  }
</style>
