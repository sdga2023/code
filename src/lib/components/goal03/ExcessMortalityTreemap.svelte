<script>
  import { getRegion } from './../../../data/countryRegionIncomeDictionary';
  import { Number, Tooltip, Legend, CategoricalLegend } from '$lib/components';
  import { scaleLinear, treemap, treemapResquarify, hierarchy, group, min, max, scaleSequential, piecewise, interpolateLab } from 'd3';
  import { locale, _ } from 'svelte-i18n';
  import * as Colors from '$lib/styles/tokens.es6.js';

  import { Html, LayerCake, Svg } from 'layercake';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let activeScene;

  export let label1;
  export let label2;
  export let label3;
  export let label4;
  export let label5;
  export let label6;

  export let parentWidth;
  export let parentHeight;
  let w, h;

  let x = {};

  let boxes = [];

  let mdata;
  $: if (data) {
    mdata = {};
    const wldData = data.find((d) => d.iso3 === 'WLD');
    const excessKeys = ['expected', 'noncovid', 'covid', 'less', 'excess'];
    mdata['excess-mortality'] = Object.keys(wldData)
      .filter((d) => excessKeys.includes(d))
      .reduce((acc, key) => [...acc, { key, value: wldData[key] }], []);

    // also calculate excess mortality (which is noncovid + covid):
    const excessDeaths = wldData.noncovid + wldData.covid;
    mdata['excess-mortality'].push({
      key: 'excess',
      value: excessDeaths
    });

    mdata['relative-excess-mortality'] = data.filter((d) => d.iso3 !== 'WLD');
  }

  let activeScale = 'absolute';
  let accessor = (d) => d?.['cumul.excess.mean'];
  let accessorLabels = [''];
  let tooltipAccessors = [accessor];
  $: {
    if (
      activeScene.id.startsWith('expected') ||
      activeScene.id.startsWith('split-box') ||
      activeScene.id.startsWith('overall-negative') ||
      activeScene.id === 'countries'
    ) {
      activeScale = 'absolute';
      accessor = (d) => d?.['cumul.excess.mean'];
      accessorLabels = [label2];
      tooltipAccessors = [accessor];
    } else if (activeScene.id.startsWith('countries-relative')) {
      activeScale = 'relative';
      accessor = (d) => d?.['cumul.excess.relative'];
      accessorLabels = [label6];
      tooltipAccessors = [accessor];
    } else if (activeScene.id.startsWith('negative-countries')) {
      activeScale = 'expected';
      accessor = (d) => d?.['expected'];
      accessorLabels = [label2, label1];
      tooltipAccessors = [(d) => d?.['cumul.excess.mean'], accessor];
    }
  }

  /*
  const scenes = {
    0: 'expected',
    1: 'excess',
    2: 'reported',
    3: undefined,
    4: 'countries',
    5: 'countries-relative',
    6: 'overall-negative',
    7: 'negative-countries'
  };
  */

  let treemapData = [];
  let countryNodes = [];
  $: regionLegendVisible = activeScene?.id.startsWith('countries');
  $: negativeExcessDeathsLegendVisible = activeScene?.id.startsWith('negative-countries');
  let minScreenSize = 0;
  let negativeExcessDeathsColorScale;

  $: if (mdata && w) {
    // h = Math.min(window.screen.height * 0.8, w * 1);
    h = parentHeight;

    const overall = mdata['excess-mortality'];
    const totalDeaths = overall.reduce((a, v) => (v.key !== 'excess' ? a + v.value : a), 0);

    const active = mdata['relative-excess-mortality'];

    const excessDeaths = overall.find((d) => d.key === 'noncovid').value + overall.find((d) => d.key === 'covid').value;
    const expectedDeaths = overall.find((d) => d.key === 'expected').value;

    minScreenSize = Math.min(parentWidth, parentHeight) - 70; /* <-- leave enough vertical space for the region legend */

    const relativeMortalityOpacityScale = scaleLinear()
      .domain([0, max(mdata['relative-excess-mortality'], (d) => d['cumul.excess.relative'])])
      .range([0, 1]);

    const myRedRamp = piecewise(interpolateLab, [
      Colors.ColorBaseDarkPurple100,
      Colors.ColorBaseRed200,
      Colors.ColorBaseRed300,
      Colors.ColorBaseRed400,
      Colors.ColorBaseRed500
    ]);
    negativeExcessDeathsColorScale = scaleSequential(myRedRamp).domain([
      0,
      min(mdata['relative-excess-mortality'], (d) => d['cumul.excess.mean'])
    ]);

    //if ((activeScene.index >= 2 && activeScene.index < 6) || activeScene.index == 7) {

    if (!activeScene.id.startsWith('expected') && !activeScene.id.startsWith('overall-negative')) {
      x['absolute'] = scaleLinear()
        .domain([1, Math.sqrt(excessDeaths)])
        .range([0, minScreenSize]);
    } else {
      let expectedRatio = Math.sqrt(expectedDeaths) / (Math.sqrt(expectedDeaths) + Math.sqrt(excessDeaths));
      x['absolute'] = scaleLinear()
        .domain([1, Math.sqrt(excessDeaths) + Math.sqrt(expectedDeaths)])
        .range([0, Math.min(parentWidth / expectedRatio, parentHeight)]);
    }

    x['relative'] = x['absolute'];
    x['expected'] = scaleLinear()
      .domain([0, Math.sqrt(totalDeaths)])
      .range([0, h * 2]);

    let treemapOffsetX = w / 2 - x['absolute'](Math.sqrt(excessDeaths)) / 2;
    if (activeScene.id.startsWith('overall-negative')) {
      // preserve previous scale for the treemap fade-out transition:
      treemapOffsetX =
        w / 2 -
        scaleLinear()
          .domain([1, Math.sqrt(excessDeaths)])
          .range([0, minScreenSize])(Math.sqrt(excessDeaths)) /
          2;
    }

    if (treemapData.length === 0 && !activeScene.id.startsWith('expected')) {
      const tmData = mdata['relative-excess-mortality'];
      const mappo = treemap().tile(treemapResquarify).size([minScreenSize, minScreenSize]).padding(0).round(true);

      const regionsAndCountries = group(tmData, (d) => getRegion(d.iso3));
      const root = hierarchy(regionsAndCountries)
        .sum((d) => (d?.['cumul.excess.mean'] > 0 ? d['cumul.excess.mean'] : 0))
        .sort((a, b) => b.value - a.value);

      treemapData = mappo(root);
    }

    boxes = [];

    let excessBox, expectedBox, noncovidBox, covidBox, negativeBox;

    if (activeScene.index !== undefined) {
      excessBox = {
        x: w / 2 - x[activeScale](Math.sqrt(excessDeaths)) / 2,
        y: 0,
        w: x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'excess')?.value)),
        h: activeScene.id === 'expected' ? 0 : x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'excess')?.value)),
        label: label2,
        noDisplay: activeScene?.id.startsWith('negative'),
        class: `excess`,
        iso3: 'excess',
        value: mdata['excess-mortality'].find((d) => d.key === 'excess')?.value,
        visible:
          activeScene.id === 'expected-excess' ||
          activeScene.id === 'split-box' ||
          activeScene.id === 'split-box2' ||
          activeScene.id === 'overall-negative' ||
          activeScene.id === 'overall-negative-2',
        labelVisible:
          activeScene.id === 'expected-excess' ||
          activeScene.id === 'split-box2' ||
          activeScene.id === 'overall-negative' ||
          activeScene.id === 'overall-negative-2',
        baseBox: true
      };

      expectedBox = {
        x: w / 2 - x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'expected')?.value)) / 2,
        y: excessBox.h,
        w: x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'expected')?.value)),
        h: x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'expected')?.value)),
        label: label1,
        noDisplay: activeScene.id.startsWith('negative-countries'),
        labelVisible: !activeScene.id.startsWith('negative-countries'),
        iso3: 'expected',
        visible: activeScene.index < 4 || activeScene.id.startsWith('overall-negative'),
        value: mdata['excess-mortality'].find((d) => d.key === 'expected')?.value,
        baseBox: true
      };

      const covidNonCovidRatio =
        mdata['excess-mortality'].find((d) => d.key === 'covid')?.value / mdata['excess-mortality'].find((d) => d.key === 'excess')?.value;

      covidBox = {
        x: w / 2 - x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'excess')?.value)) / 2,
        y: 0,
        w: x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'excess')?.value)) * covidNonCovidRatio,
        h: activeScene.id === 'expected' ? 0 : x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'excess')?.value)),
        label: label4,

        labelVisible: activeScene.id === 'split-box3',
        class: `covid`,
        iso3: 'covid',
        value: mdata['excess-mortality'].find((d) => d.key === 'covid')?.value,
        visible: activeScene.id === 'split-box3',
        baseBox: true
      };

      noncovidBox = {
        x: w / 2 - x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'excess')?.value)) / 2,
        y: 0,
        w: x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'excess')?.value)) * (1 - covidNonCovidRatio),
        h: activeScene.id === 'expected' ? 0 : x[activeScale](Math.sqrt(mdata['excess-mortality'].find((d) => d.key === 'excess')?.value)),
        label: label3,
        labelVisible: activeScene.id === 'split-box3',
        class: `noncovid`,
        iso3: 'noncovid',
        value: mdata['excess-mortality'].find((d) => d.key === 'noncovid')?.value,
        visible: activeScene.id === 'split-box3',
        baseBox: true
      };
      noncovidBox.x = excessBox.w + excessBox.x - noncovidBox.w;

      negativeBox = {
        x: 0,
        y: excessBox.h,
        w: x[activeScale](Math.sqrt(-mdata['excess-mortality'].find((d) => d.key === 'less')?.value)),
        h: x[activeScale](Math.sqrt(-mdata['excess-mortality'].find((d) => d.key === 'less')?.value)),
        label: label5,
        noDisplay: !(activeScene.id.startsWith('overall-negative') || activeScene.id === 'countries-relative-2'),
        class: 'negative',
        iso3: 'negative',
        visible: activeScene.id.startsWith('overall-negative-2'),
        labelVisible: activeScene.id.startsWith('overall-negative-2'),
        value: mdata['excess-mortality'].find((d) => d.key === 'less')?.value,
        baseBox: true
      };
      negativeBox.x = expectedBox.x + expectedBox.w - negativeBox.w;

      boxes = [expectedBox, excessBox, negativeBox, noncovidBox, covidBox];
    }

    if (activeScene.index >= 3) {
      const visible = (d) =>
        activeScene.id.startsWith('countries')
          ? d['cumul.excess.mean'] > 0
          : activeScene.id.startsWith('negative-countries') && d['cumul.excess.mean'] < 0;

      const labelShift = (d) => {
        let x = 0;
        let y = 0;
        if (activeScene.id.startsWith('countries-relative') && d.iso3 === 'RUS') {
          x = d.w / 2;
        }
        if (activeScene.id === 'countries' && d.iso3 === 'COL') {
          x = -d.w / 4;
          y = d.h / 4;
        }
        return { x, y };
      };

      const placeCountryNode = (countryNode) => {
        let tm = treemapData.find((c) => c.data.iso3 === countryNode.iso3);

        return {
          x: tm.x0 + treemapOffsetX,
          y: tm.y0
        };
      };

      const updateCountryNode = (countryNode, i) => {
        const isReferenceCountry =
          (activeScene.id.startsWith('countries') || activeScene.id.startsWith('negative-countries')) &&
          $referenceCountry === countryNode.iso3.toUpperCase();

        const countriesRelative2List = ['PER', 'BGR', 'IND', 'RUS'];
        let labelVisible = activeScene.id.startsWith('countries')
          ? activeScene.id === 'countries-relative-2'
            ? countriesRelative2List.includes(countryNode.iso3) || isReferenceCountry
            : i < 6 || isReferenceCountry
          : false;

        const opacity = activeScene.id.startsWith('countries-relative')
          ? relativeMortalityOpacityScale(countryNode['cumul.excess.relative'])
          : 1;

        const fillColor = activeScene.id.startsWith('negative-countries')
          ? negativeExcessDeathsColorScale(countryNode['cumul.excess.mean'])
          : null;

        let highlighted = false;

        let tm = treemapData.find((c) => c.data.iso3 === countryNode.iso3);
        let w = tm.x1 - tm.x0;
        let h = tm.y1 - tm.y0;

        let foreground = { x: 0, y: 0, w: 0, h: 0 };

        const countryNodePos = placeCountryNode(countryNode);
        countryNode.x = countryNodePos.x;
        countryNode.y = countryNodePos.y;

        if (countryNode['cumul.excess.mean'] < 0) {
          const negativeCountryHighlights = {
            'negative-countries': ['KNA', 'GRD', 'PLW'],
            'negative-countries-3': ['NZL', 'LKA', 'JPN', 'CHN']
          };

          let negativeExcessSize = x[activeScale](Math.sqrt(-countryNode['cumul.excess.mean']));
          const actualSize = x[activeScale](Math.sqrt(countryNode['expected']));

          w = Math.max(parentHeight * 0.1, Math.min(parentWidth / 5, 80));
          h = w;

          const sizeRatio = actualSize / w;
          negativeExcessSize /= sizeRatio;

          labelVisible = activeScene.id.startsWith('negative-countries');

          if (Object.keys(negativeCountryHighlights).includes(activeScene.id)) {
            highlighted = negativeCountryHighlights[activeScene.id].includes(countryNode.iso3);
          }

          foreground = {
            x: w - negativeExcessSize,
            y: 0,
            w: negativeExcessSize,
            h: negativeExcessSize
          };
        }

        countryNode.w = w;
        countryNode.h = h;
        countryNode.foreground = foreground;
        countryNode.hasForeground = false;
        countryNode.baseLabel = true;
        countryNode.referenceCountry = isReferenceCountry;
        countryNode.labelVisible = labelVisible;
        countryNode.region = getRegion(countryNode.iso3);
        countryNode.label = $_(`country.${countryNode?.iso3?.toLowerCase()}`);
        countryNode.labelShift = labelShift(countryNode);
        countryNode.visible = visible(countryNode);
        countryNode.highlighted = highlighted;
        countryNode.opacity = opacity;
        countryNode.fillColor = fillColor;

        return countryNode;
      };

      if (countryNodes.length === 0) {
        countryNodes = active
          .filter((d) => d.region)
          .sort((a, b) => accessor(b) - accessor(a))
          .map((d, i) => ({
            ...d,
            ...updateCountryNode(d, i)
          }));
      } else {
        active
          .filter((d) => d.region)
          .sort((a, b) => accessor(b) - accessor(a))
          .forEach((d, i) => {
            const countryNode = countryNodes.find((c) => c.iso3 === d.iso3);

            if (countryNode) {
              updateCountryNode(countryNode, i);
            }
          });
      }

      boxes = [...boxes, ...countryNodes.filter((d) => activeScene.index < 10 || (activeScene.index >= 10 && d['cumul.excess.mean'] < 0))];

      if (activeScene.index >= 8) {
        let pad = w * 0.05;
        const boxCount = countryNodes.filter((d) => d['cumul.excess.mean'] < 0).length;
        const boxWidth = countryNodes.filter((d) => d['cumul.excess.mean'] < 0)[0].w;
        const boxHeight = countryNodes.filter((d) => d['cumul.excess.mean'] < 0)[0].h;

        // adjust padding until all boxes fit:
        let boxesPerRow, boxesPerCol;
        do {
          boxesPerRow = Math.floor((w - 10) / (boxWidth + pad));
          boxesPerCol = Math.floor((h - 5) / (boxHeight + pad));
          if (boxesPerRow * boxesPerCol < boxCount) {
            pad -= 1;
          }
        } while (boxesPerRow * boxesPerCol < boxCount);

        let px = 5;
        let py = 5;
        countryNodes
          .filter((d) => d['cumul.excess.mean'] < 0)
          .sort((a, b) => a['cumul.excess.mean'] / a['expected'] - b['cumul.excess.mean'] / b['expected'])
          .forEach((d, i) => {
            d.x = px;
            d.y = py;

            px += d.w + pad;
            if (px + d.w > w - 5) {
              px = 5;
              py += pad + d.h;
            }

            d.labelShift = { y: pad / 2 };
            d.labelClass = 'negative';
            d.hasForeground = true;

            // hide partially cut-off boxes:
            /*if (d.y + d.h > h) {
              d.visible = false;
            }*/
          });

        boxes = boxes;
      }
    }
  }

  let activeCountry;
  let tooltipTargetPos = { x: 0, y: 0 };

  function setActiveCountry(evt, country) {
    activeCountry = country;

    const x = evt.clientX;
    const y = evt.clientY;

    tooltipTargetPos = { ...tooltipTargetPos, x, y };
  }
