<script>
  import { stack, stackOrderNone, stackOffsetNone, area, curveNatural } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from '../ChartGrid.svelte';
  import Number from '../general/Number.svelte';

  export let data;
  export let fully;
  export let over;
  export let under;
  export let sustainable;
  export let unsustainable;
  export let yaxistitle;

  let margins = {
    top: 40,
    right: 50,
    bottom: 30,
    left: 24
  };
  let w;
  let h = 500;
  const categories = [
    {
      key: 'over',
      label: over,
      colour: Colors.ColorBaseRed600
    },
    {
      key: 'fully',
      label: fully,
      colour: Colors.ColorBaseTeal400
    },
    {
      key: 'under',
      label: under,
      colour: Colors.ColorBaseBlue300
    }
  ];

  let stackedData = null;

  $: stackedData = stack()
    .keys(categories.map((d) => d.key))
    .order(stackOrderNone)
    .offset(stackOffsetNone)(data);

  $: xScale = scaleLinear()
    .domain([1974, 2019])
    .range([0, w - margins.right]);
  $: xTicks = w > 500 ? [1975, 1985, 1995, 2005, 2015, 2019] : [1975, 1985, 1995, 2005, 2019];
  $: yScale = scaleLinear()
    .domain([0, 100])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 25, 50, 75, 100];
  $: areaGenerator = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveNatural);

  $: dataLabels = [
    { value: 57.1, x: xScale(2019), y: yScale(63) },
    { value: 35.6, x: xScale(2019), y: yScale(16) },
    { value: 7.2, x: xScale(2019), y: yScale(95) }
  ];
</script>

<div bind:clientWidth={w} class="stacked-area">
  <svg width={w} height={h}>
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={yScale}
        ticks={yTicks}
        yAxisTitle={yaxistitle}
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
        {#each stackedData as series, i}
          <path d={areaGenerator(series)} fill={categories[i].colour} />
        {/each}
      {/if}
      <text class="category white" x={xScale(2000)} y={yScale(6)} text-anchor={'middle'}>{over}</text>
      <text class={'caps stronger white'} x={xScale(2000)} y={yScale(13)} text-anchor={'middle'}>{unsustainable}</text>
      <text class="category white" x={xScale(2000)} y={yScale(50)} text-anchor={'middle'}>{fully}</text>
      <text class="category white" x={xScale(1985)} y={yScale(85)} text-anchor={'middle'}>{under}</text>
      <text class={'caps stronger white'} x={xScale(1995)} y={yScale(70)} text-anchor={'middle'}>{sustainable}</text>

      {#each dataLabels as label}
        <text class={'number end white'} x={label.x - 3} y={label.y}><Number value={label.value} digits={1} unit={'%'} /></text>
      {/each}
    </g>
  </svg>
</div>
