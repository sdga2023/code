<script>
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from './../ChartGrid.svelte';
  import Number from '../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import { LineChartCircleRadius } from '$lib/styles/vis';

  export let data;
  export let optimisticscenario;
  export let pessimisticscenario;

  let margins = {
    top: 30,
    right: 44,
    bottom: 16,
    left: 44
  };

  let w = 320;
  $: h = 600;

  $: xScale = scaleLinear()
    .domain([2019, 2022])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [2019, 2022];
  $: yScale = scaleLinear()
    .domain([0, 100])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [100];

  let colourScale = {
    HIC: Colors.ColorVisIncomeHigh,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    LIC: Colors.ColorVisIncomeLow
  };

  let directLabels = [
    { key: 'HIC', y: 5 },
    { key: 'UMC', y: 27 },
    { key: 'LMC', y: 58 },
    { key: 'LIC', y: 87 }
  ];

  $: polygonData = Object.keys(colourScale).map((inc) => {
    let obj = {};
    obj.income = inc;
    let point1 = xScale(2019) + ',' + (yScale(data.find((d) => d.year == 2019 && d.income == inc).intermediate) + 2);
    let point2 = xScale(2019) + ',' + (yScale(data.find((d) => d.year == 2019 && d.income == inc).intermediate) - 2);
    let point3 = xScale(2022) + ',' + (yScale(data.find((d) => d.year == 2022 && d.income == inc).pessimistic) - 3);
    let point4 = xScale(2022) + ',' + (yScale(data.find((d) => d.year == 2022 && d.income == inc).optimistic) + 3);
    obj.points = point1 + ' ' + point2 + ' ' + point3 + ' ' + point4;
    return obj;
  });
</script>

<svg width={w} height={h} class="slopechart">
  <g transform={`translate(${margins.left - 16}, ${margins.top})`}>
    <ChartGrid
      gridType="yGrid"
      innerHeight={h - margins.top - margins.bottom}
      innerWidth={w - margins.left - margins.right + 16}
      scale={yScale}
      ticks={yTicks}
      yAxisUnits={'%'}
      yAxisTitle={'Learning poverty'}
      hideLines={true}
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
    {#each polygonData as poly}
      <polygon points={poly.points} fill={colourScale[poly.income]} opacity={0.5} />
    {/each}
    {#each data as point}
      {#if point.year == 2019}
        <circle
          cx={xScale(point.year)}
          cy={yScale(point.intermediate)}
          r={4}
          fill={colourScale[point.income]}
          stroke={'white'}
          stroke-width={1}
        />
        <text
          class={'axis-label'}
          x={xScale(2019) - 6}
          y={yScale(point.intermediate) + 4}
          text-anchor={'end'}
          fill={colourScale[point.income]}><Number value={point.intermediate} digits={1} unit={'%'} /></text
        >
      {/if}
      <circle cx={xScale(point.year)} cy={yScale(point.optimistic)} r={LineChartCircleRadius} fill={colourScale[point.income]} />
      <circle cx={xScale(point.year)} cy={yScale(point.pessimistic)} r={LineChartCircleRadius} fill={colourScale[point.income]} />
      {#if point.year == 2022}
        <text
          class={'axis-label start'}
          x={xScale(2022) + 6}
          y={point.income != 'LIC' ? yScale(point.optimistic) + 4 : yScale(point.optimistic) + 8}
          fill={colourScale[point.income]}><Number value={point.optimistic} digits={1} unit="%" /></text
        >
        <text
          class={'axis-label start'}
          x={xScale(2022) + 6}
          y={point.income != 'LIC' ? yScale(point.pessimistic) + 4 : yScale(point.optimistic) - 4}
          fill={colourScale[point.income]}><Number value={point.pessimistic} digits={1} unit="%" /></text
        >
      {/if}
    {/each}
    <text
      class="small weaker"
      x={xScale(2022) - 10}
      y={yScale(78.3) - 2}
      text-anchor={'end'}
      transform={`rotate(-20 ${xScale(2022) - 10} ${yScale(78.3) - 2})`}>{pessimisticscenario}</text
    >
    <text
      class="small weaker"
      x={xScale(2022) - 8}
      y={yScale(71) + 3}
      text-anchor={'end'}
      transform={`rotate(-16 ${xScale(2022) - 10} ${yScale(71)})`}>{optimisticscenario}</text
    >
    {#each directLabels as label}
      <text x={xScale(2020.5)} y={yScale(label.y)} style:fill={colourScale[label.key]} class="category middle">
        {$_(`income.${label.key}`)}
      </text>
    {/each}
  </g>
</svg>

<style>
  svg {
    margin: auto;
  }
</style>