</script>

<div class="excess-mortality-treemap" bind:clientWidth={w}>
  <LayerCake x="x" y="y">
    <Svg>
      {#each boxes as box (box.iso3)}
        {#if box.baseBox}
          <rect
            class={box.class}
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            class:visible={box.visible}
            style={`display:${box?.noDisplay ? 'none' : 'block'}`}
          />
        {:else}
          <rect
            class:relative={activeScale === 'relative'}
            class:expected={activeScale === 'expected'}
            class:reference={box.referenceCountry}
            class:visible={box.visible}
            class:highlighted={box.highlighted}
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            on:mouseover={(e) => setActiveCountry(e, box)}
            on:mouseout={() => (activeCountry = null)}
            on:focus={(e) => setActiveCountry(e, box)}
            on:blur={() => (activeCountry = null)}
            style="--opacity: {box?.opacity ?? 1}; --fill-color: {box?.fillColor ?? ''}"
            style:fill={box?.fillColor ? box.fillColor : `var(--color-vis-region-${box.region})`}
          />
          <!-- negative deaths-->
          <rect
            x={box.x + box?.foreground.x - 1}
            y={box.y + box?.foreground.y + 1}
            width={box?.foreground.w}
            height={Math.max(box?.foreground.h - 1, 0)}
            class:visible={box.visible}
            style="stroke: none; fill: url(#tightHatch)"
          />
        {/if}
      {/each}
    </Svg>
    <Html pointerEvents={false}>
      {#each boxes as box (box.iso3)}
        {#if box.baseBox}
          <!-- description label-->
          <p
            class={`vis-label label ${box.class} category`}
            style={`transform: translate(
              calc(${box.x + box.w / 2}px - 50%), 
              calc(${box.y + box.h / 2}px - 50%)); 
              opacity: ${box.labelVisible ? 1 : 0}; 
              width: 200px;
              display:${box?.noDisplay ? 'none' : 'block'}
              `}
          >
            {box.label}
          </p>
          <!-- number label -->
          <p
            class={`vis-label label ${box.class} count number`}
            style={`transform: translate(
            calc(${box.x + box.w / 2}px - 50%), 
            calc(${box.y + box.h}px - 100%)
            ); 
            opacity: ${box.labelVisible ? 1 : 0}; 
            display:${box?.noDisplay ? 'none' : 'block'};
            width: ${$isMobile ? 160 : 200}px`}
          >
            {new Intl.NumberFormat(locale, { notation: 'compact', compactDisplay: 'long' }).format(box.value)}
          </p>
        {:else if box.baseLabel}
          <!-- country label -->
          <p
            class={`vis-label label small`}
            class:geo={!$isMobile}
            style={`transform: translate(
              calc(${box.x + box.w / 2}px - 50%), 
              calc(${box.y + box.h / 2}px - 50%)); 
              opacity: ${box.labelVisible ? 1 : 0}; 
              width: ${box.w}px; color: ${box?.fillColor ? 'black' : ''}`}
          >
            {box.label}
          </p>
        {/if}
      {/each}
      <div class="categorical-legend-container" style="bottom: 0px">
        <CategoricalLegend hidden={!regionLegendVisible} legendType="regions" />
      </div>
      {#if negativeExcessDeathsLegendVisible && negativeExcessDeathsColorScale}
        <div class="categorical-legend-container" style="bottom: 0px">
          <Legend hidden={false} title={label2} color={negativeExcessDeathsColorScale} unitLabel={label6} digits="0" />
        </div>
      {/if}
    </Html>
  </LayerCake>

  <Tooltip visible={activeCountry} targetPos={tooltipTargetPos}>
    <p class="label caps" style="margin-bottom: var(--space-2xs)">
      {$_(`country.${activeCountry?.iso3?.toLowerCase()}`)}
    </p>
    {#each tooltipAccessors as acc, i}
      <p class="label stronger"><Number value={acc(activeCountry)} /></p>
      <p class="label small weaker">{accessorLabels[i]}</p>
      {#if i < tooltipAccessors.length - 1}
        <hr />
      {/if}
    {/each}
  </Tooltip>
</div>

<style type="text/scss">
  .excess-mortality-treemap {
    width: 100%;
    height: 100%;

    :global(.layercake-container .vis-label) {
      color: var(--color-theme-dark-text);

      position: absolute;
      text-align: center;

      max-width: 125px;
      margin: 0 auto;

      &.base {
        font-size: var(--font-size-s);
      }

      &.negative {
        text-align: right;
        width: 200px !important;
        left: -58px;
        top: 40px;
      }
      &.negative.count {
        text-align: right !important;
        top: 76px;
      }
    }

    :global(.layercake-container .categorical-legend-container) {
      position: absolute;
      pointer-events: none;
      width: 100%;
    }

    :global(.layercake-layout-html > p) {
      opacity: 0;
      transition: 1.5s all;
      pointer-events: none;

      &.visible {
        opacity: 1;
      }
    }
  }

  g {
    opacity: 0;
    transition: 1.5s all, 0.5s opacity;
    pointer-events: none;

    &.visible {
      opacity: 1;
    }
  }

  rect,
  path {
    opacity: 0;
    pointer-events: none;
    outline: none;

    transition: 1.5s all, 0s stroke, 0s stroke-width, 0s outline;

    stroke: #ffffffaa;
    fill: var(--color-base-red400);

    &.visible {
      opacity: var(--opacity);
      pointer-events: all;
    }

    &.covid {
      fill: var(--color-base-red500);
    }
    &.noncovid {
      fill: var(--color-base-red600);
    }

    &.expected {
      fill: var(--fill-color);
    }

    &.highlighted {
      stroke: white;
      stroke-width: 2px;
      outline: 2px solid var(--color-theme-text);
    }

    &.negative {
      fill: url(#tightHatch);
      stroke: none;
    }

    &.excess {
      fill: var(--color-vis-red);
    }

    &.reference {
      fill: var(--color-reference-country) !important;
    }
  }

  text {
    pointer-events: none;
    transition: 1.5s all;

    text-anchor: middle;
  }

  @media screen and (max-width: 872px) {
    .excess-mortality-treemap :global(.layercake-container .vis-label.base) {
      font-size: var(--font-size-xs) !important;
    }

    .excess-mortality-treemap :global(.layercake-container .vis-label.negative) {
      left: -74px !important;
      top: 34px !important;
    }

    .excess-mortality-treemap :global(.layercake-container .vis-label.negative.count) {
      top: 78px !important;
    }
  }
</style>
