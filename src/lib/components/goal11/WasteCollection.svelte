<script>
  import { _ } from 'svelte-i18n';
  import { scaleLinear, scalePoint } from 'd3';
  import { getIncomeLevel } from '../../../data/countryRegionIncomeDictionary';
  import * as colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from '../ChartGrid.svelte';
  import Number from '../general/Number.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { fade } from 'svelte/transition';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let xaxistitle;
  export let xaxisunits;
  export let average;

  $: countryData = data.filter((d) => !['HIC', 'LIC', 'UMC', 'LMC'].includes(d.iso3c));
  $: incomeData = data.filter((d) => ['HIC', 'LIC', 'UMC', 'LMC'].includes(d.iso3c));
  $: refData = $referenceCountry ? data.find((d) => d.iso3c == $referenceCountry) : null;

  let margins = {
    top: 20,
    right: 38,
    bottom: 36,
    left: 140
  };
  let w;
  let h = 450;

  let colorScale = {
    LIC: colors.ColorVisIncomeLow,
    LMC: colors.ColorVisIncomeLowerMiddle,
    UMC: colors.ColorVisIncomeUpperMiddle,
    HIC: colors.ColorVisIncomeHigh
  };

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [0, 25, 50, 75, 100];

  $: yScale = scalePoint()
    .domain(['HIC', 'UMC', 'LMC', 'LIC'])
    .range([0, h - margins.top - margins.bottom])
    .padding(0.5);
  const yTicks = ['HIC', 'UMC', 'LMC', 'LIC'];
  const yLabelTranslations = {
    UMC: $_('income.UMC'),
    HIC: $_('income.HIC'),
    LIC: $_('income.LIC'),
    LMC: $_('income.LMC')
  };
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h}>
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.right}
        scale={yScale}
        ticks={yTicks}
        {yLabelTranslations}
      />
    </g>
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
        xAxisUnits={xaxisunits}
        xAxisTitle={xaxistitle}
      />
      {#each countryData as country}
        <circle
          cx={xScale(country.collection_rate)}
          cy={yScale(getIncomeLevel(country.iso3c))}
          r={6}
          fill={colorScale[getIncomeLevel(country.iso3c)]}
          stroke={'white'}
          stroke-width={1.5}
          opacity={0.75}
        />
      {/each}

      {#if refData}
      <circle
        cx={xScale(refData.collection_rate)}
        cy={yScale(getIncomeLevel(refData.iso3c))}
        r={6}
        class={'emphasisbg'} />
      <circle
        cx={xScale(refData.collection_rate)}
        cy={yScale(getIncomeLevel(refData.iso3c))}
        r={6}
        class={'reference emphasis'} />
    {/if}

      {#each incomeData as income, i}
        <line
          x1={xScale(income.collection_rate)}
          x2={xScale(income.collection_rate)}
          y1={yScale(income.iso3c) - 16}
          y2={yScale(income.iso3c) + 16}
          stroke={colorScale[income.iso3c]}
          stroke-width={4}
        />
        <text x={xScale(income.collection_rate)} y={yScale(income.iso3c) - 20} text-anchor={'middle'}
          ><tspan class="small">{income.iso3c == 'HIC' ? average : ''}</tspan>
          <tspan class="number"><Number value={income.collection_rate} unit="%" /></tspan></text
        >
      {/each}
      {#if refData}
      <text
        x={xScale(refData.collection_rate)}
        y={yScale(getIncomeLevel(refData.iso3c)) + 20}
        class={'reference-label-country middle'}
        fill={Colors.ColorReferenceCountry}
        transition:fade|local
      >
      {$_(`country.${$referenceCountry.toLowerCase()}`)}
    </text>
    <text
      x={xScale(refData.collection_rate)}
      y={yScale(getIncomeLevel(refData.iso3c)) - 20}
      class={'reference-label middle'}
      transition:fade|local
      fill={Colors.ColorReferenceCountry}
      ><Number value={refData.collection_rate} digits={0} unit="%"/></text
    > 
    {/if}
    </g>
  </svg>
</div>
