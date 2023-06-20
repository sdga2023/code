<script>
  import { scaleLinear, scalePoint } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from './../ChartGrid.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { extent } from 'd3-array';
  import Number from '../general/Number.svelte';

  export let data;
  export let onlineplatforms;
  export let television;
  export let radio;
  export let mobilephones;
  export let takehomepackages;
  export let otherdistancelearningm;
  export let lowincome;
  export let highincome;

  let platforms = [
    { key: 'onlineplatforms', label: onlineplatforms },
    { key: 'television', label: television },
    { key: 'takehomepackages', label: takehomepackages },
    { key: 'mobilephones', label: mobilephones },
    { key: 'radio', label: radio },
    { key: 'otherdistancelearningm', label: otherdistancelearningm }
  ];

  let ranges = platforms.map((p) => {
    p.extent = extent(
      data.filter((d) => d.platform == p.key),
      (d) => d.value
    );
    return p;
  });

  $: margins = {
    top: 80,
    right: 26,
    bottom: 36,
    left: w < 500 ? 124 : 24 + (705 - w) / 10
  };

  let w;
  let h = 400;

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [0, 50, 100];
  $: yScale = scalePoint()
    .domain(platforms.map((d) => d.key))
    .range([0, h - margins.top - margins.bottom]);

  let colourScale = {
    HIC: Colors.ColorVisIncomeHigh,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    LIC: Colors.ColorVisIncomeLow
  };

  let hoveredIncome;
</script>

<div bind:clientWidth={w}>
  {#if w}
    <CategoricalLegend legendType="income" />
    <svg width={w} height={h} class="rangeplot">
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
          xAxisUnits={'%'}
          xAxisTitle={'Share of countries offering learning platform'}
        />
        {#each ranges as range}
          <!--text
            class={'category middle'}
            x={xScale(range.extent[0]) + xScale(range.extent[1] - range.extent[0]) / 2}
            y={yScale(range.key) - 8}>{platforms.find((d) => d.key == range.key).label}</text
          -->
          <line x1={xScale(range.extent[0])} x2={xScale(range.extent[1])} y1={yScale(range.key)} y2={yScale(range.key)} />
          <text class="end" x={xScale(range.extent[0]) - 10} y={yScale(range.key) + 4}
            ><tspan class="category">{platforms.find((d) => d.key == range.key).label}</tspan>:
            <tspan class="number small"><Number value={range.extent[0]} unit="%" /></tspan></text
          >
          <text class="number small start" x={xScale(range.extent[1]) + 8} y={yScale(range.key) + 4}
            ><Number value={range.extent[1]} unit="%" /></text
          >
        {/each}
        {#each data as point}
          <circle
            cx={xScale(point.value)}
            cy={point.platform == 'radio' && point.income == 'LIC'
              ? yScale(point.platform) - 4
              : point.platform == 'radio' && point.income == 'LMC'
              ? yScale(point.platform) + 4
              : yScale(point.platform)}
            r={8}
            fill={colourScale[point.income]}
            on:mouseover={() => (hoveredIncome = point.income)}
            on:focus={() => (hoveredIncome = point.income)}
            on:mouseleave={() => (hoveredIncome = null)}
            on:blur={() => (hoveredIncome = null)}
            class={point.income == hoveredIncome ? 'highlighted' : ''}
            opacity={hoveredIncome ? (point.income == hoveredIncome ? 1 : 0.5) : 1}
          />
        {/each}
        <line class="connector" x1={xScale(54.5)} x2={xScale(54.5)} y1={-56} y2={yScale('onlineplatforms') - 12} />
        <line class="connector" x1={xScale(96.1)} x2={xScale(96.1)} y1={-26} y2={yScale('onlineplatforms') - 12} />
      </g>

      <text class="small" x={margins.left + xScale(55) - 45} y={20} text-anchor={'middle'}>{lowincome}</text>
      <text class="small" x={w - 10} y={50} text-anchor={'end'}>{highincome}</text>
    </svg>
  {/if}
</div>

<style>
  .rangeplot line.connector {
    stroke: black;
    stroke-width: 1px;
  }
  .rangeplot circle.highlighted {
    stroke: black;
    stroke-width: 2px;
  }
</style>
