<script>
  import { _ } from 'svelte-i18n';
  import { faImage, faXmark } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa/src/fa.svelte';

  export let imagePath;
  export let chart;
  export let close;

  function downloadImage(imgUrl) {
    fetch(imgUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
      });
  }
</script>

<div class="overlay-graphic">
  <div class="header">
    <p class="target">
      <span class="goal-target">{$_('base.sdg')} {$_('base.target')}</span>
      {chart.target}
    </p>
    <div class="close-button" on:click={close}><Fa icon={faXmark} size="xs" /></div>
  </div>
  {#if chart.title || chart.subtitle}
    <div class="title-container">
      {#if chart.title}
        <h1>{chart.title}</h1>
      {/if}
      {#if chart.subtitle}
        <h2>{chart.subtitle}</h2>
      {/if}
    </div>
  {/if}
  {#if chart.image}
    <div class="graphic">
      <img src={imagePath + chart.image} />
    </div>
  {/if}
  {#if chart.note}
    <hr />
    <p class="note">* {@html chart.note}</p>
  {/if}
  <hr />
  <p class="source">
    <span class="source-text">{$_('source', { default: 'Source:' })} {@html chart.source}</span>
    <span class="download"
      >{$_('download').toUpperCase()}
      <span class="download-icon" on:click={() => downloadImage(imagePath + chart.image)}> <Fa icon={faImage} /></span>
    </span>
  </p>
</div>

<style>
  .overlay-graphic {
    width: 800px;
    max-width: 80vw;
    height: auto;

    margin: auto;

    background-color: white;
  }

  .header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: var(--space-s-m) var(--space-s-m) var(--space-s) var(--space-s-m);
  }

  .close-button {
    cursor: pointer;
    width: 25px;
    height: 25px;
    text-align: center;
    font-size: 25px;
    line-height: 60%;
    background-color: var(--color-theme-bg-weakest);
    color: var(--color-theme-primary);
    border-radius: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .close-button:hover {
    background-color: var(--color-theme-primary);
    color: var(--color-theme-bg);
  }

  hr {
    border-top: 1px solid var(--color-grey-200);
    margin: 0;
  }

  .title-container {
    padding: 0 var(--space-s-m) var(--space-m) var(--space-s-m);
  }

  .graphic {
    padding: var(--space-m);
    background-color: var(--color-theme-bg-weaker);
  }
  .graphic img {
    mix-blend-mode: multiply;
  }

  h1,
  h2 {
    text-align: left;
  }

  h1 {
    font-weight: var(--font-weights-regular);
    font-family: var(--font-families-andes);
    line-height: var(--line-heights-auto);
    font-size: var(--font-size-l);
    letter-spacing: var(--letter-spacing-5);
    margin-bottom: var(--space-2xs);
  }

  h2 {
    font-family: var(--font-families-open-sans);
    font-size: var(--font-size-m);
    color: var(--color-theme-text-weaker);
    letter-spacing: var(--letter-spacing-0);
  }

  p.target {
    color: var(--color-theme-primary);
    font-weight: var(--font-weights-semibold);
    text-transform: uppercase;
  }

  p.note,
  p.source {
    color: var(--color-theme-text-weaker);
    font-family: var(--font-families-open-sans);
    letter-spacing: var(--letter-spacing-0);
    font-size: var(--font-size-s);
    font-weight: var(--font-weights-regular);
    margin-top: var(--space-s);
    padding: 0 var(--space-s-m) var(--space-s) var(--space-s-m);

    width: 100%;
  }

  .note {
    text-align: left;
    font-style: italic;
  }

  p.source {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    text-align: right;
  }

  p.source .download,
  p.source .share {
    border-left: 1px solid var(--color-theme-text-weaker);
    margin-left: var(--space-s);
    padding-left: var(--space-s);
    pointer-events: all;
    color: var(--color-theme-primary);
    white-space: nowrap;
  }

  p.source .download :global(.svelte-fa) {
    padding-left: var(--space-2xs);
    display: inline-block;
    cursor: pointer;
  }

  p.source .download .download-icon {
    color: var(--color-theme-primary);
  }
  p.source .download .download-icon:hover {
    border-bottom: 1px solid var(--color-theme-primary);
  }

  @media screen and (max-width: 872px) {
    .overlay-graphic {
      width: calc(100% - 2 * var(--space-xs));
      max-width: 100%;
      margin-bottom: var(--space-xl);

      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .graphic {
      padding: var(--space-s) var(--space-xs);
    }

    p.source {
      flex-direction: column;
      align-items: flex-end;
      text-align: left;
    }

    p.source .download,
    p.source .share {
      border: none;
      padding-top: var(--space-xs);
    }

    .close-button {
      display: none;
    }
  }
</style>
