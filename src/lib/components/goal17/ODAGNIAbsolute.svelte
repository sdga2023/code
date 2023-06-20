<script>
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { scaleLinear, extent, max, min } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';
  import TimeSlider from './TimeSlider.svelte';
  import { isMobile } from '$lib/stores/isMobile';

  import { getRegion } from './../../../data/countryRegionIncomeDictionary';

  export let data;
  export let activeScene;
  export let textLabelizer = (d) => d / 1000;

  export let oda_absolute_label = 'ODA';
  export let oda_gni_label = 'Percentage of GNI';
  export let target_ldc_label = 'Target: .15% to LDCs';
  export let target_gni_label = 'Target: .7% of GNI';

  const exists = (d) => d;
  const myExtent = (d, a) => (d ? extent(d, a) : [0, 0]);

  let height = 0;
  let timeSliderHeight = 0;

  const GNI_LIMIT = 0.7;
  const GNI_LDC_LIMIT = 0.15;

  const SORTINGS = {
    ABSOLUTE: (a, b) => acc(b) - acc(a),
    GNI: (a, b) => (isLDCHighlighted ? accLDCGNI(b) - accLDCGNI(a) : accGni(b) - accGni(a))
  };

  $: countries = data ? Array.from(new Set(data.map((d) => d.iso3))).filter((d, i) => d !== 'DAC' && exists(d)) : [];
  $: enrichedData = data
    ? allYears.reduce((akk, year) => {
        akk[year] = data
          .filter((d) => yearAccessor(d) === year && countries.includes(d.iso3))
          .reduce((akku, val) => {
            const totalGNI = (acc(val) / accGni(val)) * 100;
            const pointSevenGNI = totalGNI * 0.007;
            akku[val.iso3] = { ...val, region: getRegion(val.iso3), totalGNI, pointSevenGNI };
            return akku;
          }, {});
        return akk;
      }, {})
    : {};

  let yearAccessor = (d) => d?.year;
  $: years = [min(data, (d) => yearAccessor(d)), 2021];
  $: allYears = Array.from(new Set(data?.map((d) => yearAccessor(d)))).sort((a, b) => a - b);

  const ACC_GNI_ATTRIBUTE = 'viz_odagni_pct';
  let accGni = (d) => d?.[ACC_GNI_ATTRIBUTE];
  const ACC_ABS_ATTRIBUTE = 'viz_oda_usdmn';
  let acc = (d) => d?.[ACC_ABS_ATTRIBUTE];
  const ACC_LDC_ATTRIBUTE = 'viz_oda_ldc_usdmn';
  const accLDC = (d) => d?.[ACC_LDC_ATTRIBUTE] ?? 0;
  const ACC_LDC_GNI_ATTRIBUTE = 'viz_oda_ldc_pctgni';
  const accLDCGNI = (d) => d?.[ACC_LDC_GNI_ATTRIBUTE] ?? 0;

  const overallColor = Colors.ColorBaseBlue400;

  $: barScale = scaleLinear()
    .range([0, 95])
    .domain([
      0,
      max(Object.keys(enrichedData), (year) => {
        return max(Object.keys(enrichedData[year]), (iso) => {
          const val = acc(enrichedData[year][iso]);
          if (val && isFinite(val)) return val;
          return 0;
        });
      })
    ]);
  $: percentageScale = scaleLinear()
    .domain([0, max(data, (d) => accGni(d))])
    .range([0, 95]);

  let lastSceneId = '-1';
  let currentYear = 2021;
  let isTimeSliderActive = false;

  function slideTo1960() {
    currentYear = 1960;
  }
  function slideToPresent() {
    currentYear = 2021;
  }

  $: if (activeScene.id !== lastSceneId) {
    if (activeScene.id === 'ldc' || activeScene.id === 'start') {
      slideToPresent();
    }

    if (activeScene.id === '1960' && lastSceneId !== 'ldc') {
      slideTo1960();
    }

    if (activeScene.id?.indexOf('ldc') > -1) {
      isLDCHighlighted = true;
    } else {
      isLDCHighlighted = false;
    }

    if (activeScene.id?.startsWith('gni')) {
      selectedSort = 'GNI';
      showPercentages = true;
    } else {
      selectedSort = 'ABSOLUTE';
      if (activeScene.id === 'intro-gni') {
        showPercentages = true;
      } else {
        showPercentages = false;
      }
    }

    if (activeScene.index > 2) {
      isTimeSliderActive = true;
    } else {
      isTimeSliderActive = false;
    }

    lastSceneId = activeScene.id;
  }

  $: if (activeScene.id === '1960') {
    if (activeScene.offset > 0.5) {
      let year = Math.floor((activeScene.offset - 0.5) * 2 * (years[1] - years[0]) + years[0]);
      if (year > years[1]) year = years[1];
      currentYear = year;
    }
  }

  let selectedSort = 'ABSOLUTE';
  let showPercentages = false;
  $: isLDCHighlighted = false;
</script>

