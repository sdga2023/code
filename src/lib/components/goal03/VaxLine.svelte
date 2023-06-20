<script>
  import { scaleLinear, line, area, extent, min, max, curveMonotoneX, scaleLog } from 'd3';
  import { ChartGrid, Number } from '$lib/components';
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import { _ } from 'svelte-i18n';

  export let data;
  export let title;
  export let strokeColor;

  let w, h;
  $: ww = w;
  $: hh = w;

  const margins = {
    top: 50,
    left: 14,
    right: 45,
    bottom: 20
  };

  $: xScale = scaleLinear()
    .domain([min(data, (d) => d.year), 2019, 2020])
    .range([margins.left, ww - margins.right - margins.left - 30, ww - margins.right - margins.left]);
  $: yScale = scaleLinear()
    .domain([0, max(data, (d) => d.value)])
    .range([hh - margins.bottom, margins.top]);

  $: lineGen = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  $: areaGenerator = area()
    .x((d) => xScale(d.year))
    .y0(yScale(0))
    .y1((d) => yScale(d.value))
    .curve(curveMonotoneX);

  $: years = data.map((d) => d.year);

  $: has2020data = years.includes(2020);

  $: xTicks = [1980, 1990, 2000, 2010, 2019, 2021];
  $: yTicks = [];

  let currentYear = data[data.length - 1].year;
  function updateMouse(evt) {
    let mousePos = { x: evt.layerX, y: evt.layerY };
    currentYear = Math.round(xScale.invert(mousePos.x));

    if (!years.includes(currentYear)) {
      const yearsSortedByClosest = years.sort((a, b) => Math.abs(currentYear - a) - Math.abs(currentYear - b));
      currentYear = yearsSortedByClosest[0];
    }
  }
</script>

<div
  class="svg-container"
  bind:clientWidth={w}
  bind:clientHeight={h}
  on:mouseover={updateMouse}
  on:mousemove={updateMouse}
  on:focus={updateMouse}
>
  <p class="title">{title}</p>
  <svg width={ww} height={hh} class="linechart">
    {#if has2020data}
      <rect x={xScale(2019)} y={0} width={xScale(2021) - xScale(2019)} height={hh - 20} class="annotated-area" />
      <text x={xScale(2021)} y={22} class="label end caps">{$_('covid', { default: 'COVID-19' })}</text>
    {/if}
    <ChartGrid
      gridType="yGrid"
      innerHeight={hh - margins.top - margins.bottom}
      innerWidth={ww - margins.left - margins.right}
      scale={yScale}
      ticks={yTicks}
    />
    <path d={areaGenerator(data)} style:fill={strokeColor} class="area" />
    <path d={lineGen(data)} class="bg" />
    <path d={lineGen(data)} style={`stroke: ${strokeColor}`} />

    <!--   {#if has2020data}
      <line
        x1={xScale(2019)}
        x2={xScale(2021)} 
        y1={yScale(data.find((d) => d.year === 2019).value)}
        y2={yScale(data.find((d) => d.year === 2021).value)}
        class="highlight-2020"
        style={`stroke: ${strokeColor}`}
      />
    {/if}-->
    {#each data.filter((d) => d.year === currentYear) as d}
      <rect x={xScale(d.year)} y={yScale(d.value)} width={1} height={hh} style:fill={strokeColor} />
      <circle cx={xScale(d.year)} cy={yScale(d.value)} r={LineChartCircleRadius} style:fill={strokeColor} />
      <text x={xScale(d.year)} y={yScale(d.value) - 10} class="middle number"><Number value={d.value} unit="%" /></text>
    {/each}
    {#each xTicks as xt, i}
      <text class="label weaker small" x={xScale(xt)} y={hh}>{xt}</text>
    {/each}
    <text class="label stronger small" x={xScale(currentYear)} y={hh}>{currentYear}</text>
  </svg>
</div>

<style>
  line.highlight-2020 {
    stroke-width: 6px;
    stroke-linecap: round;
  }

  .label {
    text-anchor: middle;
  }
</style>
