<script>
  import { _ } from 'svelte-i18n';
  import { faDownload, faImage, faTable, faLink, faCheck } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa/src/fa.svelte';

  import { activeGoal } from '$lib/stores/activeGoal';
  import { isScreenshotting } from '$lib/stores/isScreenshotting';
  import { ColorVisBinaryNeg, ColorVisBinaryPos } from '$lib/styles/tokens.es6';

  import { browser } from '$app/environment';
  import Loading from './Loading.svelte';
  import ScreenshotFooter from './ScreenshotFooter.svelte';

  export let title;
  export let subtitle;
  export let source;
  export let note;
  export let visdescription;
  export let size = 'content';
  export let hide_download = false;

  export let inScroller = false;
  export let theme;
  export let dataDownloadUrl;
  export let shareUrl;
  export let shareImg;
  export let shareTitle;
  export let graphic;

  let w, h;
  let parentWidth = 0;
  let parentHeight = 0;
  let imageDownload = false;
  $: parentWidth = w;
  $: parentHeight = h;

  let mousePos;
  let toastMode = false;
  let toastTimer = null;
  let copyLinkEl;
  const TOAST_TIMEOUT = 1700;

  function copyShareURLToClipboard() {
    navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.clipboard.writeText(shareUrl);
        toastMode = true;

        clearTimeout(toastTimer);
        setTimeout(() => {
          toastMode = false;
          mousePos = null;
        }, TOAST_TIMEOUT);
      }
    });
  }

  function showTooltip(evt) {
    if (copyLinkEl) {
      const copyElBounds = copyLinkEl.getBoundingClientRect();
      mousePos = { x: copyElBounds.x, y: copyElBounds.y };
      console.log(mousePos);
    }
  }

  function hideTooltip() {
    if (!toastMode) {
      mousePos = null;
    }
  }
</script>

<div
  class={`${graphic} vis-container ${inScroller ? '' : size}`}
  class:in-scroller={inScroller === true}
  class:is-screenshotting={$isScreenshotting}
  style="--goal-color : var(--color-un-sdg{$activeGoal.number})"
