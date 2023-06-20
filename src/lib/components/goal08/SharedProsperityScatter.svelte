<script>
  import { scaleLinear } from 'd3-scale';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { getRegion } from './../../../data/countryRegionIncomeDictionary';
  import Tooltip from './../general/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import Number from '../general/Number.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { isMobile } from '$lib/stores/isMobile';
  import * as Tokens from '$lib/styles/vis.js';

  export let data;
  export let activeScene;
  export let fasterlabel;
  export let slowerlabel;
  export let xaxistitle;
  export let yaxistitle;
  export let parentWidth;
  export let parentHeight;

  let margins = {
    top: 12,
    right: 12,
    bottom: 12,
    left: 12
  };

  $: w = Math.round(Math.min(parentWidth, parentHeight) / Math.sqrt(2));
  $: h = w;

  $: radius = $isMobile ? Tokens.ScatterCircleRadiusMob : Tokens.ScatterCircleRadius;

  $: xScale = scaleLinear()
    .range([0, w - margins.left - margins.right])
    .domain([-6, 10]);
  const xTicks = [-5, 0, 5, 10];

  $: yScale = scaleLinear()
    .range([h - margins.bottom, margins.top])
    .domain([-6, 10]);
  const yTicks = [-5, 0, 5, 10];

  const colorScale = {
    EAS: Colors.ColorVisRegionEAS,
    ECS: Colors.ColorVisRegionECS,
    LCN: Colors.ColorVisRegionLCN,
    MEA: Colors.ColorVisRegionMEA,
    NAC: Colors.ColorVisRegionNAC,
    SAS: Colors.ColorVisRegionSAS,
    SSF: Colors.ColorVisRegionSSF
  };

  let currentCountry;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  const tweenedRotation = tweened(0, {
    duration: 1500,
    easing: cubicOut
  });
  $: if (activeScene.index > 2) {
    tweenedRotation.set(-45);
  }

  $: if (activeScene.index < 3) {
    tweenedRotation.set(0);
  }

  $: labelData = data.filter((d) => getRegion(d.iso3c) == activeScene.id);

  $: bottomgrowth = currentCountry ? data.find((d) => d.iso3c == currentCountry).growthb40 : null;
  $: meangrowth = currentCountry ? data.find((d) => d.iso3c == currentCountry).growthtotal : null;
</script>

