<script>
  import { _ } from 'svelte-i18n';

  import { activeGoal } from '$lib/stores/activeGoal';
  import { isScreenshotting } from '$lib/stores/isScreenshotting';
  import DynamicScroller from './DynamicScroller.svelte';
  import { onMount } from 'svelte';
  import VisContainer from './VisContainer.svelte';

  export let data;
  export let title;
  export let subtitle;
  export let source;
  export let note;
  export let graphic;
  export let visdescription;
  export let theme = 'light';
  export let visSize = 'default';
  export let publish_progress = false;

  export let scenes = [];
  export let dataDownloadUrl;
  export let shareUrl;
  export let shareImg;
  export let shareTitle;

  let index = 0;
  let activeTitle = title;
  let activeSubtitle = subtitle;
  let activeSource = source;
  let activeNote = note;

  let progress = 0;
  let offset = 0;

  let activeScene;

  // only send out progress+offset if requested:
  $: if (publish_progress) activeScene = { progress, index, id: scenes?.[index]?.id, offset };
  $: if (!publish_progress) activeScene = { index, id: scenes?.[index]?.id };

  $: activeShareUrl = scenes[activeScene.index]?.shareUrl;
  $: activeShareImg = scenes[activeScene.index]?.shareImg;

  // update (sub-)titles based on scenes:
  $: {
    let newTitle, newSubtitle, newSource, newNote;
    for (let i = index; i >= 0; i += -1) {
      if (!newTitle && scenes?.[i]?.title) {
        newTitle = scenes?.[i]?.title;
      }
      if (!newSubtitle && scenes?.[i]?.subtitle) {
        newSubtitle = scenes?.[i]?.subtitle;
      }
      if (!newSource && scenes?.[i]?.source) {
        newSource = scenes?.[i]?.source;
      }
      if (!newNote && scenes?.[i]?.note) {
        newNote = scenes?.[i]?.note;
      }
    }

    if (!newTitle) newTitle = title;
    if (!newSubtitle) newSubtitle = subtitle;
    if (!newSource) newSource = source;
    if (!newNote) newNote = note;

    activeTitle = newTitle;
    activeSubtitle = newSubtitle;
    activeSource = newSource;
    activeNote = newNote;
  }
</script>

<div class={'side-by-side layout-full ' + theme + ' ' + visSize} style="--goal-color : var(--color-un-sdg{$activeGoal.number})">
  <div class="scroller-container">
    <DynamicScroller bind:index query={'.scene'} expected={scenes?.length} bind:progress bind:offset>
      <div class="left" class:screenshot={$isScreenshotting} slot="background">
        <VisContainer
          title={activeTitle}
          subtitle={activeSubtitle}
          source={activeSource}
          note={activeNote}
          {visdescription}
          {dataDownloadUrl}
          shareUrl={activeShareUrl}
          shareImg={activeShareImg}
          {shareTitle}
          {graphic}
          inScroller
          {theme}
          let:parentWidth
          let:parentHeight
        >
          <slot name="graphic" {activeScene} {data} slot="graphic" {parentWidth} {parentHeight} />
        </VisContainer>
      </div>
      <div class="right" slot="foreground">
        <div class="right-inner">
          <slot name="scenes" {activeScene} />
        </div>
      </div>
    </DynamicScroller>
    {#if source}
      <p class={`source-text`}>{$_('source', { default: 'Source:' })} {@html source}</p>
    {/if}
  </div>
</div>

<style type="text/scss">
  .side-by-side {
    margin: var(--space-3xl) 0 var(--space-3xl) 0;
    // background-color: var(--color-theme-bg-weaker);
    // background: linear-gradient(90deg, var(--color-theme-bg-weaker) 80%, var(--color-theme-bg-weakest) 20%);
    background-color: var(--color-theme-bg-weaker);
    &.dark {
      background-color: var(--color-theme-dark-bg);
    }

    .scroller-container {
      max-width: 1920px;
      margin: 0 auto;
    }

    :global(svelte-scroller-foreground) {
      pointer-events: none;
    }
  }

  .left {
    width: 75%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--color-theme-text);
    padding: var(--loop-header-height) 0 0 var(--space-s-m);
  }
  .left.screenshot {
    padding-top: 0px;
  }

  .right {
    float: right;
    padding: var(--space-m);
    width: 25%;
  }

  .right-inner {
    width: var(--col-4);
    max-width: min(100%, var(--col-4));
    text-overflow: ellipsis;

    display: flex;
    flex-direction: column;
  }

  p.source-text {
    color: var(--color-theme-text-weaker);
    font-family: var(--font-families-open-sans);
    letter-spacing: var(--letter-spacing-0);
    font-size: var(--font-size-s);
    font-weight: var(--font-weights-regular);
    margin-top: 0;

    text-align: right;

    width: 75%;
    padding: 0 0 var(--space-s) var(--space-s-m);
  }

  /*Fullscreen scroller*/

  .fullScreen {
    :global(.background-container) {
      z-index: 0 !important;
    }

    .right {
      width: 100%;
      margin: 0;
      background: none;
    }
    .left {
      width: 100%;
      margin: 0;
      height: calc(100vh);
      padding: 0;

      :global(.source) {
        padding-right: var(--space-xs);
      }
    }

    .right-inner {
      width: var(--col-8);
      max-width: var(--col-8);
      pointer-events: none;
      z-index: 99 !important;
      margin: 0 auto;

      :global(.scene .content) {
        pointer-events: none;
        background-color: #ffffffdd;
      }
    }
    .scroller-container {
      max-width: 100%;
      margin: 0;
    }
    p.source-text {
      width: 100%;
      padding-right: var(--space-xs);
    }
    :global(hr) {
      display: none;
    }
    :global(.vis-container.in-scroller) {
      max-height: 100%;
    }
  }

  .dark {
    :global(.title-container) {
      color: var(--color-theme-dark-text);
    }
    :global(.title-container h2),
    :global(p.source-text) {
      color: var(--color-theme-dark-text-weaker);
    }
    :global(.source a),
    :global(.source-text a) {
      color: var(--color-theme-dark-primary);
    }
  }

  @media screen and (min-height: 1075px) {
    .source-text {
      display: none;
    }
  }

  @media screen and (max-width: 1024px) {
    :global(.background-container) {
      z-index: 0 !important;
    }

    .left,
    .right {
      width: 100%;
      margin: 0;
    }
    .left {
      height: calc(100vh);
      padding: var(--loop-header-height) var(--space-s-m) 0 var(--space-s-m);
      margin: 0;
      // box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.25);
    }
    .right {
      background: none;
    }

    p.source-text {
      width: 100%;
      padding: 0 var(--space-s-m) var(--space-s) var(--space-s-m);
    }

    .right-inner {
      width: 100%;
      max-width: var(--col-8);
      pointer-events: none;
      z-index: 99 !important;
      margin: 0 auto;
    }

    .fullScreen .right-inner {
      width: 100%;
      max-width: var(--col-8);
      margin: 0 auto;
    }
  }
</style>
