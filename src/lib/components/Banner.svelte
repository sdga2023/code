<script>
  import { _ } from 'svelte-i18n';
  import BannerTargets from './BannerTargets.svelte';
  import GlobeContainer from './GlobeContainer.svelte';
  import { base } from '$app/paths';
  import { isScreenshotting } from '$lib/stores/isScreenshotting';
  import chapters from '../../data/chapters';

  import { referenceCountry } from '$lib/stores/referenceCountry.js';

  export let goal;
  export let headline;
  export let introtext;
  export let targets_covered;
  export let source;

  export let country_data_label;

  $: number = goal < 10 ? '0' + goal : goal;

  let GoalGlobeComponent;

  let isGlobeReady = false;

  // store previous props when switching globe legend:
  let legendProps = {};
  let active_country_data_label = '';

  $: if (isGlobeReady) {
    legendProps = $$props;
    active_country_data_label = country_data_label;
  }

  $: {
    (async () => {
      isGlobeReady = false;
      GoalGlobeComponent = (await import(`./banner/Goal${number ? number : '000'}Banner.svelte`)).default;
      isGlobeReady = true;
    })();
  }

  function handleSmoothScroll(event) {
    event.preventDefault();
    const anchor = document.querySelector('[name=page-start]');
    window.scrollTo({ top: anchor?.offsetTop, behavior: 'smooth' });
  }
</script>

