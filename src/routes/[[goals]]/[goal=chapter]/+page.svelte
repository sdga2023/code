<script>
  import { _, addMessages, locale } from 'svelte-i18n';
  import { inview } from 'svelte-inview';

  import triggerAnalytics from '../../../util/triggerAnalytics.js';

  import { Banner, ChapterFooter, StoryTitle, Navigation, Onwards, Loading } from '$lib/components';
  import DynamicComponent from '$lib/components/DynamicComponent.svelte';
  import mapper from '$lib/components/mapper.js';
  import { defaultLocale } from '$lib/i18n/i18n.js';
  import { activeGoal } from '$lib/stores/activeGoal';
  import variables from '$lib/variables.js';

  import { base } from '$app/paths';
  import { goto } from '$app/navigation';

  import { browser } from '$app/environment';

  import { isScreenshotting } from '$lib/stores/isScreenshotting';
  import { highlightedGoals } from '$lib/stores/highlightedGoals';
  import chapters from '../../../data/chapters.js';
  import LoopFooter from '$lib/external/loop-footer.svelte';

  export let data;
  $: archie = data?.archie;
  $: goal = data?.goal;

  $: if (goal === 'goal00') {
    goto('https://' + variables.hostname + '/' + base);
  }

  $: activeGoal.set({ string: data?.goal, number: parseInt(data?.goal.substring(4, 6)) });

  const TRANSLATION_PREFIX_KEY = 'translationPrefix';
  const DATA_PATH_KEY = 'path';
  const DATA_OUTPUT_KEY = 'data';
  const DATA_DOWNLOAD_KEY = 'dataDownloadUrl';
  const SHARE_URL_KEY = 'shareUrl';
  const DOWNLOAD_IMG_KEY = 'shareImg';
  const ANCHOR_KEY = 'anchorKey';

  // load translations for fallback- and currently set languages:
  let isFetchingTranslations = false;
  let isFetchingBannerData = false;
  let isFetchingContentData = false;
  let pageIsReady = false;
  let dataLoaded = [];

  // SEO:
  $: shareSiteName = $_('base.title', { default: 'Atlas of Sustainable Development Goals' }) + ' 2023';
  $: shareUrl = browser
    ? new URL(document.location.pathname, variables.shareUrl)
    : new URL('goals/' + $activeGoal.string, variables.shareUrl);
  $: shareDomain = new URL(variables.shareUrl).host;
  $: shareTitle =
    archie?.config?.headline +
    ' | ' +
    $_('base.sdg', { default: 'SDG' }) +
    ' ' +
    $activeGoal.number +
    ': ' +
    $_(`${$activeGoal.string}.title`, { default: chapters[$activeGoal.number]?.title });
  $: shareDescription = $_('base.description', {
    default:
      'The Atlas of Sustainable Development Goals 2023 presents interactive storytelling and data visualizations about the 17 Sustainable Development Goals. It highlights trends for selected targets within each goal and introduces concepts about how some SDGs are measured.'
  });
  $: shareImage = new URL(`assets/share/og-${$activeGoal.string}.jpg`, variables.shareUrl);
  /*
  $: console.log('GOAL PAGE');
  $: console.log('shareSiteName: ', shareSiteName);
  $: console.log('shareUrl: ', shareUrl.href);
  $: console.log('shareDomain: ', shareDomain);
  $: console.log('shareTitle: ', shareTitle);
  $: console.log('shareDescription: ', shareDescription);
  $: console.log('shareImage: ', shareImage.href);*/

  function translationKeyToId(translationKey, ignoreScenes = false) {
    let [goalNumberPrefix, ...contentId] = translationKey.split('.');

    if (ignoreScenes && translationKey.includes('scenes')) {
      // remove last two parts of the translation to drop the scenes description:
      contentId = contentId
        .slice(0, contentId.length - 3)
        .join('')
        .replace(/\#/g, '')
        .replace('content', 'c')
        .replace('translationPrefix', '');
    } else {
      contentId = contentId.join('').replace(/\#/g, '').replace('content', 'c').replace('scenes', 's').replace('translationPrefix', '');
    }

    return { goalNumberPrefix, contentId };
  }

  if (browser) {
    window.sdga2023_highlightGoal = (go) => {
      $highlightedGoals = [
        ...$highlightedGoals.map((high) => {
          if (high.goal === go) {
            high.hovered = true;
          }
          return high;
        })
      ];
    };
    window.sdga2023_lowlightGoal = (go) => {
      $highlightedGoals = [
        ...$highlightedGoals.map((high) => {
          if (high.goal === go) {
            high.hovered = false;
          }
          return high;
        })
      ];
    };
  }

  // load translations as well:
  $: if (goal && !dataLoaded.includes('translations')) {
    isFetchingTranslations = true;
    Promise.all(
      [defaultLocale, $locale].map(async (locale) => {
        try {
          const messages = await import(`../../../static/i18n/goals/${goal}.${locale}.i18n.json`);
          addMessages(locale, messages.default);
        } catch (e) {
          console.log(e);
          console.log(`couldn't load '../../../static/i18n/goals/${goal}.${locale}.i18n.json'`);
        }
      })
    ).then(() => {
      isFetchingTranslations = false;
      dataLoaded = [...dataLoaded, 'translations'];
    });
  }

  let _data = {};

  const fetchData = (path) => {
    return new Promise(async (resolve, reject) => {
      const parts = path.split('/');
      const lastPart = parts[parts.length - 1].replace('.json', '');
      const goalPart = parts[parts.length - 2];
      try {
        const moduledData = await import(`../../../data/${goalPart}/${lastPart}.json`);
        const value = moduledData.default;
        resolve({ path, value });
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  };

  $: if (archie?.content && !dataLoaded.includes('banner') && !isFetchingBannerData && !isFetchingTranslations) {
    isFetchingBannerData = true;

    let path = archie?.config[DATA_PATH_KEY];
    if (path && !_data[path]) {
      fetchData(path)
        .then((res) => {
          if (res) {
            _data[res.path] = res.value;
          }

          dataLoaded = [...dataLoaded, 'banner'];
          isFetchingBannerData = false;
        })
        .catch(() => {
          dataLoaded = [...dataLoaded, 'banner'];
          isFetchingBannerData = false;
        });
    } else {
      if (!dataLoaded.includes('banner')) {
        dataLoaded = [...dataLoaded, 'banner'];
      }
      isFetchingBannerData = false;
    }
  }

  $: if (archie?.content && !dataLoaded.includes('content') && !isFetchingTranslations && !isFetchingBannerData && !isFetchingContentData) {
    isFetchingContentData = true;

    const dataFetchers = [];
    [...archie?.content].forEach((item, index) => {
      let path = item[DATA_PATH_KEY];
      if (path && !_data[path]) {
        dataFetchers.push(fetchData(path));
      }
      if (item.scenes) {
        item.scenes.forEach((scene) => {
          let path = scene[DATA_PATH_KEY];
          if (path && !_data[path]) {
            dataFetchers.push(fetchData(path));
          }
        });
      }
    }, {});

    Promise.all(dataFetchers).then((results) => {
      results.forEach((res, i) => {
        if (res) {
          _data[res.path] = res.value;
        }
      });

      isFetchingContentData = false;
      dataLoaded = [...dataLoaded, 'content'];
    });
  }

  let references = [];
  let idCounter = 0;

  function generateChapterURL(chapterNum) {
    return base + '/' + chapters[chapterNum]?.url ?? base + '/';
  }

  // parseProps replaces all props for a given archie object
  // with their translations (in case TRANSLATION_PREFIX_KEY is set)
  // and its DATA_PATH_KEY attribute with the loaded data file as DATA_OUTPUT_KEY.
  function parseProps(content, ignoreTranslationKeys = false) {
    const keyPrefix = content[TRANSLATION_PREFIX_KEY];
    const dataPath = content[DATA_PATH_KEY];

    if (dataPath) {
      content[DATA_OUTPUT_KEY] = _data[dataPath] ?? [];
      content[DATA_DOWNLOAD_KEY] = base + '/' + dataPath.replace('.json', '.csv');
    }

    // ignore if it doesn't have a translation prefix:
    if (!keyPrefix && !ignoreTranslationKeys) {
      return content;
    }

    // try to translate all props:
    return Object.keys(content).reduce((acc, key) => {
      const translationKey = ignoreTranslationKeys ? key : `${keyPrefix}.${key}`;
      let translation = $_(translationKey);

      if (translationKey.endsWith(TRANSLATION_PREFIX_KEY) && (content?.type === 'vis' || content?.type?.startsWith('scene'))) {
        const { goalNumberPrefix, contentId } = translationKeyToId(translationKey, true);
        content[SHARE_URL_KEY] = `${shareUrl.href}#${contentId}`;
        content[
          DOWNLOAD_IMG_KEY
        ] = `https://${variables.shareHostname}${variables.pathPrefix}/assets/share/${goalNumberPrefix}/${contentId}.jpg`;
        content[ANCHOR_KEY] = contentId;
      }

      if (!ignoreTranslationKeys && translation === translationKey) {
        // no translation available - put back whatever you found there:
        acc[key] = content[key];
      } else {
        // inserts can be '[footnote: ', '[reference: ', '[link: ', '[emphasis: ' ...

        //const insertRegEx = /\[\s*?(\w+):\s*?(.+?)\]/gim;
        //const bracketsRegEx = /(\[\w+:\s*?)|(\])/gim;
        const bracketsRegEx = /(\[)|(\])/gim;

        if (ignoreTranslationKeys) {
          if (content[key] && typeof content[key] === 'string') {
            translation = content[key];
          } else {
            // don't parse non-string/empty attributes like data, even when ignoring translation keys:
            acc[key] = content[key];
            return acc;
          }
        }

        const parts = translation.split(bracketsRegEx).filter((d) => d && d !== '""');

        let stack = [];
        const origObj = { type: 'text', value: [] };
        let obj = origObj;

        let goingDeeper = false;
        let foundType = true;

        stack.push(obj);
        for (let i = 0; i < parts.length; i++) {
          let p = parts[i];
          if (p.startsWith('[')) {
            // go deeper
            goingDeeper = true;
          } else if (p.startsWith(']') && stack.length > 1) {
            if (foundType) {
              // move outwards
              stack.pop();
              obj = stack[stack.length - 1];
            } else {
              foundType = true;
              obj.value.push(']');
            }
          } else {
            // we've gone deeper (previous character was a '[') and are looking for the type:
            if (goingDeeper) {
              const type = p.match(/(\w+): /)?.[1];
              if (type) {
                foundType = true;
                let newObj = { type, value: [] };
                obj.value.push(newObj);
                obj = newObj;
                stack.push(newObj);

                // cut off type: from input:
                p = p.replace(`${type}: `, '');
              } else {
                // couldn't find type - leave everything alone:
                p = '[' + p;
                foundType = false;
              }
              goingDeeper = false;
            }
            // append current obj
            if (p.length > 0) {
              obj.value.push(p);
            }
          }
        }
        obj = origObj;
        let highlights = [];

        const formatPart = (obj) => {
          if (typeof obj === 'string') {
            return obj;
          }

          let skipMiddle = false;
          let t = '';
          if (Array.isArray(obj.value)) {
            if (obj.type === 'link') {
              let [url, ...linkText] = obj.value[0].trim().split(' ');
              linkText = linkText.join(' ');
              // append the rest of the link:
              if (obj.value.length > 1) {
                linkText += obj.value.slice(1)?.join('');
              }

              return `<a href='${url}' title='${linkText}' target='blank'>${linkText}</a>`;
            }
            const uniqueId = `${obj.type}_` + new Date().getTime() + idCounter++;
            let reference;
            let hasNewReference = false;

            if (obj.type === 'emphasis') {
              t += `<span class="emphasis">`;
            } else if (obj.type === 'footnote') {
              t += `<div class="summary"> <div class="bg" aria-label="footnote"><label class="footnote" aria-hidden="true" for='${uniqueId}'>i</label></div><input type="checkbox" role="switch" aria-label="read footnote" id='${uniqueId}'/><div class="details">`;
            } else if (obj.type === 'chapterlink') {
              const [chapternum, ...text] = obj.value[0].trim().split(' ');
              t += `<a href="${generateChapterURL(chapternum)}">${text.join(' ')}</a>`;

              highlights.push(+chapternum);

              skipMiddle = true;
            } else if (obj.type === 'chapterurl') {
              const [chapternum, ...text] = obj.value[0].trim().split(' ');
              t += shareUrl.href;

              highlights.push(+chapternum);

              skipMiddle = true;
            } else if (obj.type === 'target' || obj.type === 'goal') {
              const [number, ...text] = obj.value[0].trim().split(' ');
              const [go, ...te] = number.split('.');

              let prefixLabel;
              if (obj.type === 'target') {
                prefixLabel = $_('base.sdg') + ' ' + $_('base.target') + ' ';
                if (prefixLabel === 'base.sdg base.target ') {
                  prefixLabel = 'SDG Target ';
                }
              } else {
                prefixLabel = $_('base.sdg') + ' ';
                if (prefixLabel === 'base.sdg ') {
                  prefixLabel = 'SDG ';
                }
              }

              // add highlighted goals to explicit highlights array
              highlights.push(go);

              t += `<div class="summary targ" style="--sdg-color: var(--color-un-sdg${go}); --sdg-text-color: var(--color-un-text-sdg${go})"
              onmouseenter="window.sdga2023_highlightGoal(${go})"
              onmouseleave="window.sdga2023_lowlightGoal(${go})"
              ><input type="checkbox" id='${uniqueId}' aria-hidden="true" /><label class="unstyled" for='${uniqueId}'><p class="goal-target">${prefixLabel}<span class="goal">${go}${
                te.length > 0 ? `.</span><span class="target">${te.join('.')}</span>` : '</span>'
              }</p></label><p class="details goal-details"><span class="target">${$_('target.' + number)}</span></p></div>`;

              skipMiddle = true;
            } else if (obj.type === 'reference') {
              const completeText = JSON.stringify(obj.value).replace(/[\s\,\"]/g, '');

              let refIndex = references.map((ref) => ref?.text).indexOf(completeText);
              if (refIndex === -1) {
                reference = { text: completeText, index: references.length, formatted: '' };
                hasNewReference = true;
              } else {
                reference = references[refIndex];
              }
              t += `<div class="summary reference ${reference.index + 1 > 9 ? 'wide' : ''}"><div class="bg" aria-label="reference ${
                reference.index + 1
              }"><label for='${uniqueId}' aria-hidden="true">${
                reference.index + 1
              }</label></div><input type="checkbox" role="switch" aria-label="read reference" id='${uniqueId}'/><div class="details">`;
            }

            if (!skipMiddle) {
              obj.value.forEach((o) => {
                const formatted = formatPart(o);
                t += formatted;
                if (hasNewReference) reference.formatted += formatted;
              });
            }

            if (obj.type === 'emphasis') {
              t += `</span>`;
            } else if (obj.type === 'footnote' || obj.type === 'reference') {
              t += `</div></div>`;
            }

            if (hasNewReference) {
              references = [...references, reference];
            }
          }

          return t;
        };

        translation = formatPart(obj);

        acc[key] = translation;
        if (highlights.length > 0) {
          if (acc.highlights) {
            acc.highlights = [...acc.highlights, ...highlights];
          } else {
            acc.highlights = highlights;
          }
        }
      }
      return acc;
    }, {});
  }

  let contentProps = {};

  $: {
    /* triggers: */
    _data;
    $locale;
    isFetchingTranslations;

    references = [];

    archie?.content.forEach((content, index) => {
      contentProps[index] = parseProps(content);

      if (content.scenes) {
        content.scenes = content.scenes.map((scene, sceneIndex) => {
          contentProps[index + '_' + sceneIndex] = parseProps(scene);
          return contentProps[index + '_' + sceneIndex];
        });
      }

      // parse supplementary text/sources as well:
      if (content.charts) {
        content.charts = content.charts.map((chart, chartIndex) => {
          return parseProps(chart);
        });
      }
    });

    references = references;
  }

  let configProps = {};

  $: {
    // react once _data has been loaded or the $locale changes:
    _data;
    $locale;
    isFetchingTranslations;
    configProps = parseProps(archie?.config, true);
  }

  $: if (dataLoaded.includes('banner') && dataLoaded.includes('content') && dataLoaded.includes('translations')) {
    pageIsReady = true;
    //console.log('ready');
    //console.log(dataLoaded, isFetchingBannerData, isFetchingContentData, isFetchingTranslations);
  } else {
    //console.log(dataLoaded, isFetchingBannerData, isFetchingContentData, isFetchingTranslations);
  }

  $: if (pageIsReady && window.location.hash) {
    const hash = window.location.hash;

    setTimeout(() => {
      window.location.hash = '';
      window.location.hash = hash;
    }, 0);
  }

  $: onScreen = [];
  function indexEntering(index) {
    if (onScreen.indexOf(index) === -1) {
      onScreen = [...onScreen, index];
    }
  }

  function highlightGoals(content) {
    const matches = content?.highlights;

    if (matches && matches.length > 0 && !$highlightedGoals.some((d) => d.id === content?.translationPrefix)) {
      let newEntries = [];
      matches.forEach((m) => {
        const goal = +m;
        const goalObj = {
          goal,
          id: content.translationPrefix,
          open: false,
          hovered: false
        };

        newEntries.push(goalObj);
      });
      $highlightedGoals = [...$highlightedGoals, ...newEntries];
    }
  }
  function unhighlightGoals(content) {
    $highlightedGoals = [...$highlightedGoals.filter((d) => d.id !== content?.translationPrefix)];
  }

  if (browser) {
    // scroll to top on page refresh:
    window.scroll(0, 0);
  }

  $: if (goal) {
    // when changing active goal, clear highlighted goals
    $highlightedGoals = [];

    // and data loaded status:
    dataLoaded = [];
    isFetchingTranslations = false;
    isFetchingBannerData = false;
    isFetchingContentData = false;
    pageIsReady = false;

    // aaand update analytics:
    triggerAnalytics(chapters[$activeGoal.number]?.url);
  }
</script>

<svelte:head>
  <title>{shareTitle}</title>
  <meta name="description" content={shareDescription} />
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
</svelte:head>

<div class="content-nav">
  <Navigation />
  <div class="content">
    <Banner {...configProps} />
    <a name="page-start" />
    <div class="inner-content" class:loading={!pageIsReady}>
      {#if !pageIsReady}
        <div class="empty"><div class="loading-container"><Loading /></div></div>
      {/if}
      <!-- <StoryTitle title={archie?.config?.headline} /> -->
      {#each archie.content as content, index (goal + '-' + index)}
        <div
          class="observer navigation-highlights"
          use:inview={{ rootMargin: '0px' }}
          on:enter={() => {
            highlightGoals(contentProps[index]);
          }}
          on:leave={() => {
            unhighlightGoals(content);
          }}
        />

        <div
          class="observer loading"
          use:inview={{ rootMargin: '2000px' }}
          on:enter={() => {
            indexEntering(index);
          }}
        />

        {#if content?.translationPrefix}
          <a name={translationKeyToId(content.translationPrefix).contentId} />
        {/if}

        {#if content.graphic || content.scenes}
          <svelte:component
            this={mapper(content.type, onScreen.includes(index) || !browser || $isScreenshotting)}
            {...contentProps[index]}
            let:activeScene
            let:parentWidth
            let:parentHeight
            {shareTitle}
          >
            <svelte:fragment slot="graphic">
              {#if content.graphic}
                <DynamicComponent
                  thiz={mapper(content.graphic)}
                  {...contentProps[index]}
                  type={content.graphic}
                  {activeScene}
                  {parentWidth}
                  {parentHeight}
                />
              {/if}
            </svelte:fragment>
            <svelte:fragment slot="scenes">
              {#if content.scenes}
                {#each content.scenes as scene, sceneIndex (archie?.config?.goal + index + '-' + sceneIndex)}
                  {#if content?.translationPrefix}
                    <a name={translationKeyToId(scene.translationPrefix).contentId} />
                  {/if}
                  <div
                    class="observer navigation-highlights"
                    use:inview={{
                      rootMargin:
                        '50% 0px 0% 0px' /* scenes are shifted downwards, so we have to adjust their observers' rootMargin accordingly */
                    }}
                    on:enter={() => {
                      highlightGoals(contentProps[index + '_' + sceneIndex]);
                      indexEntering(index);
                    }}
                    on:leave={() => {
                      unhighlightGoals(scene);
                    }}
                  />

                  <DynamicComponent thiz={mapper(scene.type)} {...contentProps[index + '_' + sceneIndex]} type={scene.type} {activeScene} />
                {/each}
              {/if}
            </svelte:fragment>
          </svelte:component>
        {:else}
          <DynamicComponent
            thiz={mapper(content.type, true)}
            onScreen={onScreen.includes(index) || !browser || $isScreenshotting}
            {...contentProps[index]}
          />
        {/if}
      {/each}
    </div>

    {#if pageIsReady}
      <ChapterFooter
        {references}
        {...configProps}
        goal={String($activeGoal.number).padStart(2, '0')}
        shareUrl={shareUrl.href}
        {shareTitle}
      />
      <Onwards />
    {/if}
    <LoopFooter />
  </div>
</div>

<style type="text/scss">
  .content-nav {
    width: 100%;

    display: flex;
  }

  .content {
    flex-grow: 1;
    /* overflow-x: hidden; */
    min-width: 0;
  }

  .observer {
    height: 0;
    width: 0;
  }

  .inner-content {
    margin: 0;
    padding-top: var(--space-3xl);

    width: 100%;
    min-height: 80vh;
    position: relative;
  }
  .inner-content.loading {
    max-height: 80vh;
    overflow-y: hidden;
  }

  .empty {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    z-index: 100;
    background: linear-gradient(0deg, rgba(255, 255, 255, 1) 40%, rgba(255, 255, 255, 0.5));
  }
  .loading-container {
    height: 50%;
  }

  /* phone: */
  @media screen and (max-width: 872px) {
    .content-nav {
      display: block;
    }
  }
</style>