<div class="scatter">
  <svg width={w} height={h} on:mousemove={updateMouse} class="scatterplot">
    <g transform={`translate(${margins.left}, ${margins.top}) rotate(${$tweenedRotation}, ${w / 2}, ${h / 2})`}>
      {#if activeScene.index > 2}
        <polygon
          points={`${xScale(-5)},${yScale(10)} ${xScale(10)},${yScale(10)} ${xScale(-5)},${yScale(-5)}`}
          fill={Colors.ColorThemeBgWeakest}
          opacity={0.8}
          transition:fade|local
        />
        <polygon
          points={`${xScale(-5)},${yScale(-5)} ${xScale(10)},${yScale(10)} ${xScale(10)},${yScale(-5)}`}
          fill={Colors.ColorThemeBg}
          opacity={0.8}
          transition:fade|local
        />
      {/if}
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
        xAxisTitle={xaxistitle}
      />
      {#if activeScene.index > 0}
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={yScale}
          ticks={yTicks}
          yAxisTitle={yaxistitle}
        />
      {/if}

      {#if activeScene.index > 1}
        <line
          x1={margins.left}
          x2={xScale(10)}
          y1={h - margins.bottom - margins.top}
          y2={yScale(10)}
          stroke={'white'}
          stroke-width={3}
          transition:fade|local
        />/>
        <line
          x1={margins.left}
          x2={xScale(10)}
          y1={h - margins.bottom - margins.top}
          y2={yScale(10)}
          stroke={'black'}
          stroke-width={1.5}
          transition:fade|local
        />/>
      {/if}

      {#if currentCountry}
        <circle
          cx={xScale(data.find((d) => d.iso3c == currentCountry).growthb40)}
          cy={yScale(data.find((d) => d.iso3c == currentCountry).growthtotal)}
          r={radius + 1}
          transition:fade|local={{ duration: 100 }}
          class="emphasis"
        />
      {/if}
      {#if $referenceCountry && data.find((d) => d.iso3c == $referenceCountry)}
        <circle
          cx={xScale(data.find((d) => d.iso3c == $referenceCountry).growthb40)}
          cy={yScale(data.find((d) => d.iso3c == $referenceCountry).growthtotal)}
          r={radius}
          stroke={Colors.ColorReferenceCountry}
          stroke-width={6}
          fill={'none'}
          transition:fade|local={{ duration: 100 }}
        />
      {/if}
      {#each data as country}
        <circle
          cx={xScale(country.growthb40)}
          cy={yScale(country.growthtotal)}
          r={radius}
          fill={colorScale[getRegion(country.iso3c)]}
          opacity={activeScene.index < 4
            ? 1
            : activeScene.id == getRegion(country.iso3c)
            ? 1
            : country.iso3c == $referenceCountry
            ? 1
            : 0.1}
          on:mouseover={() => (currentCountry = country.iso3c)}
          on:mouseout={() => (currentCountry = null)}
          on:focus={() => (currentCountry = country.iso3c)}
          on:blur={() => (currentCountry = null)}
        />
      {/each}
      {#if activeScene.index > 2}
        <text
          x={xScale(10) + 12}
          dx={w < 500 ? -50 : 0}
          y={yScale(10)}
          text-anchor={'start'}
          class={'small'}
          transition:fade|local={{ duration: 1500 }}
          transform={`rotate(45, ${xScale(10) + 12}, ${yScale(10)})`}>{fasterlabel + ' →'}</text
        >
        <text
          x={xScale(10) - 12}
          dx={w < 500 ? 50 : 0}
          y={yScale(10)}
          dy={w < 500 ? -16 : 0}
          text-anchor={'end'}
          class={'small'}
          transition:fade|local={{ duration: 1500 }}
          transform={`rotate(45, ${xScale(10) + 12}, ${yScale(10)})`}>{'← ' + slowerlabel}</text
        >
      {/if}
      {#if labelData}
        {#each labelData as label}
        {#if label.iso3c != $referenceCountry}
          <text
            class={w < 500 ? 'small geo' : 'geo'}
            x={label.growthb40 > label.growthtotal ? xScale(label.growthb40) + 4 : xScale(label.growthb40) - 12}
            dx={label.iso3c == 'MUS' ? -6 : 0}
            dy={label.iso3c == 'TZA' ? 10 : label.iso3c == 'MUS' ? -14 : label.iso3c == 'BGD' ? 8 : 0}
            y={yScale(label.growthtotal) + 12}
            text-anchor={label.growthb40 > label.growthtotal ? 'start' : 'end'}
            transform={`rotate(45, ${xScale(label.growthb40) + 6}, ${yScale(label.growthtotal) + 10})`}
            transition:fade|local>{$_(`country.${label.iso3c.toLowerCase()}`)}</text
          >
          {/if}
        {/each}
      {/if}
      {#if $referenceCountry && data.find((d) => d.iso3c == $referenceCountry)}
        <text
          class="label reference-label"
          x={xScale(data.find((d) => d.iso3c == $referenceCountry).growthb40) + 10}
          y={yScale(data.find((d) => d.iso3c == $referenceCountry).growthtotal) + 6}
          transform={`rotate(${-$tweenedRotation},
                ${xScale(data.find((d) => d.iso3c == $referenceCountry).growthb40) + 10},
                ${yScale(data.find((d) => d.iso3c == $referenceCountry).growthtotal) + 6})`}
          >{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
        >
      {/if}
    </g>
  </svg>
  {#if currentCountry && mousePos}
    <Tooltip visible={true} targetPos={mousePos}>
      <p class="label caps">{$_(`country.${currentCountry?.toLowerCase()}`)}</p>
      <p class="label stronger"><Number value={meangrowth + '%'} digits={1} /></p>
      <p class="label small weaker">{yaxistitle}</p>
      <hr />
      <p class="label stronger"><Number value={bottomgrowth + '%'} digits={1} /></p>
      <p class="label small weaker">{xaxistitle}</p>
    </Tooltip>
  {/if}
</div>

<style>
  .circleoutline {
    pointer-events: none;
  }
  svg {
    overflow: visible;
    margin: auto;
  }
  circle {
    pointer-events: all;
    transition: opacity 0.5s;
  }
</style>
