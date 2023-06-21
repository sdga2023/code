<script>
  import { scaleLinear } from 'd3-scale';
  import { area, stack, curveNatural } from 'd3-shape';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';

  import subsectorDataFile from '../../../data/goal09/goal09.subsectoremissions.json';

  export let data;
  export let activeScene;
  export let transport;
  export let electricity_heat;
  export let industry;
  export let other_energy;
  export let residential;
  export let services;
  export let other;
  export let lightduty;
  export let heavytrucks;
  export let shipping;
  export let aviation;
  export let bus;
  export let twothreewheelers;
  export let rail;

  let translationMap = {
    'transport': transport,
    'electricity_heat': electricity_heat,
    'industry': industry,
    'other_energy': other_energy,
    'residential': residential,
    'services': services,
    'other': other,
    'lightduty': lightduty,
    'heavytrucks': heavytrucks,
    'shipping': shipping,
    'aviation': aviation,
    'bus': bus,
    'twothreewheelers': twothreewheelers,
    'rail': rail
  }

  $: sectors = data ? Object.getOwnPropertyNames(data[0]).filter((d) => d != 'year') : [];

  $: stackedData = data ? stack().keys(sectors)(data) : [];

  $: labels =
    stackedData.length > 0
      ? sectors.map((d, i) => {
          let obj = {};
          const y0 = stackedData[i].find((c) => c.data.year == 2019)[0];
          const y1 = stackedData[i].find((c) => c.data.year == 2019)[1];
          obj.key = d;
          obj.x = 2019;
          obj.y = y0 + (y1 - y0) / 2;
          return obj;
        })
      : [];

  let subsectorData = subsectorDataFile;
  let subsectors = Object.getOwnPropertyNames(subsectorData[0]).filter((d) => d != 'year' && d != 'type');
  $: subsectorData = subsectorData ? stack().keys(subsectors)(subsectorData) : [];

  let margins = {
    top: 20,
    right: 120,
    bottom: 24,
    left: 40
  };

  let colorScale = {
    lightduty: Colors.ColorVisRegionLCN,
    heavytrucks: Colors.ColorVisRegionSAS,
    shipping: Colors.ColorVisRegionSSF,
    aviation: Colors.ColorVisRegionECS,
    bus: Colors.ColorVisRegionMEA,
    twothreewheelers: Colors.ColorVisRegionNAC,
    rail: Colors.ColorVisRegionEAS
  };

  let w;
  let h = 450;

  const xLimitMax = tweened(2019, {
    duration: 1500,
    easing: cubicInOut
  });
  const xLimitMin = tweened(1990, {
    duration: 1500,
    easing: cubicInOut
  });
  const yLimitMax = tweened(35000, {
    duration: 1500,
    easing: cubicInOut
  });
  let xTicks = [1990, 2000, 2010, 2019];
  let yTicks = [10000, 20000, 30000];
  $: if (activeScene.index == 0) {
    $xLimitMin = 1990;
    $xLimitMax = 2019;
    $yLimitMax = 35000;
    xTicks = [1990, 2000, 2010, 2019];
    yTicks = [10000, 20000, 30000];
  }
  $: if (activeScene.index == 1) {
    $xLimitMin = 2019;
    $xLimitMax = 2030;
    $yLimitMax = 8000;
    xTicks = [2019, 2020];
    yTicks = [2500, 5000, 7500];
  }
  $: if (activeScene.index == 2) {
    $xLimitMin = 2019;
    $xLimitMax = 2030;
    xTicks = [2019, 2020, 2030];
  }

  $: xScale = scaleLinear()
    .domain([$xLimitMin, $xLimitMax])
    .range([0, w - margins.left - margins.right]);

  $: yScale = scaleLinear()
    .domain([0, $yLimitMax])
    .range([h - margins.top - margins.bottom, 0]);

  $: areaGenerator = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveNatural);
</script>

<div class="stackedarea" bind:clientWidth={w}>
  {#if w}
  <svg width={w} height={h}>
    <g transform={'translate(0,' + margins.top + ')'}>
      {#if yScale && yTicks && w}
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          scale={yScale}
          ticks={yTicks}
        />
      {/if}
    </g>
    <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
      {#if xScale && xTicks && w}
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
        />
      {/if}
      {#if stackedData}
        {#each stackedData as serie, i}
          <path d={areaGenerator(serie)} fill={Colors.ColorBaseBlue400} stroke={'#ffffff'} stroke-width={1} />
        {/each}
      {/if}
      {#if subsectorData.length > 0 && activeScene.index > 0 && xScale && yScale}
        {#each subsectorData as subsector, i}
          <rect
            x={xScale(2020) - 25}
            y={yScale(subsector[0][1])}
            width={50}
            height={yScale(subsector[0][0]) - yScale(subsector[0][1])}
            fill={colorScale[subsector.key]}
            stroke="white"
            stroke-width={1}
          />
          <text
            x={xScale(2020) + 28}
            y={yScale(subsector[0][1]) + (yScale(subsector[0][0]) - yScale(subsector[0][1])) / 2 + 4}
            dy={subsector.key == "rail" ? -8 : 0}
            class="small"
            fill={colorScale[subsector.key]}>{translationMap[subsector.key]}</text
          >
        {/each}
      {/if}
      {#if subsectorData.length > 0 && activeScene.id == 'projection1' && xScale && yScale}
        {#each subsectorData as subsector, i}
          <polygon
            points={`
            ${xScale(2020) + 25},${yScale(subsector[0][1])} 
            ${xScale(2030) - 25},${yScale(subsector[1][1])} 
            ${xScale(2030) - 25},${yScale(subsector[1][0])}
            ${xScale(2020) + 25},${yScale(subsector[0][0])}
        `}
            fill={colorScale[subsector.key]}
            stroke="white"
            stroke-width={1}
            opacity={0.3}
          />
          <rect
            x={xScale(2030) - 25}
            y={yScale(subsector[1][1])}
            width={50}
            height={yScale(subsector[1][0]) - yScale(subsector[1][1])}
            fill={colorScale[subsector.key]}
            stroke="white"
            stroke-width={1}
          />
        {/each}
      {/if}
      {#if subsectorData.length > 0 && activeScene.id == 'projection2' && xScale && yScale}
        {#each subsectorData as subsector, i}
          <polygon
            points={`
            ${xScale(2020) + 25},${yScale(subsector[0][1])} 
            ${xScale(2030) - 25},${yScale(subsector[2][1])} 
            ${xScale(2030) - 25},${yScale(subsector[2][0])}
            ${xScale(2020) + 25},${yScale(subsector[0][0])}
        `}
            fill={colorScale[subsector.key]}
            stroke="white"
            stroke-width={1}
            opacity={0.3}
          />
          <rect
            x={xScale(2030) - 25}
            y={yScale(subsector[2][1])}
            width={50}
            height={yScale(subsector[2][0]) - yScale(subsector[2][1])}
            fill={colorScale[subsector.key]}
            stroke="white"
            stroke-width={1}
          />
        {/each}
      {/if}
      {#if activeScene.index == 0}
        {#each labels as label, i}
          <text
            x={xScale(label.x)}
            y={yScale(label.y) + 5}
            dy={label.key == "other" ? -8 : 0}
            text-anchor={'start'}
            fill={colorScale['lightduty']}
            transition:fade|local
            class="small">{translationMap[label.key]}</text
          >
        {/each}
      {/if}
    </g>
  </svg>
  {/if}
</div>

<style>
  .stackedarea {
    width: 100%;
  }
</style>
