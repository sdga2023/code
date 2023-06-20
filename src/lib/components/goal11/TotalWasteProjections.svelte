<script>
  import { scaleLinear } from 'd3-scale';
  import { line } from 'd3-shape';
  import ChartGrid from '$lib/components/ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import * as Tokens from '$lib/styles/vis.js';
  import CategoricalLegend from '$lib/components/general/CategoricalLegend.svelte';

  export let data;
  export let yaxisunits;
  export let yaxistitle;

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

  $: yScale = scaleLinear()
    .domain([0, 1300000000000])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = yScale.ticks(5);

  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value));
</script>

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
        yDivisor={1000000000}
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
      {#each Object.keys(colorScale) as income}
        <path
          class="projection"
          d={lineGenerator(data.filter((d) => d.income == income))}
          fill="none"
          stroke-width={2}
          stroke={colorScale[income]}
        />
        {#each data.filter((d) => d.income == income) as year}
          <circle cx={xScale(year.year)} cy={yScale(year.value)} r={Tokens.LineChartCircleRadius} fill={colorScale[income]} />
          <text x={xScale(year.year)} y={yScale(year.value) - 10} text-anchor={'middle'} style:fill={colorScale[income]} class="number"
            >{Math.round(year.value / 1000000000)}</text
          >
        {/each}
      {/each}
    </g>
  </svg>
</div>
