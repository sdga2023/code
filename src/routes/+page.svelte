<script>
  import { _, locale } from 'svelte-i18n';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';

  import { onMount } from 'svelte';

  import { Subheader } from '$lib/components';
  import Globe from '$lib/components/Globe.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import ReferenceCountrySelector from '$lib/components/ReferenceCountrySelector.svelte';
  import ChapterFooter from '$lib/components/ChapterFooter.svelte';
  import { activeGoal } from '$lib/stores/activeGoal';
  import LanguagePicker from '$lib/components/LanguagePicker.svelte';
  import variables from '$lib/variables';
  import { isMobile } from '$lib/stores/isMobile';
  import LoopFooter from '$lib/external/loop-footer.svelte';
  import triggerAnalytics from '../util/triggerAnalytics.js';
  import Fa from 'svelte-fa/src/fa.svelte';
  import { faPlay } from '@fortawesome/free-solid-svg-icons';

  export let data;

  let selectedGoal = 0;

  let clientWidth = 0;

  let pillBoxWidth = 0;
  let maxGlobeWidth = 800;
  let globeDimensions = 0;

  let segments = 17;

  let linkH = 55;
  let gap = 6;
  let cH = segments * (linkH + gap);
  let offsetIndex = (segments - 16) / 2;
  let cR = cH / 2;

  /* pills are disabled for now: */
  function pillHighlight(evt) {
    //selectedGoal = evt.srcElement.id;
  }
  function deselect(evt) {
    //selectedGoal = 0;
  }

  $: selectedCountry = $referenceCountry;

  $: realGoals = data?.goals.filter((d) => d.real);

  // Math.max(450, Math.min(Math.min(clientWidth * 0.8, window.innerHeight * 0.5), maxGlobeWidth))

  // $: globeDimensions = Math.min(maxGlobeWidth, browser ? window.innerHeight : maxGlobeWidth);
  $: {
    globeDimensions = maxGlobeWidth;
    if (browser) {
      if (window.innerWidth <= 1279) {
        globeDimensions = Math.min(window.innerWidth * 0.8, 550);
        if ($isMobile) {
          globeDimensions = clientWidth;
        }
      }
    }
  }

  function textureLoad(goal) {
    activeGoal.set({ string: 'goal' + goal.index, number: goal.number });
  }

  $: contributors = data?.homepage?.contributors;

  // SEO
  $: shareTitle = $_('base.title', { default: 'Atlas of Sustainable Development Goals' }) + ' 2023';
  $: shareSiteName = shareTitle;
  $: shareUrl = new URL(variables.shareUrl);
  $: shareDomain = shareUrl.host;
  $: shareDescription = data?.homepage?.share_description;
  //  $: shareImage = new URL(`assets/share/og-${$activeGoal.string}.png`, variables.shareUrl);

  $: shareImage = new URL(`assets/share/og-goal01.jpg`, variables.shareUrl);

  /*
  $: console.log('LANDING PAGE');
  $: console.log('shareSiteName: ', shareSiteName);
  $: console.log('shareUrl: ', shareUrl.href);
  $: console.log('shareDomain: ', shareDomain);
  $: console.log('shareTitle: ', shareTitle);
  $: console.log('shareDescription: ', shareDescription);
  $: console.log('shareImage: ', shareImage.href);*/

  onMount(() => {
    triggerAnalytics('index.html');
  });
</script>

