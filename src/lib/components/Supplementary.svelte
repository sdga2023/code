<script>
  import { activeGoal } from '$lib/stores/activeGoal';
  import { isMobile } from '$lib/stores/isMobile';
  import { isTablet } from '$lib/stores/isTablet';
  import variables from '$lib/variables';
  import { _ } from 'svelte-i18n';
  import vars from '$lib/variables.js';
  import Overlay from './Overlay.svelte';
  import OverlayGraphic from './OverlayGraphic.svelte';
  import ArrowRight from './ArrowRight.svelte';

  export let charts = [];

  $: imagePath = `${variables.pathPrefix}/assets/supplementary/`;

  $: maxCards = $isMobile ? 1 : $isTablet ? 2 : 3;

  let activeChartIndex = -1;
  let currentCard = 0;

  function slideLeft() {
    currentCard--;
    while (currentCard < 0) {
      currentCard += Math.max(1, charts.length - maxCards + 1);
    }
  }

  function slideRight() {
    if (currentCard >= Math.max(0, charts.length - maxCards)) {
      currentCard = 0;
    } else {
      currentCard++;
    }
  }

  function handleKeydown(event) {
    if (activeChartIndex === -1) {
      const { key } = event;
      if (key === 'ArrowLeft') {
        slideLeft();
      }
      if (key === 'ArrowRight') {
        slideRight();
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="supplementary content-full" style="--sdg-color: var(--color-un-sdg{$activeGoal.number})">
  <hr />
  <h1 class="layout-content">
    {$_('supplementary.title')}
    {$_('base.sdg')}
    {$activeGoal.number}<!--: {$_(`${$activeGoal.string}.title`)}-->
  </h1>
  <p class="desc-text">
    {$_('supplementary.description', {
      values: { activeGoal: $activeGoal.number },
      default: `In the charts below you can find more facts about SDG ${$activeGoal.number} targets, which are not covered in this story. The data for these
    graphics is derived from official UN data sources.`
    })}
  </p>

  {#if $isMobile}
    {#each charts as chart}
      <OverlayGraphic {imagePath} {chart} />
    {/each}
  {:else}
    <div class="cards-and-buttons">
      <div class="icon-container">
        {#if charts.length > 3}
          <div
            class="icon"
            style={`background-image: url(${vars.pathPrefix}/assets/icons/arrow-left.svg)`}
            role="button"
            aria-label={$_('alt.slideRight')}
            on:click={slideLeft}
            on:keydown={slideLeft}
          />
        {/if}
      </div>
      <div class="card-container-frame" class:center={charts.length < 3}>
        <div class="card-container" style="--current-card: {currentCard}">
          {#each charts as chart, i}
            <div
              class="card"
              on:click={() => {
                activeChartIndex = i;
              }}
              on:keydown={() => {
                activeChartIndex = i;
              }}
            >
              {#if chart.image}
                <div
                  class="image"
                  role="img"
                  style={`background-image: url(${imagePath + chart.image})`}
                  aria-label="{$_('alt.suppleChart')} {chart.shorttitle}"
                />
              {/if}
              <h3 aria-label="{$_('alt.dataRelated')} {$_('base.sdg')} {$_('base.target')} {chart.target}">
                {$_('base.sdg')}
                {$_('base.target')}
                {chart.target}
              </h3>
              <h2 aria-hidden="true">{chart.shorttitle ? chart.shorttitle : chart.title}</h2>
              <p aria-hidden="true">
                {$_('show.details')}
                <ArrowRight color="var(--color-theme-primary)" />
              </p>
            </div>
          {/each}
        </div>
      </div>
      <div class="icon-container">
        {#if charts.length > 3}
          <div
            class="icon"
            style={`background-image: url(${vars.pathPrefix}/assets/icons/arrow-right.svg)`}
            on:click={slideRight}
            role="button"
            aria-label="slide right"
            on:keydown={slideRight}
          />
        {/if}
      </div>
    </div>
  {/if}

  <Overlay {charts} {imagePath} bind:activeChartIndex />
</div>

<style>
  .supplementary {
    background-color: var(--color-theme-bg-weaker);
    margin: var(--space-4xl) 0 0 0;
    padding-bottom: var(--space-4xl);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  hr {
    width: var(--col-2);
    margin: 0 auto;
    padding-top: var(--space-3xl);
    border-bottom: 0.5px solid var(--color-grey-300);
    border-top: 0;
  }

  h1,
  h2 {
    font-family: var(--font-families-andes);
  }
  h1 {
    font-size: var(--font-size-xl);
    text-align: center;
    margin-bottom: var(--space-m);
    margin-top: var(--space-l);
  }

  .desc-text {
    margin-bottom: var(--space-xl);
    width: var(--col-8);
    text-align: center;
    color: var(--color-theme-text-weaker);
  }

  h2 {
    font-size: var(--font-size-l);
    line-height: var(--line-heights-145);
  }
  h3 {
    font-weight: var(--font-weights-semibold);
    font-size: var(--font-size-m);
    line-height: var(--line-heights-100);
    color: var(--color-theme-primary);

    text-transform: uppercase;
  }

  .cards-and-buttons {
    display: flex;
  }

  .icon {
    width: 30px;
    height: 30px;
    background-color: var(--color-theme-bg-weakest);
    border-radius: 15px;

    flex: 0 0 30px;

    background-repeat: no-repeat;
    background-position: center center;

    box-shadow: 0 0px 0px rgba(0, 0, 0, 0.25);
    transition: 0.25s all;
  }

  .cards-and-buttons .icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    user-select: none;
    margin: 0 var(--space-m);

    background-repeat: no-repeat;
    background-position: center;
  }
  .cards-and-buttons .icon:hover {
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
    transform: scale(1.1);
  }

  .card-container-frame {
    width: calc(var(--col-12) + 2 * var(--space-s));
    padding: 0 var(--space-s);
    overflow-x: hidden;
    justify-content: left;

    display: flex;
  }
  .card-container-frame.center {
    justify-content: center;
  }

  .card-container {
    display: flex;
    justify-content: left;
    padding: var(--space-s) 0 var(--space-s) 0;
    gap: var(--grid-gutter);

    transition: 0.25s transform;
    margin-left: calc(-1 * var(--current-card) * (var(--col-4) + var(--grid-gutter)));
    transition: margin-left 700ms;
  }

  .card {
    background-color: var(--color-theme-bg);

    flex: 0 0;

    display: flex;
    flex-direction: column;
    width: var(--col-4);
    min-width: var(--col-4);
    /* flex-basis: calc(33% - 2 * var(--space-s));*/

    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    box-sizing: border-box;

    cursor: pointer;
    transition: 0.2s all;
  }
  .card:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .card h2,
  .card h3 {
    margin: var(--space-s);
  }
  .card p {
    margin: 0 var(--space-s) var(--space-s) var(--space-s);
  }

  .card h2 {
    height: 4.5em;
    overflow: hidden;
  }

  .card h3 {
    margin-top: var(--space-m);
    margin-bottom: 0;
  }

  .card p {
    text-align: right;
    color: var(--color-theme-primary);
  }

  .card .image {
    width: 100%;
    height: auto;
    aspect-ratio: 4/3;
    background-size: cover;
    background-position: center;
    background-color: var(--color-theme-bg-weaker);
    background-blend-mode: multiply;
  }

  @media screen and (max-width: 872px) {
    .card {
      flex-basis: 100%;
    }
  }

  @media screen and (max-width: 1280px) {
    .card-container-frame {
      width: calc(var(--col-8) + 2 * var(--space-s));
    }
  }
</style>
