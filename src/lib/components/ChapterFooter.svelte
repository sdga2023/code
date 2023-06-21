<script>
  import { _ } from 'svelte-i18n';
  import ShareIcons from './ShareIcons.svelte';
  import { base } from '$app/paths';

  export let goal;
  export let references;
  export let citation;
  export let credits;
  export let inputs;
  export let visuals;
  export let illustration_credits = false;

  export let shareUrl;
  export let shareTitle;

  export let landingPage = false;
  export let acknowledgement = '';

  $: creditsList = credits ? credits.split(',').map((d) => d.trim()) : [];
  $: inputsList = inputs ? inputs.split(',').map((d) => d.trim()) : [];
  $: visualsList = visuals ? visuals.split(',').map((d) => d.trim()) : [];

  $: codeDataLink = landingPage ? `https://github.com/sdga2023` : `https://github.com/sdga2023/data-goal-${goal}`;
</script>

<footer class="content-full" class:landingPage>
  <hr />
  <h1>{landingPage ? $_('acknowledgements', { default: 'Acknowledgements' }) : $_('about.chapter')}</h1>
  <div class="layout-content container">
    <div class="refs">
      {#if !landingPage}
        <h2>{$_('references')}</h2>
        <ol>
          {#each references as reference, i}
            <li>{@html reference?.formatted}</li>
          {/each}
        </ol>
      {:else}
        <p>{acknowledgement}</p>
      {/if}
      <h2>{$_('footer.citation')}</h2>
      <p>{@html citation}</p>
      {#if landingPage}
        <h2>{$_('footer.atlases', { default: 'Previous atlases' })}</h2>
        <a href="https://datatopics.worldbank.org/sdgatlas/archive/2017/" target="_blank" rel="noreferrer">2017</a>&nbsp;&nbsp;
        <a href="https://datatopics.worldbank.org/sdgatlas/archive/2018/" target="_blank" rel="noreferrer">2018</a>&nbsp;&nbsp;
        <a href="https://datatopics.worldbank.org/sdgatlas/archive/2020/" target="_blank" rel="noreferrer">2020</a>
      {/if}
    </div>
    <div class="right">
      {#if !landingPage}
        <h2>{$_('footer.credits')}</h2>
        <h3>{$_('footer.authors', { default: 'Author(s)' })}</h3>
        <ul>
          {#each creditsList as credit}
            <li style="font-weight:var(--font-weights-semibold)">{credit}</li>
          {/each}
        </ul>
        <h3>{$_('footer.visuals')}</h3>
        <ul>
          {#each visualsList as visual}
            <li>{visual}</li>
          {/each}
        </ul>
        <h3>{$_('footer.design')}</h3>
        <ul>
          <li>Alice Thudt</li>
        </ul>
        {#if illustration_credits}
          <h3>{$_('footer.illustrations')}</h3>
          <ul>
            <li>{$_('footer.illustrations.author')}</li>
          </ul>
        {/if}
        <h3>{$_('footer.inputs')}</h3>
        <ul>
          {#each inputsList as input}
            <li>{input}</li>
          {/each}
        </ul>
      {/if}

      <h2 class:no-margin={landingPage}>{$_('share')}</h2>
      <ShareIcons {shareUrl} title={shareTitle} />

      <h2>{$_('download')}</h2>
      <a href={codeDataLink} data-customlink="download:data" target="_blank" rel="noreferrer" class="download"
        >{$_('footer.code.data', { default: 'Data' })}</a
      >
      {#if landingPage}
        &amp;
        <a href={codeDataLink + '/code'} data-customlink="download:code" target="_blank" rel="noreferrer" class="download"
          >{$_('footer.code.code', { default: 'Code' })}</a
        >
      {/if}
      <h2>{$_('license')}</h2>
      <p>{$_('license.wording')}</p>
      <h2>{$_('support.from', { default: 'Supported by' })}</h2>
      <div class="logos">
        <img title="logo" alt={$_(`alt.sdgfund`)} src="{base}/assets/external/loop-header-footer/img/SDG-Fund-Logo-dark.svg" />
        <img title="logo" alt={$_(`alt.wdi`)} src="{base}/assets/external/loop-header-footer/img/WDI-Logo-dark.svg" />
        <img title="logo" alt={$_(`alt.kdi`)} src="{base}/assets/external/loop-header-footer/img/KDI-School-Logo.png" />
      </div>
    </div>
  </div>
</footer>

<style type="scss">
  footer {
    background-color: var(--color-theme-bg-weakest);
    margin: 0;
    padding-bottom: var(--space-3xl);
  }

  footer.landingPage {
    background: none;
  }
  .container {
    display: flex;
    justify-content: space-between;
  }

  .refs {
    width: var(--col-7);
  }
  .right {
    width: var(--col-4);
  }

  hr {
    width: var(--col-2);
    margin: 0 auto;
    padding-top: var(--space-3xl);
    border-bottom: 0.5px solid var(--color-grey-300);
    border-top: 0;
  }

  * {
    grid-column: content;
  }

  li {
    overflow-wrap: break-word;
  }

  h1,
  h2 {
    font-family: var(--font-families-andes);
  }

  h1 {
    font-size: var(--font-size-xl);
    text-align: center;

    margin-top: var(--space-l);
    margin-bottom: var(--space-xl);
  }

  h2 {
    font-size: var(--font-size-m);
    line-height: var(--line-heights-120);
    letter-spacing: var(--letter-spacing-10);
    text-transform: uppercase;
    font-weight: 600;

    margin: var(--space-xl) 0 var(--space-s) 0;
  }
  h2.no-margin {
    margin: 0 0 var(--space-s) 0;
  }

  h3 {
    font-style: italic;
    font-weight: var(--font-weights-semibold);
    font-size: var(--font-size-s);
    margin: var(--space-m) 0 var(--space-2xs) 0;
  }

  ol {
    list-style: decimal;
    list-style-position: inside;
  }
  ol > li,
  p {
    font-size: var(--font-size-s);
    margin-bottom: var(--space-xs);
  }

  ul > li {
    font-size: var(--font-size-s);
  }

  a.download {
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-5);
  }

  .logos {
    padding: 0;
    display: flex;
    gap: var(--space-m);
    width: 100%;
    flex-wrap: wrap;
  }
  .logos img {
    height: 30px;
    width: auto;
  }

  @media screen and (max-width: 872px) {
    .container {
      flex-direction: column;
      row-gap: var(--space-xl);
    }
    .refs {
      width: 100%;
    }
  }
</style>
