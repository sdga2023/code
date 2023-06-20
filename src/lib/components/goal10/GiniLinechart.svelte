<script>
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { _ } from 'svelte-i18n';

  import * as Colors from '$lib/styles/tokens.es6.js';

  import { scaleLinear, line, curveCatmullRom } from 'd3';
  import { ChartGrid, Number } from '$lib/components';
  import { isMobile } from '$lib/stores/isMobile';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { LineChartCircleRadius } from '$lib/styles/vis';

  export let data;
  export let activeScene;
  export let y_label;
  export let covid_projection;
  export let precovid_projection;
  export let label_decrease = 'decrease';
  export let label_increase = 'increase since previous year';

  export let parentWidth;
  export let parentHeight;

  $: w = parentWidth;
  $: h = $isMobile ? parentHeight : Math.min(parentHeight, w);

  let padding = 50;
  const CHART_SHIFT_LEFT = 20;

  const SHORT_TIMING = 0;
  const LONG_TIMING = 1000;

  const FADE_PARAMS = { delay: SHORT_TIMING, duration: LONG_TIMING };
  const EASE = cubicOut;

  let yAccessor,
    xTicks = [],
    yTicks = [];

  const xLimitMax = tweened(2019.5, {
    duration: LONG_TIMING,
    easing: EASE
  });
  const xLimitMin = tweened(1990, {
    duration: LONG_TIMING,
    easing: EASE
  });
  const yLimitMin = tweened(60, {
    duration: LONG_TIMING,
    delay: SHORT_TIMING,
    easing: EASE
  });
  const yLimitMax = tweened(70, {
    duration: LONG_TIMING,
    delay: SHORT_TIMING,
    easing: EASE
  });

  $: barchartValues = tweened(barchartDataEmpty, {
    duration: 500,
    easing: EASE,
    interpolate: (a, b) => (t) => {
      return b.map((d, i) => ({ ...d, baseY: a[i].baseY + (d.baseY - a[i].baseY) * t, val: a[i].val + (d.val - a[i].val) * t }));
    }
  });

  $: barchartData = data?.reduce((acc, d) => {
    if (d.year !== 2020) {
      acc.push({
        year: d.year,
        val: d.ginichange ?? 0,
        baseY: d.gini,
        id: d.year
      });
    } else {
      acc.push({
        year: 2020,
        val: d.ginichange_covid,
        baseY: d.gini_covid,
        class: 'covid',
        id: '2020covid'
      });
      acc.push({
        year: 2020,
        val: d.ginichange_precovid,
        baseY: d.gini_precovid,
        class: 'precovid',
        id: '2020precovid'
      });
    }
    return acc;
  }, []);

  $: barchartDataEmpty = barchartData.map((d) => ({ ...d, val: 0 }));
  $: barchartDataNoBase = barchartData.map((d) => ({ ...d, baseY: 65 + d.val }));
  $: maxBarWidth = Math.min((w - padding * 2) / 30 - 2, 1000);

  let state;

  const setDefaults = () => {
    xTicks = data?.filter((d) => d.year % 5 === 0);
    yAccessor = (d) => d?.gini;
    yTicks = [];
    for (let i = 60; i <= 71; i += 2) {
      yTicks.push(i.toFixed(0));
    }
  };

  $: switch (activeScene?.id) {
    case 'calculating_gini':
      setDefaults();
      $xLimitMin = 1990;
      $xLimitMax = 2019;
      $yLimitMin = 60;
      $yLimitMax = 70;
      yTicks = [20, 30, 40, 50, 60, 62, 64, 66, 68, 70];
      xTicks = data?.filter((d) => d.year < 2020 && (d.year % 5 === 0 || d.year === 2019));
      state = 0;
      break;
    case 'gini_in_sweden':
    case 'gini_in_paraguay':
      setDefaults();
      $xLimitMin = 2003;
      $xLimitMax = 2019;
      $yLimitMin = 20;
      $yLimitMax = 70;
      yTicks = [20, 30, 40, 50, 60, 70];
      xTicks = data?.filter((d) => d.year < 2020 && (d.year % 5 === 0 || d.year === 2019));
      state = 0;
      break;
    case 'gini_poor':
      setDefaults();
      $xLimitMin = 1990;
      $xLimitMax = 2019;
      $yLimitMin = 60;
      $yLimitMax = 70;
      xTicks = data?.filter((d) => d.year < 2020 && (d.year % 5 === 0 || d.year === 2019));
      yTicks = [20, 30, 40, 50, 60, 62, 64, 66, 68, 70];
      state = 0;
      break;
    case 'covid_impact_gini':
      setDefaults();
      $xLimitMin = 2015;
      $xLimitMax = 2020;
      $yLimitMin = 60;
      $yLimitMax = 65;
      xTicks = data.filter((d) => d.year % 5 === 0 || d.year >= 2015);
      yTicks = [60, 61, 62, 63, 64, 65];
      state = 1;
      barchartValues.set(barchartDataEmpty);
      break;
    case 'pause':
      setDefaults();
      $xLimitMin = 1990;
      $xLimitMax = 2020;
      $yLimitMin = 60;
      $yLimitMax = 70;
      setTimeout(() => barchartValues.set(barchartData), SHORT_TIMING);
      state = 2;
      break;
    case 'relative_changes_gini':
    default:
      setDefaults();
      $xLimitMin = 1990;
      $xLimitMax = 2020;
      $yLimitMin = 64;
      $yLimitMax = 66;
      yAccessor = (d) => d?.ginichange;
      setTimeout(() => barchartValues.set(barchartDataNoBase), SHORT_TIMING);
      state = 3;
      break;
  }

  $: xScale = scaleLinear()
    .domain([$xLimitMin, $xLimitMax])
    .range([padding, w - maxBarWidth / 2]);
  $: yScale = scaleLinear()
    .domain([$yLimitMin, $yLimitMax])
    .range([h - padding, padding]);

  $: pathGen = line()
    .x((d) => xScale(d.year) ?? 0)
    .y((d) => yScale(yAccessor(d)) ?? yScale(d.gini_precovid) ?? h - padding)
    .curve(curveCatmullRom);

  $: pathGenSweden = line()
    .x((d) => xScale(d.year) ?? 0)
    .y((d) => yScale(d?.gini_sweden) ?? h - padding)
    .curve(curveCatmullRom);

  $: pathGenParaguay = line()
    .x((d) => xScale(d.year) ?? 0)
    .y((d) => yScale(d?.gini_paraguay) ?? h - padding)
    .curve(curveCatmullRom);

  $: pos2019 = { x: xScale(2019), y: yScale(data.find((d) => d.year === 2019).gini) };
  $: pos2020 = { x: xScale(2020), y: yScale(data.find((d) => d.year === 2020).gini_covid) };
  $: pos2020precovid = { x: xScale(2020), y: yScale(data.find((d) => d.year === 2020).gini_precovid) };

  let activeGini = null;
  function updateMouse(evt) {
    let mousePos = { x: evt.layerX, y: evt.layerY };
    let currentYear = Math.round(xScale.invert(mousePos.x + CHART_SHIFT_LEFT));

    if (currentYear < 1990) currentYear = 1990;
    if (currentYear > 2019) currentYear = 2019;

    activeGini = data.find((d) => d.year === currentYear);
  }
