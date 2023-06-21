<script>
  import { scaleLinear } from 'd3-scale';
  import { line, curveNatural } from 'd3-shape';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { LineChartCircleRadius } from '$lib/styles/vis';

  export let data;
  export let id;
  export let yaxistitle;
  export let yaxisunits;

  const incomes = ['HIC', 'UMC', 'LMC', 'LIC'];

  const colorScale = {
    HIC: Colors.ColorVisIncomeHigh,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    LIC: Colors.ColorVisIncomeLow
  };

  //$: incomeData = data.filter((d) => incomes.includes(d.income));
  $: endYear = id == 'pollution' ? 2017 : 2019;
  $: labelData = data.filter((d) => d.year == endYear);

  let margins = {
    top: 40,
    right: 64,
    bottom: 24,
    left: 24
  };

  let w;
  let h = 450;

  $: xDomain = id == 'pollution' ? [2010, 2017] : [2000, 2019];
  $: xTicks = id == 'pollution' ? [2010, 2017] : [2000, 2005, 2010, 2015, 2019];
  $: yDomain = id == 'pollution' ? [0, 70] : [0, 30];
  $: yTicks = id == 'pollution' ? [0, 20, 40, 60] : [0, 10, 20, 30];

  $: xScale = scaleLinear()
    .domain(xDomain)
    .range([0, w - margins.left - margins.right]);
  $: yScale = scaleLinear()
    .domain(yDomain)
    .range([h - margins.top - margins.bottom, 0]);

  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value))
    .curve(curveNatural);
</script>

<div bind:clientWidth={w} class="vis">
  <CategoricalLegend legendType={'income'} />
  {#if w}
    <svg width={w} height={h} class="linechart">
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if yScale && yTicks && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={yTicks}
            yAxisTitle={yaxistitle}
            yAxisUnits={yaxisunits}
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
            hideLines={true}
          />
        {/if}

        {#each incomes as income}
          <path d={lineGenerator(data.filter((d) => d.income == income))} fill="none" stroke={colorScale[income]} class="bg" />
          <path d={lineGenerator(data.filter((d) => d.income == income))} fill="none" stroke={colorScale[income]} />
        {/each}

        {#if labelData}
          {#each labelData as label}
            <circle cx={xScale(label.year)} cy={yScale(label.value)} r={LineChartCircleRadius} fill={colorScale[label.income]} />
            <text class="number" x={xScale(label.year) + 6} y={yScale(label.value) + 4} style:fill={colorScale[label.income]}
              ><Number value={label.value} digits={1} /></text
            >
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
</div>
