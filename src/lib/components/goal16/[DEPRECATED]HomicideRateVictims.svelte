<script>
  import ChartGrid from '../ChartGrid.svelte';
  import { min, max, scaleLinear, area, groups, extent, stack, range } from 'd3';
  import { tweened } from 'svelte/motion';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let activeScene;

  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  let width;
  let height = parentHeight;

  $: w = parentWidth - margin.left - margin.right;
  $: h = parentHeight - margin.top - margin.bottom;

  $: yRate = scaleLinear()
    .domain([0, max(data, (d) => d.rate)])
    .range([h, 0]);

  $: yTotal = scaleLinear()
    .domain([0, max(data, (d) => d.total)])
    .range([h, 0]);

  $: x = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, w]);

  $: byRegion = tweened(
    groups(data, (d) => d.iso3c).map((k) =>
      k[1].map((d) => ({
        x: x(d.year),
        y0: yRate(d.rate),
        y1: yRate(d.rate),
        iso3c: k[0]
      }))
    )
  );

  $: {
    if (activeScene.index === 0) {
      byRegion.set(
        groups(data, (d) => d.iso3c).map((k) =>
          k[1].map((d) => ({
            x: x(d.year),
            y0: yRate(d.rate),
            y1: yRate(d.rate),
            iso3c: k[0]
          }))
        )
      );
    } else if (activeScene.index === 1) {
      const grouped = groups(data, (d) => d.year).map((d) =>
        d[1].reduce((acc, cur) => {
          acc[cur.iso3c] = cur.total;
          acc.year = cur.year;
          return acc;
        }, {})
      );

      const s = stack().keys(Array.from(new Set(data.map((d) => d.iso3c))))(grouped);

      const lastItem = s[s.length - 1];
      const highestValue = lastItem[lastItem.length - 1][1];

      yTotal.domain([0, highestValue]);

      byRegion.set(
        s.map((k) =>
          k.map((d) => ({
            x: x(d.data.year),
            y0: yTotal(d[0]),
            y1: yTotal(d[1]),
            iso3c: k.key
          }))
        )
      );
    }
  }

  const l = area()
    .x((d) => d.x)
    .y0((d) => d.y0)
    .y1((d) => d.y1);
</script>

<div bind:clientWidth={width}>
  <svg {width} {height}>
    <g transform="translate({margin.left}, {margin.top})">
      <ChartGrid gridType="xGrid" hideLines={true} innerWidth={w} innerHeight={h} scale={x} ticks={x.ticks()} xAxisTitle="year" />
      <ChartGrid
        gridType="yGrid"
        innerWidth={w}
        innerHeight={h}
        scale={yRate}
        ticks={yRate.ticks()}
        yAxisTitle="homicide rate per 100.000"
      />

      {#each $byRegion as region}
        <path
          d={l(region)}
          stroke="var(--color-vis-region-{region[0].iso3c})"
          fill="var(--color-vis-region-{region[0].iso3c})"
          stroke-width={2}
        />
      {/each}
    </g>
  </svg>
</div>