<div name="top" class="banner" style="--goal-color: var(--color-un-sdg{$_(`${goal}`)})" class:screenshotting={$isScreenshotting}>
  {#if !$isScreenshotting}
    <div class="text">
      <div class="title-container">
        <div class="goal-title">
          <p class="goal">{goal}</p>
          <h1 class="title">{$_(`goal${number}.title`, { default: chapters?.[goal]?.title })}</h1>
        </div>

        <h2 class="story-title">{headline}</h2>
      </div>
      <GlobeContainer {source} country_data_label={active_country_data_label} let:selectedCountry {isGlobeReady}>
        <svelte:component this={GoalGlobeComponent} {...legendProps} type="legend" slot="legend" {selectedCountry} />
        <svelte:component this={GoalGlobeComponent} {...legendProps} type="reference-value" slot="reference-value" {selectedCountry} />
        <svelte:component
          this={GoalGlobeComponent}
          {...legendProps}
          type="reference-value"
          slot="refVal"
          selectedCountry={$referenceCountry}
        />
      </GlobeContainer>

      <div class="intro-container">
        <p class="intro">{@html introtext}</p>
        {#if targets_covered}<BannerTargets targets={targets_covered} />{/if}
      </div>
    </div>
  {:else}
    <GlobeContainer {source} country_data_label={active_country_data_label} let:selectedCountry {isGlobeReady} />
    <div class="logo-container">
      <img title="logo" class="atlas-logo" alt="logo" src="{base}/assets/external/loop-header-footer/img/logo-atlas-dark.svg" />
    </div>
    <img title="logo" class="wb-logo" alt="logo" src="{base}/assets/external/loop-header-footer/img/logo-wb-header-en-grey.svg" />
  {/if}
</div>
{#if !$isScreenshotting}
  <a href="#page-start" on:click={handleSmoothScroll}><p class="read">↓ Read the full story</p></a>
  <div class="banner-bottom">
    <div class="logos">
      <img title="logo" alt={$_(`alt.sdgfund`)} src="{base}/assets/external/loop-header-footer/img/SDG-Fund-Logo.svg" />
      <img title="logo" alt={$_(`alt.wdi`)} src="{base}/assets/external/loop-header-footer/img/WDI-Logo.svg" />
      <img title="logo" alt={$_(`alt.kdi`)} src="{base}/assets/external/loop-header-footer/img/KDI-School-Logo.png" />
    </div>
    {#if isGlobeReady}<p class="source-text">
        {$_('globe.source', { default: 'Globe data source' })}: {@html source}
      </p>{/if}
  </div>
{/if}

<style>
  .banner {
    position: relative;
    background-color: var(--color-theme-dark-bg);
    width: 100%;
    min-height: 70vh;
    padding: var(--space-xl) 0 var(--space-l) 0;
    display: flex;
    align-items: center;
    justify-content: center;
    align-content: center;
  }
  .banner.screenshotting {
    justify-content: flex-start;
    padding-left: 7vw;

    height: 1260px;
    max-height: 1260px;
  }
  .banner.screenshotting .logo-container {
    position: absolute;
    width: 60vw;
    right: 7vw;

    padding: 2vw;
    background-color: #100e2ba0;
  }
  .banner.screenshotting .logo-container .atlas-logo {
    width: 100%;
  }
  .banner.screenshotting .wb-logo {
    position: absolute;
    right: 7vw;
    bottom: var(--space-3xl);
    margin-right: 2vw;

    width: 25%;
    float: right;
  }

  .text {
    display: flex;
    width: 50vw;
    justify-content: space-around;
    justify-items: center;
    flex-flow: column wrap;
    max-height: 1000px;
    width: var(--col-12);
    column-gap: var(--grid-gutter);
  }
  .title-container,
  .intro-container {
    width: var(--col-6);
  }

  .goal {
    padding-right: var(--space-s);
    color: var(--goal-color);
    letter-spacing: var(--letter-spacing-0);
    font-size: var(--font-size-4xl);
    line-height: var(--line-heights-100);
    font-family: var(--font-families-andes);
    font-weight: var(--font-weights-regular);

    /* height: 800px; */
    /* text-shadow: 2.5px 2.5px 0px var(--color-theme-dark-text);*/
  }

  .title {
    text-transform: var(--text-case-uppercase);
    line-height: var(--line-heights-120);
    font-weight: var(--font-weights-regular);
    font-size: var(--font-size-l);
    color: var(--color-theme-dark-text);
    letter-spacing: var(--letter-spacing-5);
    padding-bottom: var(--space-s);
    flex: 1;
  }

  .goal-title {
    display: flex;
    align-items: flex-end;
    border-bottom: 4px solid var(--goal-color);
    margin-bottom: var(--space-s);
  }

  .story-title {
    font-family: var(--font-families-andes);
    font-size: var(--font-size-2xl);
    color: var(--color-theme-dark-text);
    letter-spacing: var(--letter-spacing-0);
    margin-bottom: var(--space-m);
  }

  .intro {
    font-family: var(--font-families-andes);
    font-size: var(--font-size-m);
    line-height: var(--line-heights-175);
    color: var(--color-theme-dark-text);
    font-weight: var(--font-weights-regular);
  }
  .read {
    width: 100%;
    text-align: center;
    background-color: var(--color-theme-dark-bg);
    color: var(--color-theme-dark-text-weaker);
  }
  .banner-bottom {
    background-color: var(--color-theme-dark-bg);
    width: 100%;
    z-index: 3;
    padding: var(--space-xs);
    display: flex;
    justify-content: space-between;
  }
  p.source-text {
    color: var(--color-theme-dark-text-weaker);
    font-family: var(--font-families-open-sans);
    letter-spacing: var(--letter-spacing-0);
    font-size: var(--font-size-s);
    font-weight: var(--font-weights-regular);
    text-align: right;
    flex: 1;
  }
  .logos {
    display: flex;
    gap: var(--space-m);
    flex: 1;
  }
  .logos img {
    height: 30px;
    width: auto;
  }

  @media screen and (max-width: 1024px) {
    .banner {
      flex-direction: column;
      height: fit-content;
      padding: 0;
      max-height: fit-content;
    }

    .text {
      width: 100%;
      flex-direction: column;
      align-items: center;
      padding: 0 0 var(--space-2xl) 0;
      height: fit-content;
      max-height: fit-content;
    }

    .title-container,
    .intro-container {
      text-align: center;
      max-width: var(--col-8);
      width: 100%;
    }
    .title-container {
      margin-top: var(--space-xl);
    }
    .text div {
      order: 1;
    }
    .text .title-container {
      order: 0;
    }
    .story-title {
      margin-bottom: 0;
    }

    .goal-title {
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .goal {
      padding: 0;
      text-align: center;
      order: -1;
    }
    p.source-text {
      position: static;
      max-width: 100vw;
    }
    .logos {
      top: 0;
    }
  }
  @media screen and (hover: none) {
    .logos {
      top: 50px;
    }
  }
  @media screen and (max-width: 1440px) {
    .banner {
      min-height: 700px;
    }
  }
  @media screen and (max-height: 750px) {
    .banner {
      min-height: 550px;
    }
  }
  @media screen and (max-width: 872px) {
    .banner {
      padding: var(--loop-header-height) 0 0 0;
    }
    .title-container {
      margin-top: var(--space-4xl);
    }

    .logos {
      top: 50px;
      display: none;
    }
  }
</style>
