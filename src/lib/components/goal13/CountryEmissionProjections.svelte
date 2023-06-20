<script>
  import { max } from 'd3-array';
  import { nest } from 'd3-collection';
  import { line, curveNatural } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from './../ChartGrid.svelte';
  import { CountryPicker } from '$lib/components';

  export let data;

  let margins = {
    top: 20,
    right: 120,
    bottom: 40,
    left: 20
  };
  let w;
  let h = 500;

  $: nestedData = data
    ? nest()
        .key((d) => d.iso3c)
        .key((d) => d.scenario)
        .entries(data)
    : [];

  let selected = 'BEL';
  $: countryData = nestedData.length > 0 ? nestedData.find((d) => d.key === selected).values : [];

  $: xScale = scaleLinear()
    .domain([2018, 2050])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [2020, 2030, 2040, 2050];

  $: maxY = data
    ? max(
        data.filter((d) => d.iso3c === selected),
        (d) => d.value
      )
    : 1;
  $: yScale = scaleLinear()
    .domain([0, maxY])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = yScale.ticks().filter((d, i) => i % 2 == 0);

  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value))
    .curve(curveNatural);

  const colorScale = {
    curpol: Colors.ColorVisOrange,
    ndcs: Colors.ColorVisPurple,
    netzero50: Colors.ColorVisGreen
  };
</script>

<div class="layout-main" bind:clientWidth={w}>
  <span style:background-color={colorScale['curpol']} style:color="white" style:padding="3px">Current policies</span>
  <span style:background-color={colorScale['ndcs']} style:color="white" style:padding="3px">Nationally Determined Contributions (NDCs)</span
  >
  <span style:background-color={colorScale['netzero50']} style:color="white" style:padding="3px">Net Zero 2050</span><br /><br />
  <CountryPicker bind:selectedCountry={selected} />
  <svg width={w} height={h}>
    <g transform={`translate(${margins.left},${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={yScale}
        ticks={yTicks}
      />
      {#each countryData as scenario}
        <path d={lineGenerator(scenario.values)} fill={'none'} stroke-width={4} stroke={'#ffffff'} />
        <path d={lineGenerator(scenario.values)} fill={'none'} stroke-width={2} stroke={colorScale[scenario.key]} />
        <circle
          cx={xScale(scenario.values[0].year)}
          cy={yScale(scenario.values[0].value)}
          r={5}
          fill={colorScale[scenario.key]}
          stroke={'white'}
          stroke-width={1}
        />
        <circle
          cx={xScale(scenario.values[6].year)}
          cy={yScale(scenario.values[6].value)}
          r={5}
          fill={colorScale[scenario.key]}
          stroke={'white'}
          stroke-width={1}
        />
      {/each}
    </g>
  </svg>
</div>
