<script>
  import { scaleLinear } from 'd3-scale';
  import ChartGrid from '../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from '../general/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';
  import Number from '../general/Number.svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import { ScatterCircleRadius, ScatterCircleRadiusMob } from '$lib/styles/vis';

  export let data;
  export let activeScene;
  export let xaxistitle;
  export let yaxistitle;
  export let parentWidth;
  export let parentHeight;
  export let overfished;
  export let notoverfished;
  export let overfishing;
  export let notoverfishing;
  export let specieslabels;

  export let topleft;
  export let topright;
  export let bottomleft;
  export let bottomright;

  const bluefinData = [
    { year: 2016, B_Bmsy: 0.14, F_Fmsy: 1.185 },
    { year: 2018, B_Bmsy: 0.157, F_Fmsy: 1.149 },
    { year: 2020, B_Bmsy: 0.21, F_Fmsy: 1.09 }
  ];

  $: openingLabels = [
    { species_code: 'Red_snapper', area_code: 'Southern_Atlantic_Coast' },
    { species_code: 'Silky_shark', area_code: 'Western_and_Central_Pacific' },
    { species_code: 'Pacific_ocean_perch', area_code: 'Bering_Sea/Aleutian_Islands' },
    { species_code: 'Atlantic_herring', area_code: 'Northwestern_Atlantic_Coast' }
  ].map((d) => data.find((f) => f.species_code == d.species_code && f.area_code == d.area_code));

  const perchToHide = 'Gulf_of_Alaska';
  const tunaToHide = [
    { species: 'Bigeye_tuna', area: 'Eastern_Pacific' },
    { species: 'Skipjack_tuna', area: 'Western_Atlantic' }
  ];

  let margins = {
    top: 32,
    right: 10,
    bottom: 32,
    left: 32
  };

  $: w = parentWidth;
  $: h = parentHeight;

  $: xScale = scaleLinear()
    .range([0, w - margins.left - margins.right])
    .domain([0, 3]);
  const xTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3];

  $: yScale = scaleLinear()
    .range([h - margins.bottom - margins.top, 0])
    .domain([0, 3]);
  const yTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3];

  let currentFish;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  $: radius = $isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius;

  $: quadrants = [
    {
      x: xScale(0),
      y: yScale(3),
      h: yScale(1) - yScale(3),
      w: xScale(1) - xScale(0),
      colour: Colors.ColorBaseRed400,
      label: topleft
    },
    {
      x: xScale(0),
      y: yScale(1),
      h: yScale(0) - yScale(1),
      w: xScale(1) - xScale(0),
      colour: Colors.ColorBaseOrange400,
      label: bottomleft
    },
    {
      x: xScale(1),
      y: yScale(3),
      h: yScale(1) - yScale(3),
      w: xScale(3) - xScale(1),
      colour: Colors.ColorBaseYellow200,
      label: topright
    },
    {
      x: xScale(1),
      y: yScale(1),
      h: yScale(0) - yScale(1),
      w: xScale(3) - xScale(1),
      colour: Colors.ColorBaseBlue400,
      label: bottomright
    }
  ];
</script>

