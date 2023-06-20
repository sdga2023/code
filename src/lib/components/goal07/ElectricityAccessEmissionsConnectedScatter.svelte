<script>
  import { scaleLinear, scaleSequential } from 'd3';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from './../general/Tooltip.svelte';
  import Number from './../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';
  import { line, curveCatmullRom } from 'd3-shape';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { EASRamp, ECSRamp, LCNRamp, MEARamp, NACRamp, SASRamp, SSFRamp, WLDRamp } from '$lib/styles/colorscales';
  import { isMobile } from '$lib/stores/isMobile';
  import * as Tokens from '$lib/styles/vis.js';

  export let data;
  $: dataToDisplay = data.filter(d => d.year % 2 == 0)

  export let activeScene;
  export let parentHeight;
  export let parentWidth;

  export let xaxistitle;
  export let xaxisunits;
  export let yaxistitle;
  export let yaxisunits;

  $: mobile = $isMobile;

  $: radius = $isMobile ? Tokens.ScatterCircleRadiusMob : Tokens.ScatterCircleRadius;
  $: circleRadiusScale = scaleLinear().domain([2000, 2019]).range([1, radius]);

  let highlightMap = {
    world: ['WLD'],
    'eas-mea-lac': ['EAS', 'MEA', 'LCN'],
    'eca-nac': ['ECS', 'NAC'],
    sas: ['SAS'],
    ssf: ['SSF']
  };

  let margins = {
    top: 30,
    right: 20,
    bottom: 35,
    left: 20
  };

  $: w = parentWidth;
  $: h = parentHeight;

  const yMax = tweened(4, {
    duration: 750,
    easing: cubicOut
  });
  const xMin = tweened(75, {
    duration: 750,
    easing: cubicOut
  });

  $: if (activeScene && activeScene.id == 'eca-nac') {
    yMax.set(10);
    yTicks = [0, 2.5, 5, 7.5, 10];
  }
  $: if (activeScene && activeScene.id == 'eas-mea-lac') {
    yMax.set(4);
    yTicks = [0, 1, 2, 3, 4];
    xMin.set(75);
    xTicks = [80, 90, 100];
  }
  $: if (activeScene && activeScene.id == 'sas') {
    xMin.set(50);
    xTicks = [50, 75, 100];
  }

  $: if (activeScene && activeScene.id == 'ssf') {
    xMin.set(25);
    xTicks = [25, 50, 75, 100];
  }

  $: xScale = scaleLinear()
    .range([0, w - margins.left - margins.right])
    .domain([$xMin, 100]);
  let xTicks = [80, 90, 100];
  $: yScale = scaleLinear()
    .range([h - margins.bottom - margins.top, 0])
    .domain([0, $yMax]);
  let yTicks = [0, 1, 2, 3, 4];

  let colorScale = {
    LCN: Colors.ColorVisRegionLCN,
    SAS: Colors.ColorVisRegionSAS,
    SSF: Colors.ColorBaseYellow400,
    ECS: Colors.ColorVisRegionECS,
    MEA: Colors.ColorVisRegionMEA,
    NAC: Colors.ColorVisRegionNAC,
    EAS: Colors.ColorVisRegionEAS,
    WLD: Colors.ColorVisRegionWLD
  };

  let colorScaleYear = {
    LCN: LCNRamp,
    SAS: SASRamp,
    SSF: SSFRamp,
    ECS: ECSRamp,
    MEA: MEARamp,
    NAC: NACRamp,
    EAS: EASRamp,
    WLD: WLDRamp
  };

  $: lineGenerator = line()
    .x((d) => xScale(d.access))
    .y((d) => yScale(d.emissions_percap))
    .curve(curveCatmullRom);

  let hoveredData;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  $: labelData = data.filter((d) => d.year == 2010);
</script>

