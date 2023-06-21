<script>
  import { scaleLinear } from 'd3-scale';
  import { line } from 'd3-shape';
  import ChartGrid from '$lib/components/ChartGrid.svelte';
  import * as colors from '$lib/styles/tokens.es6.js';
  import { CountryPicker } from '$lib/components';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import { max, min } from 'd3';
  import { tweened } from 'svelte/motion';
  import * as eases from 'svelte/easing';
  import * as Tokens from '$lib/styles/vis.js';
  import CategoricalLegend from '$lib/components/general/CategoricalLegend.svelte';
  import Number from '$lib/components/general/Number.svelte';

  export let data;
  export let waste;
  export let population;

  $: worldData = data.filter((d) => d.iso3c == 'WLD');

  let margins = {
    top: 20,
    right: 24,
    bottom: 30,
    left: 30
  };
  let w;
  let h = 500;

  $: maxYSelected = selectedData ? Math.ceil(max(selectedData, (d) => d.was) / 100) * 100 : 200;
  $: minYSelected = selectedData ? Math.floor(min(selectedData, (d) => d.pop) / 10) * 10 - 5 : 100;

  const maxY = tweened(200, {
    duration: 1000,
    easing: eases.cubicInOut
  });
  const minY = tweened(200, {
    duration: 1000,
    easing: eases.cubicInOut
  });
  $: if (selectedData) {
    $maxY = maxYSelected;
    $minY = minYSelected;
  }
  $: if (!selectedData) {
    $maxY = 200;
    $minY = 95;
  }

  $: xScale = scaleLinear()
    .domain([2020, 2050])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [2020, 2030, 2040, 2050];

  $: yScale = scaleLinear()
    .domain([$minY, $maxY])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = maxYSelected > 200 ? [100, 200, 300, 400, 500] : [100, 125, 150, 175, 200];

  $: popLineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.pop));
  $: wasteLineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.was));

  $: wasteAngle = (Math.atan((yScale(170) - yScale(100)) / (w - margins.left - margins.right)) * 180) / Math.PI;
  $: popAngle = (Math.atan((yScale(120) - yScale(100)) / (w - margins.left - margins.right)) * 180) / Math.PI;

  let countriesToRemove = countriesISO.filter((d) => !data.map((d) => d.iso3c).includes(d));
  let remove = (iso) => countriesToRemove.includes(iso);
  let selectedCountry;

  $: selectedData = selectedCountry ? data.filter((d) => d.iso3c == selectedCountry) : null;
</script>

<CountryPicker bind:selectedCountry {remove} clear={() => (selectedCountry = null)} />
<div bind:clientWidth={w}>
  <svg width={w} height={h} class="linechart">
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.right}
        scale={yScale}
        ticks={yTicks}
      />
    </g>
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />
      {#if !selectedData}
        <path class="projection" d={popLineGenerator(worldData)} stroke={colors.ColorBaseBlue500} />
        <path class="projection" d={wasteLineGenerator(worldData)} stroke={colors.ColorBaseOrange500} />
        {#each worldData as year}
          <circle cx={xScale(year.year)} cy={yScale(year.pop)} r={Tokens.LineChartCircleRadius} fill={colors.ColorBaseBlue500} />
          {#if year.year != 2020}
            <text x={xScale(year.year)} y={yScale(year.pop) - 10} text-anchor={'middle'} style:fill={colors.ColorBaseBlue500} class="number"
              ><Number value={year.pop} /></text
            >
          {/if}
          <circle cx={xScale(year.year)} cy={yScale(year.was)} r={Tokens.LineChartCircleRadius} fill={colors.ColorBaseOrange500} />
          {#if year.year != 2020}
            <text
              x={xScale(year.year)}
              y={yScale(year.was) - 10}
              text-anchor={'middle'}
              style:fill={colors.ColorBaseOrange500}
              class="number"><Number value={year.was} /></text
            >
          {/if}
        {/each}

        <text
          transform={`translate(${xScale(2035)},${yScale(107)}) rotate(${popAngle})`}
          text-anchor={'middle'}
          style:fill={colors.ColorBaseBlue500}>{population}</text
        >
        <text
          transform={`translate(${xScale(2040)},${yScale(142)}) rotate(${wasteAngle})`}
          text-anchor={'middle'}
          style:fill={colors.ColorBaseOrange500}>{waste}</text
        >
      {/if}

      {#if selectedData}
        <path class="projection" d={popLineGenerator(selectedData)} fill="none" stroke-width={2} stroke={colors.ColorBaseBlue500} />
        <path class="projection" d={wasteLineGenerator(selectedData)} fill="none" stroke-width={2} stroke={colors.ColorBaseOrange500} />
        {#each selectedData as year}
          <circle cx={xScale(year.year)} cy={yScale(year.pop)} r={Tokens.LineChartCircleRadius} fill={colors.ColorBaseBlue500} />
          {#if year.year != 2020}
            <text x={xScale(year.year)} y={yScale(year.pop) + 22} text-anchor={'middle'} style:fill={colors.ColorBaseBlue500} class="number"
              ><Number value={year.pop} /></text
            >
          {/if}
          <circle cx={xScale(year.year)} cy={yScale(year.was)} r={Tokens.LineChartCircleRadius} fill={colors.ColorBaseOrange500} />
          {#if year.year != 2020}
            <text
              x={xScale(year.year)}
              y={yScale(year.was) - 10}
              text-anchor={'middle'}
              style:fill={colors.ColorBaseOrange500}
              class="number"><Number value={year.was} /></text
            >
          {/if}
        {/each}
      {/if}
    </g>
  </svg>
  <CategoricalLegend
    legendType={'custom'}
    customItems={[
      { key: waste, colour: colors.ColorBaseOrange500 },
      { key: population, colour: colors.ColorBaseBlue500 }
    ]}
    hidden={!selectedCountry}
  />
</div>
