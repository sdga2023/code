<script>
  import { stack, stackOrderNone, stackOffsetNone, area, curveNatural } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from '../ChartGrid.svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { _ } from 'svelte-i18n';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import { fade } from 'svelte/transition';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { isMobile } from '$lib/stores/isMobile';

  export let parentHeight;
  export let data;
  export let activeScene;
  export let capture;
  export let aquaculture;
  export let capture_inland;
  export let capture_sea;
  export let aquaculture_inland;
  export let aquaculture_sea;
  export let arctic;
  export let atlantic;
  export let indian;
  export let pacific;
  export let medblack;
  export let othercountry;
  export let pollock;
  export let anchovy;
  export let herring;
  export let whiting;
  export let sardine;
  export let cod;
  export let pacific_sardine;
  export let otherspecies;
  export let mackerel;
  export let skipjack;
  export let yellowfin;
  export let tonnes;
  export let yaxisunits;

  const breakdownMapper = {
    intro: [
      { key: 'capture', label: capture, colour: Colors.ColorBaseOrange300, x: 1990, y: 40000000 },
      { key: 'aquaculture', label: aquaculture, colour: Colors.ColorBaseBlue500, x: 2007, y: 105000000 }
    ],
    inland_sea: [
      { key: 'capture_sea', label: capture_sea, colour: Colors.ColorBaseOrange300, x: 1990, y: 40000000 },
      { key: 'capture_inland', label: capture_inland, colour: Colors.ColorBaseOrange500, x: 2007, y: 85000000 },
      { key: 'aquaculture_inland', label: aquaculture_inland, colour: Colors.ColorBaseBlue700, x: 2006, y: 98000000 },
      { key: 'aquaculture_sea', label: aquaculture_sea, colour: Colors.ColorBaseBlue500, x: 2006, y: 120000000 }
    ],
    capture: [{ key: 'capture_sea', label: capture_sea, colour: Colors.ColorBaseOrange300, x: 1990, y: 40000000 }],
    area: [
      { key: 'pacific', label: pacific, colour: Colors.ColorBaseBlue700, x: 1990, y: 25000000 },
      { key: 'atlantic', label: atlantic, colour: Colors.ColorBaseBlue600, x: 2000, y: 60000000 },
      { key: 'indian', label: indian, colour: Colors.ColorBaseBlue400, x: 2011, y: 72000000 },
      { key: 'medblack', label: medblack, colour: Colors.ColorBaseBlue300 },
      { key: 'arctic', label: arctic, colour: Colors.ColorBaseBlue200 }
    ],
    // 1 China, 2 Indonesia, 3 Peru, 4 Russia, 5 USA, 6 India , 7 Vietnam, 8 Japan, 9 Norway and 10 Chile.
    country: [
      { key: 'CHL', label: $_(`country.chl`), colour: Colors.ColorBaseTeal300 },
      { key: 'NOR', label: $_(`country.nor`), colour: Colors.ColorBaseTeal300 },
      { key: 'JPN', label: $_(`country.jpn`), colour: Colors.ColorBaseTeal300 },
      { key: 'IND', label: $_(`country.ind`), colour: Colors.ColorBaseTeal300 },
      { key: 'VNM', label: $_(`country.vnm`), colour: Colors.ColorBaseTeal300 },
      { key: 'USA', label: $_(`country.usa`), colour: Colors.ColorBaseTeal300 },
      { key: 'RUS', label: $_(`country.rus`), colour: Colors.ColorBaseTeal300 },
      { key: 'PER', label: $_(`country.per`), colour: Colors.ColorBaseTeal300, x: 2002, y: 26000000 },
      { key: 'IDN', label: $_(`country.idn`), colour: Colors.ColorBaseTeal300, x: 2008, y: 32000000 },
      { key: 'CHN', label: $_(`country.chn`), colour: Colors.ColorBaseTeal300, x: 2007, y: 41000000 },
      { key: 'other_country', label: othercountry, colour: Colors.ColorBaseTeal100, x: 2000, y: 64000000 }
    ],
    species: [
      { key: 'cod', label: cod, colour: Colors.ColorBaseOrange300 },
      { key: 'pacific_sardine', label: pacific_sardine, colour: Colors.ColorBaseOrange300, x: 1986, y: 4000000 },
      { key: 'whiting', label: whiting, colour: Colors.ColorBaseOrange300 },
      { key: 'sardine', label: sardine, colour: Colors.ColorBaseOrange300 },
      { key: 'herring', label: herring, colour: Colors.ColorBaseOrange300 },
      { key: 'yellowfin', label: yellowfin, colour: Colors.ColorBaseOrange300 },
      { key: 'mackerel', label: mackerel, colour: Colors.ColorBaseOrange300 },
      { key: 'skipjack', label: skipjack, colour: Colors.ColorBaseOrange300 },
      { key: 'pollock', label: pollock, colour: Colors.ColorBaseOrange300, x: 2009, y: 12000000 },
      { key: 'anchovy', label: anchovy, colour: Colors.ColorBaseOrange300, x: 2004, y: 17000000 },
      { key: 'other_species', label: otherspecies, colour: Colors.ColorBaseOrange200, x: 2000, y: 50000000 }
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

  $: xScale = scaleLinear()
    .domain([1950, 2021])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [1950, 1970, 1990, 2010, 2021];

  const yMax = tweened(200000000, {
    duration: 750,
    delay: 1000,
    easing: cubicOut
  });

  $: yScale = scaleLinear()
    .domain([0, $yMax])
    .range([h - margins.top - margins.bottom, 0]);
  let yTicks = [0, 50000000, 100000000, 150000000, 200000000];
  $: areaGenerator = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveNatural);

  $: if (activeScene && activeScene.index > 1) {
    yMax.set(100000000);
    yTicks = [0, 50000000, 100000000, 150000000, 200000000];
  }
  $: if (activeScene && activeScene.index < 2) {
    yMax.set(200000000);
    yTicks = [0, 50000000, 100000000, 150000000, 200000000];
  }

  let hoveredData;
  let hoveredYear;
  let mousePos = { x: 0, y: 0 };
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
    hoveredYear = Math.round(xScale.invert(evt.offsetX - margins.left));
  }
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h} on:mousemove={updateMouse} class="stacked-area">
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={yaxisunits}
        yDivisor={1000000}
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
            style:opacity={series.key == hoveredData ? 0.6 : 1}
            on:mouseover={() => (hoveredData = series.key)}
            on:mouseout={() => (hoveredData = null)}
            on:focus={() => (hoveredData = series.key)}
            on:blur={() => (hoveredData = null)}
            transition:fade|local={{ duration: 1000 }}
          />
        {/each}
        {#if breakdownMapper[activeScene.id].find((d) => d.key == $referenceCountry)}
          <path
            d={areaGenerator(stackedData.find((d) => d.key == $referenceCountry))}
            style:stroke={'white'}
            style:stroke-width={4}
            fill="none"
            style:pointer-events={'none'}
          />
          <path class="reference" d={areaGenerator(stackedData.find((d) => d.key == $referenceCountry))} style:pointer-events={'none'} />
        {/if}
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
              class={$isMobile ? 'label category no-stroke extra-small' : 'label category no-stroke'}
              class:white={!series.key.startsWith('other')}
              x={xScale(breakdownMapper[activeScene.id].find((d) => d.key == series.key).x)}
              y={yScale(breakdownMapper[activeScene.id].find((d) => d.key == series.key).y)}
              text-anchor={'middle'}
              transition:fade|local>{breakdownMapper[activeScene.id].find((d) => d.key == series.key).label}</text
            >
          {/if}
        {/each}
        {#if breakdownMapper[activeScene.id].find((d) => d.key == $referenceCountry)}
          <text
            class={'reference-label'}
            x={xScale(1990)}
            y={yScale(
              stackedData.find((d) => d.key == $referenceCountry)[40][0] +
                (stackedData.find((d) => d.key == $referenceCountry)[40][1] - stackedData.find((d) => d.key == $referenceCountry)[40][0]) /
                  2
            ) + 5}
            text-anchor={'middle'}
            transition:fade|local>{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
          >
        {/if}
      {/if}
    </g>
  </svg>
  {#if hoveredData && mousePos && breakdownMapper[activeScene.id].find((d) => d.key == hoveredData) && data.find((d) => d.year == hoveredYear)}
    <Tooltip visible={true} targetPos={{ x: mousePos.x, y: mousePos.y }}>
      <p class="label caps">{breakdownMapper[activeScene.id].find((d) => d.key == hoveredData).label}</p>
      <p class="label stronger">
        {hoveredYear + ': '}<Number value={Math.round(data.find((d) => d.year == hoveredYear)[hoveredData])} />
        {tonnes}
      </p>
    </Tooltip>
  {/if}
</div>

<style>
  text.label {
    pointer-events: none;
  }
  .extra-small {
    font-size: 0.7rem !important;
  }
</style>