<svelte:head>
  <title>{shareTitle}</title>
  <meta property="og:site_name" content={shareSiteName} />
  <meta property="og:url" content={shareUrl.href} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={shareTitle} />
  <meta property="og:description" content={shareDescription} />
  <meta property="og:image" content={shareImage.href} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:domain" content={shareDomain} />
  <meta name="twitter:url" content={shareUrl.href} />
  <meta name="twitter:title" content={shareTitle} />
  <meta name="twitter:description" content={shareDescription} />
  <meta name="twitter:image" content={shareImage.href} />

  <meta name="citation_title" content="Atlas of the Sustainable Development Goals 2023: From World Development Indicators" />
  <meta name="citation_year" content="2023" />
  <meta name="citation_publisher" content="World Bank" />
  <meta name="citation_public_url" content="https://datatopics.worldbank.org/sdgatlas/" />
  <meta name="citation_editor" content="Pirlea, Ana Florina" />
  <meta name="citation_editor" content="Serajuddin, Umar" />
  <meta name="citation_editor" content="Wadhwa, Divyanshi" />
  <meta name="citation_editor" content="Welch, Matthew" />
  <meta name="citation_doi" content="https://doi.org/10.60616/7GHG-N333" />
</svelte:head>

<div class="all layout-full">
  <div class="header layout-full">
    <div class="header-container layout-content">
      <!--
      <div class="language">
        <LanguagePicker landingPage="true" />
      </div>
    -->

      <!--  <a href="{base}/"
        ><img title="logo" alt="logo" width="1000" src="{base}/assets/external/loop-header-footer/img/logo-atlas-dark.svg" /></a
      >-->
      <div class="logos top">
        <a href="https://www.worldbank.org">
          <img
            src="{base}/assets/external/loop-header-footer/img/logo-wbg-footer-en.svg"
            title="World Bank Group"
            alt="World Bank Group"
          /></a
        >
        {data?.homepage?.presents}
      </div>

      <div class="headline-container">
        <h1>{@html data?.homepage.page_title} <span class="year"> {$_('atlas.year', { default: '2023' })}</span></h1>
      </div>
      <div class="intro-text">
        <p class="summary">
          {@html data?.homepage?.intro_1}
        </p>
      </div>
      <div class="logos bottom">
        {data?.homepage?.support_from}

        <img title="SDG Fund logo" alt="SDG Fund" src="{base}/assets/external/loop-header-footer/img/SDG-Fund-Logo.svg" />
        <img title="WDI Logo" alt="World Development Indicators" src="{base}/assets/external/loop-header-footer/img/WDI-Logo.svg" />
        <img title="KDI School logo" alt="KDI School" src="{base}/assets/external/loop-header-footer/img/KDI-School-Logo.png" />
      </div>
    </div>
    <!--  <div class="selected-goal-container"><p>{selectedGoal ? $_(`target.${selectedGoal}`) : ''}</p></div>-->
  </div>

  <div class="pill-box">
    {#each realGoals as goal, i}
      <div
        id={i + 1}
        on:mouseover={pillHighlight}
        on:mouseout={deselect}
        on:blur={deselect}
        on:focus={pillHighlight}
        class="goal-pill"
        class:selected={i === selectedGoal - 1}
        style={`--pill-color: var(--color-un-sdg${i + 1})`}
      />
    {/each}
  </div>

  <!-- globe selector -->

  <div class="globe layout-full" style="--globe-height: {globeDimensions}px">
    <div class="globe-and-goals-container layout-content">
      {#if browser}
        <div class="globe-container" bind:clientWidth>
          <Globe width={globeDimensions} height={globeDimensions} onHomepage bind:selectedCountry />
        </div>
      {/if}
      <div class="reference-country-overlay">
        <h3>{data?.homepage?.reference_country_header}</h3>
        <ReferenceCountrySelector hp="true" />
        <p>
          {data?.homepage?.reference_country_explanation}
        </p>
        <p class="texture-info desktop">
          The globe shows data from the story on SDG {$activeGoal.number}.
          <a
            href={realGoals[+$activeGoal.number - 1]?.url}
            class="act-goal"
            style="--active-goal-color: var(--color-un-sdg{$activeGoal.number}"
          >
            Read the story on SDG {$activeGoal.number}</a
          > to find out more!
        </p>
      </div>

      <p class="texture-info mobile">
        This globe shows data from the story on&nbsp;<a
          href={realGoals[+$activeGoal.number - 1]?.url}
          class="act-goal"
          style="--active-goal-color: var(--color-un-sdg{$activeGoal.number}">SDG {$activeGoal.number}</a
        >. Click on the link for this story to find out more!
      </p>
      <h2>{data?.homepage?.stories_header}</h2>

      <ul class="goals" style="--goal-gap: {gap}px; --goal-height: {linkH}px">
        {#each realGoals as goal, i}
          <li style="--circle-shift : {Math.sqrt(Math.pow(cR, 2) - Math.pow((i + offsetIndex) * (linkH + gap) - cR, 2)) - 5}px">
            <a
              href={goal.url}
              class="goal-link"
              style="--goal-color : var(--color-un-sdg{i + 1}); --goal-text-color : var(--color-un-text-sdg{i + 1})"
              class:globe-selected={+$activeGoal.number === i + 1}
              on:mouseover={() => {
                textureLoad(goal);
              }}
              on:focus={() => textureLoad(goal)}
            >
              <p class="goal-number">{+goal.index}</p>
              <div>
                <p class="goal-title">{$_(`goal${goal.index}.title`, { default: goal.title })}</p>
                <p class="story-title">{goal.headline}<span aria-hidden="true" class="arrow"><Fa icon={faPlay} /></span></p>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <!-- two column text intro -->

  <div class="outro-text layout-content">
    <p class="intro2">
      {@html data?.homepage?.intro_2}<br /><br />
      {@html data?.homepage?.intro_3}<br /><br />{@html data?.homepage?.contact}
    </p>
    <div class="video">
      <iframe
        style:width="var(--col-6)"
        style:aspect-ratio="16/9"
        src="https://www.youtube-nocookie.com/embed/Wr52d-UZvl0"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
    </div>
  </div>

  <!-- acknowledgements -->
  <div class="footer layout-full">
    <ChapterFooter
      landingPage={true}
      citation={data?.homepage?.citation}
      acknowledgement={data?.homepage?.acknowledgement}
      references={[]}
      shareUrl={variables.shareUrl}
      {shareTitle}
    />

    <h1 class="contributions layout-content">{$_('contributions', { default: 'Contributions by' })}:</h1>
    <ul class="contributors layout-content">
      {#each contributors as contri}
        <li>{contri}</li>
      {/each}
    </ul>
  </div>
</div>
<LoopFooter />

<style type="scss">
  .all {
    background-color: var(--color-theme-bg);
  }
  .header {
    background-color: var(--color-theme-dark-bg);
    color: var(--color-theme-dark-text);
    padding: 0 0 var(--space-m) 0;
    position: relative;

    .header-container {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-top: var(--space-4xl);
    }
    .language {
      position: absolute;
      top: 5px;
      right: 0;
    }
    .logos {
      display: flex;
      gap: var(--space-s);
      width: 100%;
      align-items: center;
      line-height: 100%;
      color: var(--color-theme-dark-text-weaker);
      font-size: var(--font-size-xs);
    }
    .logos.top img {
      height: 40px;
      width: auto;
    }
    .logos.bottom {
      position: relative;
      bottom: 0;
      right: 0;
      justify-content: flex-end;
      margin: 0 var(--space-m) 0 0;
    }
    .logos.bottom img {
      height: 30px;
      width: auto;
    }

    .logo-container {
      display: flex;
      height: 50px;
      width: var(--col-12);
    }

    .headline-container {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      font-size: var(--font-size-2xl);
      line-height: var(--line-heights-120);

      :global(.atlas) {
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-5);
        font-weight: bold;
      }
      .year {
        font-size: var(--font-size-3xl);
        color: var(--color-theme-dark-primary);
      }
    }

    .selected-goal-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      p {
        width: var(--col-3);
        margin: 0 auto;
      }
    }
  }

  .intro-text {
    padding: var(--space-xl) 0 var(--space-3xl) 0;
    width: var(--col-8);

    display: flex;
    gap: var(--space-m);

    p {
      flex: 1;
      line-height: var(--line-heights-175);
    }
    .summary {
      font-family: var(--font-families-andes);
      font-size: var(--font-size-l);
    }
  }

  .outro-text {
    padding: var(--space-3xl) 0 var(--space-3xl) 0;
    justify-content: space-between;

    display: flex;
    row-gap: var(--space-m);
    flex-wrap: wrap;

    p {
      width: var(--col-6);
      line-height: var(--line-heights-175);
    }
  }

  .pill-box {
    display: flex;
    width: 100%;
    gap: var(--space-2xs);
    height: 14px;
    margin-bottom: -14px;
    transform: translate(0, -50%);
    align-items: center;
    position: relative;
    z-index: 3;
  }
  .goal-pill {
    flex: 1;
    background-color: var(--pill-color);
    border-radius: 100px;
    text-align: center;
    height: 14px;

    display: flex;
    justify-content: center;
    align-items: center;

    user-select: none;

    font-size: var(--font-size-m);
    color: #ffffff00;

    transition: height 0.2s ease-in-out, font-size 0.2s ease-in-out;

    &.selected {
      background-color: var(--pill-color);
      height: 100px;
      font-size: var(--font-size-3xl);
      color: #ffffffff;
    }
  }

  .globe {
    background-color: var(--color-theme-bg-weaker);
    padding: var(--space-3xl) 0 var(--space-3xl) 0;
    display: flex;

    .globe-and-goals-container {
      position: relative;
      display: flex;
      flex-direction: column;
    }

    hr {
      width: var(--col-2);
      margin-bottom: var(--space-m);
    }

    h2 {
      width: var(--col-12);
      font-size: var(--font-size-xl);
      font-family: var(--font-families-andes);
      line-height: var(--line-heights-145);
      //letter-spacing: var(--letter-spacing-5);
      // text-transform: uppercase;
      padding-bottom: var(--space-xs);
      border-bottom: 1px solid var(--color-grey-200);

      margin: 0 auto var(--space-l) auto;
    }

    .texture-info {
      color: var(--color-theme-dark-text-weaker);
      line-height: 145%;
      font-style: italic;

      .act-goal {
        border-bottom: 3px solid var(--active-goal-color);
        font-weight: var(--font-weights-semibold);
        color: var(--color-theme-text);
        pointer-events: all;
      }
      .act-goal:hover {
        text-decoration: none;
        color: var(--active-goal-color);
      }
      &.mobile {
        display: none;
      }
    }

    .globe-container {
      position: absolute;
      transform: translate(-50%, -50%);
      top: calc(50% + 50px);
    }

    .goals {
      display: flex;
      flex-direction: column;
      gap: var(--goal-gap);
      position: relative;
      pointer-events: none;

      margin: 0 auto;
      li {
        margin-left: var(--circle-shift);
        pointer-events: none;
      }
    }
    .goal-link {
      display: flex;
      text-decoration: none;
      gap: var(--space-xs);
      align-items: center;
      color: var(--color-theme-text);
      height: var(--goal-height);
      width: fit-content;
      pointer-events: all;

      .goal-number {
        font-size: var(--font-size-2xl);
        color: var(--goal-color);
        font-family: var(--font-families-open-sans);
        width: var(--goal-height);
        height: var(--goal-height);
        border-radius: var(--goal-height);
        text-align: center;
        border: 2px solid transparent;
        line-height: calc(var(--goal-height) - 4px);
      }
      .goal-title {
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-5);
        font-size: var(--font-size-m);
        border-bottom: 1px solid var(--goal-color);
        margin-bottom: 2px;
        font-weight: var(--font-weights-semibold);
      }
      .story-title {
        font-family: var(--font-families-andes);
        white-space: nowrap;
      }
      .arrow {
        color: transparent;
        font-size: var(--font-size-s);
        padding-left: var(--space-xs);
        display: inline-block;
      }

      &.globe-selected .goal-number {
        border: 2px solid var(--goal-color);
      }
    }

    .goal-link:hover {
      .goal-number {
        color: var(--goal-text-color);
        background-color: var(--goal-color);
      }

      .goal-title {
        border-bottom: 3px solid var(--goal-color);
        margin-bottom: 0;
      }
      .arrow {
        color: var(--goal-color);
      }
    }
  }

  .reference-country-overlay {
    width: var(--col-4);
    position: absolute;
    top: 50%;
    display: flex;
    gap: var(--space-s);
    flex-direction: column;
    padding: var(--space-s) var(--space-s) var(--space-s) var(--space-s);

    background-color: rgba(246, 245, 243, 0.9);
    color: var(--color-theme-text);

    /*background-color: rgba(16, 14, 43, 0.9);
    color: var(--color-theme-dark-text);*/
    z-index: 2;
    pointer-events: none;

    h3 {
      font-size: var(--font-size-xl);
      font-family: var(--font-families-andes);
      line-height: var(--line-heights-120);
      color: var(--color-reference-country);
    }
    p {
      font-size: var(--font-size-s);
    }
  }
  .footer {
    background-color: var(--color-theme-bg-weakest);
    .contributions {
      font-size: var(--font-size-m);
      line-height: var(--line-heights-120);
      letter-spacing: var(--letter-spacing-10);
      text-transform: uppercase;
      font-weight: 600;
      font-family: var(--font-families-andes);

      margin-bottom: var(--space-s);
    }
    .contributors {
      display: flex;
      flex-direction: column;
      height: 385px;
      width: var(--col-12);
      flex-wrap: wrap;
      column-gap: var(--space-s-m);

      padding-bottom: var(--space-3xl);
    }
    .contributors li {
      font-size: var(--font-size-s);
      width: var(--col-2);
    }
  }

  @media screen and (max-width: 1279px) {
    .arrow {
      display: none;
    }
    .globe {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;

      h2 {
        margin: var(--space-l) 0 var(--space-m) 0;
        text-align: center;
        width: 100%;
      }

      .texture-info {
        font-size: var(--font-size-m);
      }
      .goal-link .story-title {
        white-space: normal;
      }

      .globe-and-goals-container {
        position: static;
        display: flex;
        align-items: center;
        column-gap: var(--space-s);
        row-gap: var(--space-l);
        justify-content: center;
        flex-direction: row;
        flex-wrap: wrap;
      }

      .globe-container {
        position: relative;
        transform: translate(0, 0);
        width: var(--col-6);
      }

      .goal-link.globe-selected .goal-number {
        border: 2px solid transparent;
      }

      .goals {
        display: flex;
        //    gap: var(--space-m);
        width: var(--col-12);
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        row-gap: var(--space-m);

        li {
          margin-left: 0;
          width: var(--col-6);
        }

        .goal-link {
          height: fit-content;
          width: 100%;

          div {
            flex: 1;
          }
        }
      }
      .reference-country-overlay {
        position: static;
        width: var(--col-6);
      }
    }
    .footer {
      .contributors li {
        font-size: var(--font-size-s);
        width: var(--col-3);
      }
      .contributors {
        height: 520px;
      }
    }
  }

  @media screen and (max-width: 872px) {
    .pill-box {
      gap: 1px;
    }
    .globe {
      .globe-container {
        max-width: 500px;
      }

      .globe-and-goals-container {
        row-gap: var(--space-xl);
        .goals {
          max-width: 600px;
        }
      }
      .texture-info {
        text-align: center;
        &.mobile {
          display: block;
        }
        &.desktop {
          display: none;
        }
      }
      .reference-country-overlay {
        padding: 0;
        order: -1;
        background-color: rgba(246, 245, 243, 0.9);
        color: var(--color-theme-text);
        align-items: center;

        p {
          text-align: center;
          max-width: 600px;
        }
      }
    }
    .footer {
      .contributors li {
        font-size: var(--font-size-s);
        width: var(--col-3);
      }
      .contributors {
        height: 950px;
      }
    }
  }
</style>