<div class="scatterplot">
  <svg width={w} height={h} on:mousemove={updateMouse}>
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      {#if activeScene.index > 2}
        {#each quadrants as quadrant}
          <rect
            class="quadrant"
            x={quadrant.x}
            y={quadrant.y}
            width={quadrant.w}
            height={quadrant.h}
            fill={quadrant.colour}
            style:opacity={activeScene.index > 3 ? 0.2 : 0.3}
            transition:fade|local
          />
        {/each}
      {/if}
    </g>
    <g transform={`translate(${0}, ${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.right}
        scale={yScale}
        ticks={yTicks}
        yAxisTitle={yaxistitle}
      />
    </g>
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
        xAxisTitle={xaxistitle}
      />
      <line
        x1={xScale(1)}
        x2={xScale(1)}
        y1={yScale(0)}
        y2={yScale(3)}
        stroke={Colors.ColorThemeText}
        stroke-width={1.5}
        transition:fade|local
      />
      <line
        x1={xScale(0) - margins.left}
        x2={xScale(3)}
        y1={yScale(1)}
        y2={yScale(1)}
        stroke={Colors.ColorThemeText}
        stroke-width={1.5}
        transition:fade|local
      />

      {#if currentFish}
        <circle
          cx={xScale(currentFish.B_Bmsy)}
          cy={yScale(currentFish.F_Fmsy)}
          r={radius + 2}
          transition:fade|local={{ duration: 100 }}
          class="circleoutline emphasis"
        />
      {/if}

      {#if activeScene.index < 3}
        {#each openingLabels as fish}
          <circle class="emphasisbg" cx={xScale(fish.B_Bmsy)} cy={yScale(fish.F_Fmsy)} r={radius + 2} />
          <circle class="emphasis" cx={xScale(fish.B_Bmsy)} cy={yScale(fish.F_Fmsy)} r={radius + 2} />
        {/each}
      {/if}

      {#each data as fish}
        <circle
          cx={xScale(fish.B_Bmsy)}
          cy={yScale(fish.F_Fmsy)}
          r={radius}
          stroke={'white'}
          stroke-width={1}
          fill={Colors.ColorBaseOrange400}
          on:mouseover={() => (currentFish = fish)}
          on:mouseout={() => (currentFish = null)}
          on:focus={() => (currentFish = fish)}
          on:blur={() => (currentFish = null)}
          opacity={(activeScene.id == 'perch' && fish.species_code.includes('perch')) ||
          (activeScene.id == 'tuna' && fish.species_code.includes('tuna'))
            ? 1
            : activeScene.index > 2
            ? 0.2
            : 1}
        />
      {/each}

      {#if activeScene.index < 3}
        {#each openingLabels as label}
          <text class="small stronger" x={xScale(label.B_Bmsy) + 10} y={yScale(label.F_Fmsy) + 4} transition:fade|local
            >{specieslabels.find((d) => d.code == label.species_code).label}</text
          >
        {/each}
      {/if}

      {#if activeScene.id == 'perch'}
        {#each data.filter((d) => d.species_code.includes('perch')) as perch}
          <circle class="emphasisbg" cx={xScale(perch.B_Bmsy)} cy={yScale(perch.F_Fmsy)} r={radius + 2} />
          <circle class="emphasis" cx={xScale(perch.B_Bmsy)} cy={yScale(perch.F_Fmsy)} r={radius + 2} />
          {#if perch.area_code != perchToHide && !$isMobile}
            <text class="small stronger" x={xScale(perch.B_Bmsy) + 10} y={yScale(perch.F_Fmsy) + 4} transition:fade|local
              >{specieslabels.find((d) => d.code == perch.species_code).label}</text
            >
          {/if}
        {/each}
      {/if}

      {#if activeScene.id == 'tuna'}
        {#each data.filter((d) => d.species_code.includes('tuna')) as tuna}
          <circle class="emphasisbg" cx={xScale(tuna.B_Bmsy)} cy={yScale(tuna.F_Fmsy)} r={radius + 2} />
          <circle class="emphasis" cx={xScale(tuna.B_Bmsy)} cy={yScale(tuna.F_Fmsy)} r={radius + 2} />
        {/each}
        {#each data.filter((d) => d.species_code.includes('tuna')) as tuna}
          {#if !(tunaToHide.map((d) => d.area).includes(tuna.area_code) && tunaToHide.map((d) => d.species).includes(tuna.species_code)) && !$isMobile}
            <text class="small stronger" x={xScale(tuna.B_Bmsy) + 10} y={yScale(tuna.F_Fmsy) + 4} transition:fade|local
              >{specieslabels.find((d) => d.code == tuna.species_code).label}</text
            >
          {/if}
        {/each}
      {/if}

      {#if activeScene.index > 0 && activeScene.index < 3}
        <text class="category" x={xScale(1)} dx={6} y={12} text-anchor={'start'} transition:fade|local>{notoverfished}</text>
        <text class="category" x={xScale(1)} dx={-6} y={12} text-anchor={'end'} transition:fade|local>{overfished}</text>
      {/if}
      {#if activeScene.index == 2}
        <text class="category" x={xScale(0)} dx={6} y={yScale(1)} dy={20} transition:fade|local>{notoverfishing}</text>
        <text class="category" x={xScale(0)} dx={6} y={yScale(1)} dy={-8} transition:fade|local>{overfishing}</text>
      {/if}

      {#if activeScene.id == 'bluefin-trajectory'}
        {#each bluefinData as fish, i}
          <circle
            cx={xScale(fish.B_Bmsy)}
            cy={yScale(fish.F_Fmsy)}
            r={radius}
            stroke={'white'}
            stroke-width={1}
            fill={Colors['ColorBaseOrange' + (i * 100 + 300)]}
            transition:fade|local
          />
          <text
            class="small"
            x={xScale(fish.B_Bmsy)}
            y={yScale(fish.F_Fmsy)}
            dx={fish.year == 2020 ? 8 : fish.year == 2018 ? -7 : 0}
            dy={fish.year == 2020 ? 6 : fish.year == 2018 ? 15 : -8}
            text-anchor={fish.year == 2020 ? 'start' : fish.year == 2018 ? 'end' : 'middle'}
            transition:fade|local>{fish.year}</text
          >
        {/each}
      {/if}
    </g>
  </svg>
  {#if activeScene.index > 2}
    {#each quadrants as quadrant}
      <div
        class="quadrant-label"
        style:position={'absolute'}
        style:left={margins.left + quadrant.x + 'px'}
        style:top={margins.top + quadrant.y + 'px'}
        style:width={quadrant.w + 'px'}
        style:height={quadrant.h + 'px'}
      >
        {quadrant.label}
      </div>
    {/each}
  {/if}
  {#if currentFish && mousePos}
    <Tooltip visible={true} targetPos={mousePos}>
      <p class="label caps">{currentFish.species}</p>
      <p class="label caps">{currentFish.area}</p>
      <p class="label stronger"><Number value={currentFish.F_Fmsy} digits={2} /></p>
      <p class="label small weaker">{yaxistitle}</p>
      <hr />
      <p class="label stronger"><Number value={currentFish.B_Bmsy} digits={2} /></p>
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
  rect.quadrant {
    transition: opacity 0.5s;
    pointer-events: none;
  }

  circle {
    pointer-events: all;
    transition: opacity 0.5s;
  }
  .scatterplot {
    position: relative;
  }
  .quadrant-label {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2px;
    letter-spacing: var(--letter-spacing-5);
    /* text-shadow: -1px -1px white, -1px 1px white, 1px 1px white, 1px -1px white, -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;*/
  }
</style>
