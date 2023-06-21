<script>
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import ChartGrid from '../ChartGrid.svelte';
  import { scaleLinear, extent, line, area, curveCatmullRom } from 'd3';
  import { _ } from 'svelte-i18n';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let labels;

  const margin = {
    top: 30,
    right: 20,
    bottom: 20,
    left: 0
  };

  let width = parentWidth;
  let height = 400;

  $: w = parentWidth - margin.left - margin.right;
  $: h = parentHeight - margin.top - margin.bottom;

  $: x = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([20, w]);

  $: y = scaleLinear()
    .domain(extent(data, (d) => d.gdp_growth))
    .range([h, 0])
    .nice();

  $: l = line()
    .x((d) => x(d.year))
    .y((d) => y(d.gdp_growth))

    .curve(curveCatmullRom);

  $: a = area()
    .x((d) => x(d.year))
    .y0((d) => y(0))
    .y1((d) => y(d.gdp_growth))
    .curve(curveCatmullRom);
</script>

<div class="linechart">
  <svg {width} {height}>
    <g transform="translate({margin.left}, {margin.top})">
      <ChartGrid
        gridType="yGrid"
        yAxisUnits="%"
        innerWidth={w}
        innerHeight={h}
        scale={y}
        ticks={y.ticks()}
        yAxisTitle={$_(labels.y_axis)}
      />
      <ChartGrid
        gridType="xGrid"
        innerWidth={w / 2}
        hideLines={true}
        innerHeight={h}
        scale={x}
        ticks={x.ticks(5)}
        xAxisTitle={$_(labels.x_axis)}
      />
      <path d={a(data.filter((d) => d.is_projected === false))} style:fill="var(--color-base-red500)" class="area" />
      <path d={l(data.filter((d) => d.is_projected === false))} class="bg" />
      <path d={l(data.filter((d) => d.is_projected === false))} stroke="var(--color-base-red500)" />
      <path d={a(data.filter((d) => d.is_projected === true))} style:fill="var(--color-base-red200)" class="area" />
      <path d={l(data.filter((d) => d.is_projected === true))} class="bg" />
      <path d={l(data.filter((d) => d.is_projected === true))} stroke="var(--color-base-red500)" class="projection" />
      {#each data as d}
        <circle cx={x(d.year)} cy={y(d.gdp_growth)} r={LineChartCircleRadius} fill="var(--color-base-red500)" />
      {/each}
    </g>
  </svg>
</div>