{#if false}
  <div class="radio-container">
    <input type="radio" name="absoluteVsGNISort" value="ABSOLUTE" id="Absolute" bind:group={selectedSort} /><label for="Absolute"
      >{oda_absolute_label}</label
    >
    <input type="radio" name="absoluteVsGNISort" value="GNI" id="GNI" bind:group={selectedSort} /><label for="GNI">{oda_gni_label}</label>
  </div>
{/if}
<div class="oda-gni-absolute" bind:clientHeight={height} style={`--country-label-width: ${$isMobile ? 200 : 300}px`}>
  <TimeSlider enabled={isTimeSliderActive} {years} bind:currentYear bind:timeSliderHeight />
  {#if selectedSort === 'GNI'}
    <div class="separator-container">
      {#if isLDCHighlighted}
        <div class="separator highlight" style:width={percentageScale(0.15) + '%'} />
        <p class="label small weaker" style:left={percentageScale(0.15) + '%'}>{target_ldc_label}</p>
      {:else}
        <div class="separator" style:width={percentageScale(0.7) + '%'} />
        <p class="label small weaker" style:left={percentageScale(0.7) + '%'}>{target_gni_label}</p>
      {/if}
    </div>
  {/if}

  {#each countries
    .map((iso) => enrichedData?.[currentYear]?.[iso])
    .filter((d) => d && acc(d) > 0)
    .filter((d, i) => (i + 1) * ($isMobile ? 21 : 20) < height - timeSliderHeight)
    .sort(SORTINGS[selectedSort]) as country (country?.iso3)}
    <div class="full-bar" class:reference={country?.iso3 === $referenceCountry}>
      <div class="label small country-values">
        <span
          class="country"
          class:reached-target={selectedSort === 'GNI'
            ? isLDCHighlighted
              ? accLDCGNI(country) >= GNI_LDC_LIMIT
              : accGni(country) >= GNI_LIMIT
            : false}>{$_(`country.${country?.iso3.toLowerCase()}`)}</span
        ><span class="number small"
          >{#if textLabelizer(acc(country)) < 0.1}&lt;0.1{:else}<Number value={textLabelizer(acc(country))} digits="1" />{/if}
          {#if showPercentages}
            <span class="percentage"
              >{#if accGni(country)}(<Number value={accGni(country)} digits="2" units="%" />%){/if}</span
            >
          {/if}</span
        >
      </div>
      <div class="bar-container" class:absolute={selectedSort === 'ABSOLUTE'} class:gni={showPercentages}>
        <div
          class="bar"
          class:reached-target={accGni(country) >= GNI_LIMIT}
          style:width={barScale(acc(country)) + '%'}
          style:background-color={overallColor}
        />
        <div class="bar ldc" style:width={barScale(accLDC(country)) + '%'} class:highlight={isLDCHighlighted} />
        {#if showPercentages && country.pointSevenGNI && isFinite(country.pointSevenGNI)}
          <div class="bg" style:width={percentageScale(accGni(country)) + '%'} />
          <div
            class="percentage"
            class:reached-target={selectedSort === 'GNI'
              ? isLDCHighlighted
                ? accLDCGNI(country) >= GNI_LDC_LIMIT
                : accGni(country) >= GNI_LIMIT
              : false}
            style:width={percentageScale(accGni(country)) + '%'}
          />
          {#if isLDCHighlighted && accLDCGNI(country)}
            <div
              class="percentage ldc"
              class:highlight={isLDCHighlighted}
              class:reached-target={accLDCGNI(country) >= GNI_LDC_LIMIT}
              style:width={percentageScale(accLDCGNI(country)) + '%'}
            />
          {/if}
        {/if}
      </div>
    </div>
  {/each}
</div>

<!--
<CategoricalLegend
  customItems={[
    { key: label_below, colour: 'var(--color-grey-400)' },
    { key: label_above, colour: 'white', border: 'black' }
  ]}
  legendType="custom"
/>
  -->
<style>
  .oda-gni-absolute {
    position: relative;
    height: 100%;
  }

  .full-bar {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .full-bar.reference .label {
    color: var(--color-reference-country);
  }

  .full-bar .label.country-values {
    background-color: var(--color-theme-bg-weaker);
  }
  .full-bar .label.country-values .country.reached-target {
    font-weight: var(--font-weights-bold);
  }

  .bar-container {
    width: 100%;
    flex: 1;
    position: relative;
  }

  .bar-container.gni .bar {
    opacity: 0.2;
  }

  .bar {
    position: absolute;
    z-index: 2;
    height: 16px;
    margin-top: 2px;
    margin-right: 0px;
    transition: 0.5s all;
  }
  .bar.ldc.highlight {
    border-right: 1px solid var(--color-theme-bg-weaker);
  }
  .highlight {
    background-color: var(--color-base-red400);
  }

  .separator-container {
    width: calc(100% - var(--country-label-width) - var(--space-s));
    height: calc(100% - 65px);
    left: calc(var(--country-label-width) + var(--space-s));
    position: absolute;
  }
  .separator-container .label {
    position: absolute;
    transform: translate(-50%, 0);
    bottom: 0;
    white-space: nowrap;
  }
  .separator {
    height: calc(100% - 20px);
    border-right: 1px solid black;
    position: absolute;
  }
  .separator.highlight {
    background-color: transparent;
    border-color: var(--color-base-red400);
  }

  div.percentage {
    position: absolute;
    z-index: 1;
    top: calc(50% - 1px);
    height: 3px;
    background-color: var(--color-grey-400);
    border: 1px solid white;
  }
  .bar-container.gni .percentage {
    top: calc(50% - 2px);
    height: 5px;
  }

  div.percentage.reached-target {
    background-color: black;
  }
  div.percentage.highlight:not(.reached-target) {
    background-color: var(--color-base-red400);
  }
  div.percentage.ldc:not(.reached-target) {
    border-color: var(--color-base-red400);
  }
  div.percentage.ldc:not(.reached-target) {
    background-color: var(--color-theme-bg-weaker);
  }
  div.percentage.ldc.reached-target {
    background-color: var(--color-base-red400);
  }

  .full-bar div.label {
    flex-basis: var(--country-label-width);
    white-space: nowrap;
    margin-right: var(--space-s);

    display: flex;
    flex-direction: row;
  }
  .full-bar div.label span {
    display: inline-block;
  }

  .full-bar div.label .country {
    flex: 1;
  }
  .full-bar div.label .number {
    text-align: right;
  }

  .full-bar div.label .number .percentage {
    font-weight: normal;
  }
</style>