<div class="container" bind:clientWidth={w} bind:clientHeight={h}>
  {#if w}
    <svg width={w} height={h} on:mousemove={updateMouse}>
      <defs />
      <g transform={'translate(0,' + margins.top + ')'}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          scale={yScale}
          ticks={yTicks}
          yAxisTitle={yaxistitle}
          yAxisUnits={yaxisunits}
        />
      </g>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left}
          scale={xScale}
          ticks={xTicks}
          xAxisTitle={xaxistitle}
          xAxisUnits={xaxisunits}
        />
        {#if activeScene && highlightMap[activeScene.id]}
          {#each Object.keys(colorScale) as region}
            <path
              d={lineGenerator(dataToDisplay.filter((d) => d.iso3c == region))}
              fill="none"
              stroke={colorScale[region]}
              stroke-width={8}
              opacity={highlightMap[activeScene.id].includes(region) ? 0.6 : 0.1}
            />
          {/each}
        {/if}
        {#if hoveredData}
          <circle
            cx={xScale(hoveredData.access)}
            cy={yScale(hoveredData.emissions_percap)}
            r={6}
            stroke={'black'}
            stroke-width={2}
            fill={'none'}
            transition:fade|local={{ duration: 100 }}
            class="circleoutline"
          />
        {/if}
        {#if activeScene && highlightMap[activeScene.id]}
          {#each dataToDisplay as regionyear}
            <circle
              cx={xScale(regionyear.access)}
              cy={yScale(regionyear.emissions_percap)}
              r={circleRadiusScale(regionyear.year)}
              stroke={'white'}
              stroke-width={1}
              fill={colorScale[regionyear.iso3c]}
              opacity={highlightMap[activeScene.id].includes(regionyear.iso3c) ? 1 : 0.1}
              on:mouseover={() => (hoveredData = regionyear)}
              on:mouseout={() => (hoveredData = null)}
              on:focus={() => (hoveredData = regionyear)}
              on:blur={() => (hoveredData = null)}
            />
          {/each}
          {#each labelData as label}
            <text
              x={label.iso3c == 'SSF' && mobile ? xScale(25) : xScale(label.access)}
              dx={label.iso3c == 'NAC' || label.iso3c == 'ECS' ? -10 : 0}
              y={yScale(label.emissions_percap)}
              dy={label.iso3c == 'MEA'
                ? 10
                : label.iso3c == 'NAC' || label.iso3c == 'ECS'
                ? 24
                : mobile && label.iso3c == 'SSF'
                ? -10
                : -20}
              style:fill={colorScale[label.iso3c]}
              text-anchor={['ECS', 'NAC'].includes(label.iso3c) || (mobile && ['ECS', 'NAC', 'EAS', 'MEA', 'LCN'].includes(label.iso3c))
                ? 'end'
                : mobile && label.iso3c == 'SSF'
                ? 'start'
                : 'middle'}
              opacity={highlightMap[activeScene.id].includes(label.iso3c) ? 1 : 0}
              class="geo">{$_(`region.${label.iso3c}`)}</text
            >
          {/each}
        {/if}
      </g>
    </svg>
    {#if hoveredData && mousePos}
      <Tooltip visible={true} targetPos={mousePos}>
        <p class="label caps">{$_(`region.${hoveredData.iso3c}`)}, {hoveredData.year}</p>
        <p class="number"><Number value={hoveredData.access + '%'} digits={1} /></p>
        <p class="label small weaker">{xaxistitle}</p>
        <hr />
        <p class="number"><Number value={hoveredData.emissions_percap} digits={1} /> {yaxisunits}</p>
        <p class="label small weaker">{yaxistitle}</p>
      </Tooltip>
    {/if}
  {/if}
</div>

<!--
<Legend
  color={scaleSequential().interpolator(colorScaleYear['WLD']).domain([2000, 2019])}
  tickLabels={[
    { value: 2000, label: '2000' },
    { value: 2010, label: '2010' },
    { value: 2019, label: '2019' }
  ]}
/>
-->
<style>
  circle,
  path,
  text {
    transition: opacity 0.25s;
  }
  .container {
    flex: 1;
    overflow: hidden;
  }
  path {
    stroke-width: 8;
    stroke-linecap: round;
  }
</style>
