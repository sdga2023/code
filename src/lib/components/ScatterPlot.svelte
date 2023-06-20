<script>
  import { scaleLog } from 'd3-scale';
  import ChartGrid from './ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;

  let margins = {
    top: 20,
    right: 10,
    bottom: 10,
    left: 10
  };

  let w;
  let h = 600;

  $: scatterData = data ? data : [];

  $: xScale = scaleLog()
    .range([0, w - margins.left - margins.right])
    .domain([2.4, 400]);
  const xTicks = [3, 10, 30, 100, 300];

  const yScale = scaleLog()
    .range([h - margins.bottom, margins.top])
    .domain([0.7, 40]);
  const yTicks = [1, 3, 10, 30];

  const colorScale = {
    LIC: Colors.ColorVisIncomeLow,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    HIC: Colors.ColorVisIncomeHigh
  };
</script>

<div class="scatter layout-content" bind:clientWidth={w}>
  <svg width={w} height={h}>
    <rect x={0} y={0} width={w} height={h} class="background-rect" />
    <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
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
      {#each scatterData as country}
        <!--text
          x={xScale(+country.gdp)}
          y={yScale(+country.povertyline)}
          text-anchor={'middle'}
          class={'texthalo'}
          fill={country.incomegroup === 'High income' ? Colors.ColorVisIncomeHigh : 'black'}
          font-size={'0.8em'}>{country.countrycode}
        </text-->
        <circle
          cx={xScale(country.gdp)}
          cy={yScale(country.povertyline)}
          r={7}
          stroke={'white'}
          stroke-width={1}
          fill={colorScale[country.incomegroup]}
        />
      {/each}
      <line x1={0} x2={w - margins.left - margins.right} y1={yScale(24.35)} y2={yScale(24.35)} stroke={'white'} stroke-width={3} />
      <line
        x1={0}
        x2={w - margins.left - margins.right}
        y1={yScale(24.35)}
        y2={yScale(24.35)}
        stroke={Colors.ColorVisIncomeHigh}
        stroke-width={1.5}
      />
      <text x={xScale(20)} y={yScale(24.35) - 5} fill={Colors.ColorVisIncomeHigh} class={'texthalo'}>$24.35/day</text>
    </g>
  </svg>
</div>

<style>
  .scatter {
    height: 600px;
  }
  .background-rect {
    fill: transparent;
  }
  .texthalo {
    text-shadow: -1px -1px white, -1px 1px white, 1px 1px white, 1px -1px white, -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
  }
</style>
