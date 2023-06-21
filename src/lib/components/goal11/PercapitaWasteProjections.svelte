<script>
  import { scaleLinear } from 'd3-scale';
  import { line } from 'd3-shape';
  import ChartGrid from '$lib/components/ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import CategoricalLegend from '$lib/components/general/CategoricalLegend.svelte';
  import { CountryPicker } from '$lib/components';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import { max } from 'd3';
  import { tweened } from 'svelte/motion';
  import * as Tokens from '$lib/styles/vis.js';
  import * as eases from 'svelte/easing';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';

  export let data;
  export let yaxisunits;
  export let yaxistitle;

  let incomeData = data.filter((d) => ['HIC', 'LIC', 'UMC', 'LMC'].includes(d.iso3c));

  const colorScale = {
    LIC: Colors.ColorVisIncomeLow,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    HIC: Colors.ColorVisIncomeHigh
  };

  let margins = {
    top: 20,
    right: 24,
    bottom: 30,
    left: 40
  };
  let w;
  let h = 500;

  $: xScale = scaleLinear()
    .domain([2020, 2050])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [2020, 2030, 2040, 2050];

  $: maxYSelected =
    selectedData && max(selectedData, (d) => d.percap_waste) > 700 ? Math.ceil(max(selectedData, (d) => d.percap_waste) / 100) * 100 : 700;
  $: maxYReference = refData && max(refData, (d) => d.percap_waste) > 700 ? Math.ceil(max(refData, (d) => d.percap_waste) / 100) * 100 : 700;

  $: maxYValue = Math.max(maxYSelected, maxYReference)

  const maxY = tweened(maxYValue, {
    duration: 1000,
    easing: eases.cubicInOut
  });

  $: if (selectedData || refData) {
    $maxY = maxYValue;
  }
  $: if (!selectedData && !refData) {
    $maxY = 700;
  }

  $: yScale = scaleLinear()
    .domain([0, $maxY])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = maxYValue > 1000 ? [0, 500, 1000, 1500, 2000, 2500] : [0, 200, 400, 600, 800, 1000];

  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.percap_waste));

  let countriesToRemove = countriesISO.filter((d) => !data.map((d) => d.iso3c).includes(d));
  let remove = (iso) => countriesToRemove.includes(iso);
  let selectedCountry;
  $: selectedData = selectedCountry ? data.filter((d) => d.iso3c == selectedCountry) : null;
  $: refData = $referenceCountry ? data.filter((d) => d.iso3c == $referenceCountry) : null;

</script>

<CountryPicker bind:selectedCountry {remove} clear={() => (selectedCountry = null)} />
<CategoricalLegend legendType="income" top="true" />
<div bind:clientWidth={w}>
  <svg width={w} height={h} class="linechart">
    <g transform={`translate(0,${margins.top})`}>
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
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />
      <g class="income-lines" opacity={selectedData ? 0.4 : 1}>
        {#each Object.keys(colorScale) as income}
          <path
            class="projection"
            d={lineGenerator(incomeData.filter((d) => d.iso3c == income))}
            fill="none"
            stroke-width={2}
            stroke={colorScale[income]}
          />
          {#each incomeData.filter((d) => d.iso3c == income) as year}
            <circle cx={xScale(year.year)} cy={yScale(year.percap_waste)} r={Tokens.LineChartCircleRadius} fill={colorScale[income]} />
            <text
              x={xScale(year.year)}
              y={income == 'LIC' ? yScale(year.percap_waste) + 22 : yScale(year.percap_waste) - 10}
              text-anchor={'middle'}
              class="number"
              style:fill={colorScale[income]}>{year.percap_waste}</text
            >
          {/each}
        {/each}
      </g>
      {#if $referenceCountry}
      <g opacity={selectedData ? 0.4 : 1}>
        <path class="projection" d={lineGenerator(refData)} fill="none" stroke-width={2} stroke={Colors.ColorReferenceCountry} />
        {#each refData as year}
          <circle
            cx={xScale(year.year)}
            cy={yScale(year.percap_waste)}
            r={Tokens.LineChartCircleRadius}
            fill={Colors.ColorReferenceCountry}
          />
          <text
            x={xScale(year.year)}
            y={yScale(year.percap_waste) - 10}
            text-anchor={'middle'}
            style:fill={Colors.ColorReferenceCountry}
            class="number">{year.percap_waste}</text
          >
        {/each}
        <text
          x={xScale(2035)}
          y={yScale(refData[1].percap_waste) + (yScale(refData[2].percap_waste) - yScale(refData[1].percap_waste))/2 + 4}
          class={'reference-label-country middle'}
          fill={Colors.ColorReferenceCountry}
          transition:fade|local
        >{$_(`country.${$referenceCountry.toLowerCase()}`)}</text>
      </g>
      {/if}
      {#if selectedData}
      <path class="projection" d={lineGenerator(selectedData)} fill="none" stroke-width={2} stroke={Colors.ColorVisReference} />
      {#each selectedData as year}
        <circle cx={xScale(year.year)} cy={yScale(year.percap_waste)} r={Tokens.LineChartCircleRadius} fill={Colors.ColorVisReference} />
        <text
          x={xScale(year.year)}
          y={yScale(year.percap_waste) - 10}
          text-anchor={'middle'}
          style:fill={Colors.ColorVisReference}
          class="number">{year.percap_waste}</text
        >
      {/each}
      <text
        x={xScale(2035)}
        y={yScale(selectedData[1].percap_waste) + (yScale(selectedData[2].percap_waste) - yScale(selectedData[1].percap_waste))/2 + 4}
        class={'middle'}
        fill={Colors.ColorReferenceCountry}
        transition:fade|local
      >{$_(`country.${selectedCountry.toLowerCase()}`)}</text>
    {/if}
    </g>
  </svg>
</div>