</script>

<div class="gini-linechart" bind:clientWidth={w} bind:clientHeight={h}>
  <svg width={w} height={h} class="linechart">
    <g style={`transform: translate(${-CHART_SHIFT_LEFT}px, 0px)`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - padding}
        innerWidth={w}
        scale={xScale}
        ticks={xTicks.map((d) => d.year)}
        hideLines={state === 3}
      />
      {#if state < 3}
        <g style={`transform: translate(${CHART_SHIFT_LEFT}px, 0px)`}>
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - padding}
            innerWidth={xScale(2020) - xScale($xLimitMin) + padding}
            scale={yScale}
            ticks={yTicks}
            yAxisUnits={y_label}
          />
        </g>
      {/if}

      <g class="chart-container">
        {#if activeGini && state < 3}
          {#key state}
            <rect
              transition:fade|local
              x={xScale(activeGini.year)}
              y={state < 3 ? yScale(yAccessor(activeGini)) : yScale(65)}
              width="1"
              height={Math.abs(state < 3 ? yScale.range()[0] - yScale(yAccessor(activeGini)) : yScale.range()[0] - yScale(65))}
              class="hover-line"
            />
          {/key}
        {/if}
        {#if data && state >= 2}
          {#each $barchartValues as d (d.id)}
            <rect
              class={d.class}
              class:positive={d.val < 0}
              class:negative={d.val > 0}
              x={state === 2 ? xScale(d.year) - 2 : xScale(d.year) - maxBarWidth / 2 - 1 ?? 0}
              y={d.val > 0 ? yScale(d.baseY) : yScale(d.baseY - d.val)}
              height={d.val > 0 ? yScale(d.baseY - d.val) - yScale(d.baseY) : yScale(d.baseY) - yScale(d.baseY - d.val)}
              width={state === 2 ? 4 : maxBarWidth}
            />
            {#if state === 3 && d.year === 2020}
              <g in:fade={FADE_PARAMS} class={d.class} style="transform: translate({xScale(d.year)}px, {yScale(d.baseY)}px)">
                <text class={`${d.class} category end`} x={maxBarWidth / 2} y={d.class === 'covid' ? -36 : 36}
                  >{d.class === 'covid' ? covid_projection : precovid_projection}</text
                >
                <text
                  class={`number ${d.class} ${d.val > 0 ? 'negative' : 'positive'} end`}
                  x={maxBarWidth / 2}
                  y={d.class === 'covid' ? -16 : 16}>{d.val > 0 ? '+' : ''}<Number value={d.val} digits="1" /></text
                >
              </g>
            {/if}
          {/each}
        {/if}

        {#if state === 1 || state === 2}
          <g>
            <path class="projection" d="M{pos2019.x} {pos2019.y} L{pos2020precovid.x} {pos2020precovid.y}" />
            <path class="covid " d="M{pos2019.x} {pos2019.y} L{pos2020.x} {pos2020.y}" />
          </g>
        {/if}
        {#if activeScene?.id === 'gini_in_sweden' || activeScene?.id === 'gini_in_paraguay'}
          <g in:fade|local={{ delay: SHORT_TIMING, duration: LONG_TIMING }}>
            <path class="sweden" d={pathGenSweden(data?.filter((d) => d.year < 2020 && d.year > 2002))} />
            <text class="geo middle sweden" x={xScale(2010)} y={yScale(27.73816077)}>{$_('country.swe', { default: 'Sweden' })}</text>
          </g>
        {/if}
        {#if activeScene?.id === 'gini_in_paraguay'}
          <g in:fade|local={{ delay: SHORT_TIMING, duration: LONG_TIMING }}>
            <path class="paraguay" d={pathGenParaguay(data?.filter((d) => d.year < 2020 && d.year > 2002))} />
            <text class="geo middle caps paraguay" x={xScale(2012.5)} y={yScale(47.63356303)}
              >{$_('country.pry', { default: 'Paraguay' })}</text
            >
          </g>
        {/if}
        {#if data && state < 3}
          <g>
            <path d={pathGen(data.filter((d) => d.year !== 2020))} in:fade|local={{ delay: SHORT_TIMING, duration: LONG_TIMING }} />
            {#each data.filter((d) => d.year !== 2020 && d.year === activeGini?.year) as d (d.year)}
              <circle
                r={LineChartCircleRadius}
                style="transform: translate({xScale(d.year) ?? 0}px, {yScale(yAccessor(d)) ?? h - padding ?? 0}px)"
              />
            {/each}
            {#each [...data].sort((a, b) => b.year - a.year).filter((d) => d.year === 2019 || d.year === activeGini?.year) as d (d.year)}
              <text class="number" style="transform: translate({xScale(d.year) ?? 0}px, {yScale(yAccessor(d)) - 16 ?? 0}px)"
                ><Number value={yAccessor(d)} digits="1" /></text
              >
            {/each}
          </g>
        {/if}

        {#if state === 1}
          {#each data.filter((d) => d.year === 2020) as d (d.year)}
            <g class="covid-2020" style="transform: translate({pos2020.x}px, {pos2020.y}px)" in:fade|local>
              <circle r={LineChartCircleRadius} class="covid" />
              <text class="category covid end" x={0} y={-36}>{covid_projection}</text>
              <text class="number covid end" x={0} y={-16}><Number value={d.gini_covid} digits="1" /></text>
            </g>

            <g class="precovid-2020" style="transform: translate({pos2020precovid.x}px, {pos2020precovid.y}px)" in:fade|local>
              <circle class="precovid" r={LineChartCircleRadius} />
              <text class="number precovid end" x={0} y={16}><Number value={d.gini_precovid} digits="1" /></text>
              <text class="category precovid end" x={0} y={36}>{precovid_projection}</text>
            </g>
          {/each}
        {/if}

        {#if activeGini}
          <text class="label stronger ticklabel" x={xScale(activeGini.year)} y={h - padding + 11}>{activeGini.year}</text>
          {#if state === 3}
            <text
              in:fade|local={FADE_PARAMS}
              class="number"
              class:positive={activeGini.ginichange < 0}
              class:negative={activeGini.ginichange > 0}
              style="transform: translate({xScale(activeGini.year) ?? 0}px, {yScale(65) + (activeGini.ginichange < 0 ? -12 : 12)}px)"
              >{activeGini.ginichange > 0 ? '+' : ''}<Number value={yAccessor(activeGini)} digits="2" /></text
            >
          {/if}
        {/if}
      </g>
    </g>
    <rect
      class="interaction"
      x="0"
      y="0"
      width={w}
      height={h}
      on:pointerdown={updateMouse}
      on:pointermove={updateMouse}
      on:focus={updateMouse}
    />
  </svg>
</div>
<CategoricalLegend
  legendType="custom"
  customItems={[
    { key: label_decrease, colour: Colors.ColorVisBinaryPos },
    { key: label_increase, colour: Colors.ColorVisBinaryNeg }
  ]}
  hidden={activeScene.id != 'pause' && activeScene.id != 'relative_changes_gini'}
/>

<style type="text/scss">
  .gini-linechart {
    flex: 1;
    overflow: hidden;
  }

  svg {
    rect {
      fill: var(--color-vis-region-WLD);
      transition: 1s width, 1s transform;
    }

    rect.interaction {
      fill: none;
      outline-color: transparent;
      touch-action: none;
    }

    rect,
    text {
      &.positive {
        fill: var(--color-vis-binary-pos);
      }
      &.negative {
        fill: var(--color-vis-binary-neg);
      }
    }

    circle {
      fill: var(--color-vis-reference);
    }

    text {
      text-anchor: middle;
      dominant-baseline: central;
      pointer-events: none;

      &.end {
        text-anchor: end;
      }
    }

    path {
      stroke: var(--color-vis-region-WLD);
      fill: none;
    }

    path.paraguay {
      stroke: var(--color-vis-region-LCN);
    }
    path.sweden {
      stroke: var(--color-vis-region-ECS);
    }

    text.paraguay {
      fill: var(--color-vis-region-LCN);
    }
    text.sweden {
      fill: var(--color-vis-region-ECS);
    }

    .precovid {
      fill: var(--color-theme-text-weaker);
    }

    rect.precovid {
      fill: url(#tightHatch);
    }

    text.precovid {
      fill: var(--color-theme-text-weaker);
    }

    text.ticklabel {
      // just to mimic the ChartGrid labels - if that ever changes, change it here as well:
      font-size: 12px;
    }

    .covid {
      fill: var(--color-vis-region-WLD);
    }

    path,
    line {
      &.precovid {
        stroke: initial;
        fill: initial;
      }
      &.projection {
        stroke: var(--color-theme-text-weaker);
      }
    }
  }
</style>
