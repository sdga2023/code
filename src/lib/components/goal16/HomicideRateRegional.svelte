<script>
  import ChartGrid from '../ChartGrid.svelte';
  import { scaleLinear, scalePoint } from 'd3-scale';
  import { max } from 'd3-array';

  export let data;
  export let parentWidth;
  export let parentHeight;

  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  let width;
  let height;

  $: allRegions = data.filter((d) => d.Region !== 'World');
  $: world = data.filter((d) => d.Region === 'World')[0];

  $: w = parentWidth - margin.left - margin.right;
  $: h = parentHeight - margin.top - margin.bottom;

  $: y = scaleLinear()
    .domain([0, max(allRegions, (d) => d.VALUE)])
    .range([h, 0]);

  $: x = scalePoint()
    .domain(Array.from(new Set(allRegions.map((d) => d.region_iso3c))))
    .range([0, w])
    .padding(0.5);
</script>

<div bind:clientWidth={width} bind:clientHeight={height}>
  <svg {width} height={600}>
    <g transform="translate({margin.left}, {margin.top})">
      <ChartGrid gridType="xGrid" innerWidth={w} innerHeight={h} scale={x} ticks={x.domain()} xAxisTitle="regions" />
      <ChartGrid gridType="yGrid" innerWidth={w} innerHeight={h} scale={y} ticks={y.ticks()} yAxisTitle="homicide rate per 100.000" />

      <text class="label middle" y={y(world.VALUE)} x={w / 2} dy={-5} dx={100}>World</text>
      <line x1={x.range()[0] + 20} x2={x.range()[1]} y1={y(world.VALUE)} y2={y(world.VALUE)} stroke="black" stroke-dasharray="2 2" />

      {#each allRegions.sort((a, b) => a.VALUE - b.VALUE) as d, i}
        <circle
          r={10}
          cx={x(d.region_iso3c)}
          cy={y(d.VALUE)}
          fill="var(--color-vis-region-{d.region_iso3c})"
          stroke="white"
          stroke-width={0.2}
        />
      {/each}
    </g>
  </svg>
</div>