>
  <div class="internal-container">
    {#if title || subtitle}
      <div class="title-container">
        {#if title}
          <h1>{title}</h1>
        {/if}
        {#if subtitle}
          <!--<hr class="top" />-->
          <h2>{@html subtitle}</h2>
        {/if}
      </div>
    {/if}
    <div
      class="vis"
      bind:clientWidth={w}
      bind:clientHeight={h}
      role="img"
      aria-label={visdescription ? visdescription : $_('alt.chart') + ' ' + subtitle}
    >
      {#if !browser}
        <Loading />{/if}

      {#if parentWidth !== undefined && parentHeight !== undefined}
        <slot name="graphic" {parentWidth} {parentHeight} />
        <svg width="0px" height="0px">
          <defs>
            <pattern
              id="diagonalHatch"
              width="100px"
              height="5px"
              patternUnits="userSpaceOnUse"
              patternContentUnits="userSpaceOnUse"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              patternTransform="rotate(-45)"
            >
              <line x1="0" x2="100" y1="50" y2="50" stroke-width="10" style="stroke: var(--color-grey-400);" />
            </pattern>

            <pattern id="tightHatch" patternUnits="userSpaceOnUse" width="4" height="4">
              <path
                class="visible"
                d="M-1,1 l2,-2
         M0,4 l4,-4
         M3,5 l2,-2"
                style="stroke: var(--color-grey-800);"
              />
            </pattern>

            <marker id="arrowhead_pos" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={ColorVisBinaryPos} />
            </marker>

            <marker id="arrowhead_neg" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={ColorVisBinaryNeg} />
            </marker>

            <marker id="arrowhead-large" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
              <polygon points="0 0, 5 2.5, 0 5" stroke-width={0} />
            </marker>
          </defs>
        </svg>
      {/if}
    </div>

    {#if !$isScreenshotting}
      <div class="source">
        {#if note}
          <span class="note">{$_('note', { default: 'Note:' })} {@html note}</span>
        {/if}
        <span class="download-share">
          <span class="download" class:borderless={!note}>
            {#if dataDownloadUrl && !hide_download}<a
                class="download-icon"
                data-customlink={`download:vis-data-${title}`}
                href={dataDownloadUrl}
                aria-label={$_('alt.download.data')}
                ><span aria-hidden="true" class:hidden={!dataDownloadUrl && !imageDownload}>{$_('data.download')}</span><Fa
                  icon={faDownload}
                /></a
              >{/if}
            {#if imageDownload}
              <a class="download-icon" href={shareImg} target="_blank" rel="noreferrer" aria-label={$_('alt.download.image')}
                ><Fa icon={faImage} /></a
              >
            {/if}
          </span>
          {#if shareUrl && false}
            <!--get Share icons back-->
            <span class="share" class:borderless={!note && !dataDownloadUrl && !imageDownload}
              ><ShareIcons {shareUrl} title={shareTitle} /></span
            >
          {/if}
          <span class="share" class:borderless={!note && (!dataDownloadUrl || hide_download) && !imageDownload}
            ><a
              on:click={copyShareURLToClipboard}
              alt="Copy link to clipboard"
              on:mouseover={showTooltip}
              on:mouseout={hideTooltip}
              bind:this={copyLinkEl}
            >
              <span aria-hidden="true">{$_('copy.link', { default: 'Copy Link' })}</span><Fa icon={faLink} /></a
            ></span
          >
        </span>
        {#if mousePos || toastMode}
          <p class="toast" class:disappearing={toastMode} aria-hidden="true">
            {#if toastMode}{$_('link.copied', { default: 'Link copied to clipboard' })} <Fa icon={faCheck} />{:else}{$_('click.copy', {
                default: 'Click to copy link'
              })}
              <Fa icon={faLink} />{/if}
          </p>
        {/if}
      </div>
      {#if source}
        <p class={`source-text`}>{$_('source', { default: 'Source:' })} {@html source}</p>
      {/if}
    {:else}
      <ScreenshotFooter {note} {source} {theme} />
    {/if}
  </div>
</div>

<style type="scss">
  .vis-container {
    min-height: 0;
    height: 100%;
    width: 100%;
    max-width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;

    margin: var(--space-3xl) auto;

    .internal-container {
      height: 100%;
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    &.in-scroller {
      margin: 0;
      max-height: min(var(--max-vis-height), 100%);
      .internal-container {
        margin: 0;
      }
    }

    &.main {
      margin: var(--space-xl) 0;
      .internal-container {
        width: var(--col-8);
      }
    }

    &.content {
      background-color: var(--color-theme-bg-weaker);
      padding-top: var(--space-l);

      .internal-container {
        width: var(--col-12);
      }
    }

    &.full {
      background-color: var(--color-theme-bg-weaker);
      .source,
      h1,
      h2,
      .source-text {
        padding-left: var(--space-xs);
        padding-right: var(--space-xs);
      }
    }

    &.is-screenshotting {
      .internal-container {
        padding: 0 var(--space-m) 0 var(--space-m);
      }
    }
    .note {
      font-size: var(--font-size-s);
      text-align: right;
      color: var(--color-theme-text-weaker);
    }
  }

  :global(.fullScreen) .vis-container.in-scroller {
    max-height: 100%;
    padding: var(--loop-header-height) 0 0 0;

    &.is-screenshotting {
      max-height: 1500px;
      padding: 0;
    }

    .source {
      margin-top: 0;
      padding-left: var(--space-xs);
      padding-right: var(--space-xs);
    }

    h1,
    h2,
    .source-text {
      padding-left: var(--space-xs);
      padding-right: var(--space-xs);
    }
  }

  .vis {
    flex: 1;
    pointer-events: all;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;

    /*direct children of .vis (the visualization components) */
    & > :global(*) {
      /* height: fit-content; */
    }
  }
  .title-container {
    margin: var(--space-l) 0 var(--space-m) 0;
  }
  p {
    color: var(--color-theme-text-weaker);
    font-family: var(--font-families-open-sans);
    letter-spacing: var(--letter-spacing-0);
    font-size: var(--font-size-s);
    font-weight: var(--font-weights-regular);
    margin-top: var(--space-xs);
    margin-bottom: var(--space-xs);
    text-align: right;
    width: 100%;
  }

  .source {
    display: flex;
    justify-content: flex-end;

    border-top: 1px solid var(--color-grey-200);
    padding: var(--space-xs) 0;
    margin-top: var(--space-m);
    position: relative;
  }

  .source .download,
  .source .share {
    border-left: 1px solid var(--color-theme-text-weaker);
    margin-left: var(--space-s);
    padding-left: var(--space-s);
    pointer-events: all;

    white-space: nowrap;
  }
  .source .note {
    pointer-events: all;
  }

  .source .download.borderless,
  .source .share.borderless {
    border-left: none;
  }

  .source :global(.svelte-fa),
  .toast :global(.svelte-fa) {
    padding-left: var(--space-2xs);
    display: inline-block;
    cursor: pointer;
  }

  .source .download .download-icon {
    color: var(--color-theme-primary);
  }
  .source .download .download-icon:hover {
    color: var(--color-theme-primary-stronger);
  }
  .source-text {
    margin-top: 0;
    pointer-events: all;
  }

  .download-share {
    display: inline-block;
    white-space: nowrap;
    text-align: right;
  }

  .toast {
    position: absolute;
    top: 0px;
    right: 0px;

    transform: translate(0, calc(-100% - var(--space-xs)));

    background-color: var(--color-theme-bg-weakest);
    color: var(--color-theme-text-weaker);
    padding: var(--space-2xs);
    font-size: var(--font-size-s);
    opacity: 1;
    transition: opacity 1s 0.7s;
    white-space: nowrap;
    width: fit-content;

    &.disappearing {
      opacity: 0;
    }
  }

  h1,
  h2 {
    text-align: center;
  }

  h1 {
    font-weight: var(--font-weights-regular);
    font-family: var(--font-families-andes);
    line-height: var(--line-heights-auto);
    font-size: var(--font-size-l);
    letter-spacing: var(--letter-spacing-5);
  }

  h2 {
    font-family: var(--font-families-open-sans);
    font-size: var(--font-size-m);
    margin-top: var(--space-2xs);
    color: var(--color-theme-text-weaker);
    letter-spacing: var(--letter-spacing-0);
  }

  hr {
    border-top: 1px solid var(--color-grey-200);
    margin: 0;
    margin-top: var(--space-s);
  }

  @media screen and (max-height: 750px) {
    .title-container {
      margin: var(--space-s) 0 var(--space-xs) 0;
    }
    h2 {
      margin-top: 0;
    }
    .source {
      margin-top: var(--space-s);
    }
  }

  @media screen and (max-height: 1074px) {
    .in-scroller .source-text {
      display: none;
    }
  }

  @media screen and (max-width: 872px) {
    .vis-container {
      padding: 0;

      &.content {
        padding: 0;
      }
      &.in-scroller {
        max-height: calc(100%);
        margin: 0;
        padding: 0;

        .source {
          position: static;
        }
      }

      &.full {
        padding: 0;
      }
    }

    .source {
      position: static;
      flex-direction: column;
    }

    .source .download {
      border-left: 0;
    }
  }
</style>
