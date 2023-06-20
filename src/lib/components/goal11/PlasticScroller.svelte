<script>
  import { stack, stackOrderNone, stackOffsetNone, area, curveNatural } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from '../ChartGrid.svelte';
  import Number from '../general/Number.svelte';
  import { fade } from 'svelte/transition';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let parentHeight;
  export let data;
  export let activeScene;
  export let generation;
  export let incinerated;
  export let landfilled;
  export let mismanaged;
  export let recycled;
  export let littered;
  export let yaxisunits;

  const breakdownMapper = {
    generation2020: [{ key: 'generation', label: generation, colour: Colors.ColorVisReference, x: 2010, y: 110 }],
    generation2060: [{ key: 'generation', label: generation, colour: Colors.ColorVisReference, x: 2030, y: 250 }],
    fate2020: [
      { key: 'incinerated', label: incinerated, colour: Colors.ColorBaseYellow300, x: 2010, y: 5 },
      { key: 'landfilled', label: landfilled, colour: Colors.ColorBasePurple700, x: 2010, y: 100 },
      { key: 'mismanaged', label: mismanaged, colour: Colors.ColorBaseOrange500, x: 2010, y: 190 },
      { key: 'recycled', label: recycled, colour: Colors.ColorBaseBlue300, x: 2013, y: 260 }
    ],
    fate2060: [
      { key: 'incinerated', label: incinerated, colour: Colors.ColorBaseYellow300, x: 2040, y: 50 },
      { key: 'landfilled', label: landfilled, colour: Colors.ColorBasePurple700, x: 2040, y: 250 },
      { key: 'mismanaged', label: mismanaged, colour: Colors.ColorBaseOrange500, x: 2040, y: 460 },
      { key: 'recycled', label: recycled, colour: Colors.ColorBaseBlue300, x: 2040, y: 560 },
      { key: 'littered', label: littered, colour: Colors.ColorBaseTeal600, x: 2010, y: 2 }
    ]
  };

  let margins = {
    top: 16,
    right: 14,
    bottom: 30,
    left: 24
  };
  let w;
  let h = parentHeight;

  let stackedData = null;

  $: if (activeScene) {
    stackedData = stack()
      .keys(breakdownMapper[activeScene.id].map((d) => d.key))
      .order(stackOrderNone)
      .offset(stackOffsetNone)(data);
  }

  const xMax = tweened(2020, {
    duration: 1250,
    easing: cubicOut
  });

  $: if (activeScene && activeScene.index > 1) {
    xMax.set(2060);
  }
  $: if (activeScene && activeScene.index < 2) {
    xMax.set(2020);
  }

  $: xScale = scaleLinear()
    .domain([2000, $xMax])
    .range([0, w - margins.left - margins.right]);
  $: xTicks = activeScene.index < 2 ? [2000, 2010, 2020] : [2000, 2020, 2040, 2060];

  $: yScale = scaleLinear()
    .domain([0, 1100])
    .range([h - margins.top - margins.bottom, 0]);
  let yTicks = [0, 250, 500, 750, 1000];
  $: areaGenerator = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveNatural);

  /*let hoveredData;
    let hoveredYear;
    let mousePos = { x: 0, y: 0 };
    function updateMouse(evt) {
      mousePos = { x: evt.offsetX, y: evt.clientY };
      hoveredYear = Math.round(xScale.invert(mousePos.x - margins.left));
    }*/
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h} class="stacked-area">
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={yaxisunits}
      />
    </g>
    <g transform={`translate(${margins.left},${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />
      {#if stackedData && areaGenerator && xScale && yScale}
        {#each stackedData as series, i (series.key)}
          <path
            d={areaGenerator(series)}
            stroke={'white'}
            stroke-width={1.5}
            fill={breakdownMapper[activeScene.id][i].colour}
            transition:fade|local={{ duration: 1000 }}
          />
        {/each}
        <!--
          {#if hoveredData && stackedData && areaGenerator && stackedData.find((d) => d.key == hoveredData)}
        
            <path
              class="hover-outline"
              d={areaGenerator(stackedData.find((d) => d.key == hoveredData))}
              style:stroke={'white'}
              style:stroke-width={4}
              style:fill={'none'}
            />
            <path
              class="hover-outline"
              d={areaGenerator(stackedData.find((d) => d.key == hoveredData))}
              style:stroke={'black'}
              style:stroke-width={2}
              style:fill={'none'}
            />
          {/if}-->
        {#each stackedData as series}
          {#if breakdownMapper[activeScene.id].find((d) => d.key == series.key).x}
            <text
              class={'label category no-stroke'}
              class:white={!series.key.startsWith('other') && !series.key.startsWith('recycled')}
              x={xScale(breakdownMapper[activeScene.id].find((d) => d.key == series.key).x)}
              y={yScale(breakdownMapper[activeScene.id].find((d) => d.key == series.key).y)}
              text-anchor={'middle'}
              transition:fade|local>{breakdownMapper[activeScene.id].find((d) => d.key == series.key).label}</text
            >
          {/if}
        {/each}
      {/if}
    </g>
  </svg>
  <!--{#if hoveredData && mousePos && breakdownMapper[activeScene.id].find((d) => d.key == hoveredData) && data.find((d) => d.year == hoveredYear)}
      <Tooltip visible={true} targetPos={{ x: mousePos.x + margins.left, y: mousePos.y }}>
        <p class="label caps">{breakdownMapper[activeScene.id].find((d) => d.key == hoveredData).label}</p>
        <p class="label stronger">
          {hoveredYear + ': '}<Number value={Math.round(data.find((d) => d.year == hoveredYear)[hoveredData])} />
          {tonnes}
        </p>
      </Tooltip>
    {/if}-->
</div>

<style>
  text.label {
    pointer-events: none;
  }
</style>
