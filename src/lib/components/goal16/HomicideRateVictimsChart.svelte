<script>
  import { area, curveCatmullRom, line } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import { extent, max } from 'd3-array';
  import ChartGrid from '../ChartGrid.svelte';
  import { _ } from 'svelte-i18n';

  export let data;
  export let width = 0;
  export let height;
  export let region;
  export let maxTotal;
  export let labels;

  const margin = {
    top: 30,
    right: 0,
    bottom: 20,
    left: 0
  };

  $: w = width - margin.left - margin.right;
  $: h = height - margin.top - margin.bottom;

  $: x = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([50, w])
    .nice();

  $: y = scaleLinear().domain([0, maxTotal]).range([h, 0]).nice();

  const a = area()
    .x((d) => x(d.year))
    .y0((d) => y(0))
    .y1((d) => y(d.total));

  const l = line()
    .x((d) => x(d.year))
    .y((d) => y(d.total))
    .curve(curveCatmullRom);
</script>

<div class="linechart" bind:clientWidth={width}>
  <p class="label title">{$_(`region.${region}`)}</p>
  <svg {height} {width}>
    <g transform="translate({margin.left}, {margin.top})">
      <ChartGrid gridType="xGrid" innerHeight={h} innerWidth={w} scale={x} ticks={x.ticks(5)} />
      <ChartGrid gridType="yGrid" innerHeight={h} innerWidth={w} scale={y} ticks={y.ticks(5)} yAxisTitle={$_(labels.y_axis_label)} />
      <path d={a(data)} style:fill="var(--color-vis-region-{region})" class="area" />
      <path d={l(data)} class="bg" />
      <path d={l(data)} stroke="var(--color-vis-region-{region})" />
    </g>
  </svg>
</div>
