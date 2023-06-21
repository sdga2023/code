<script>
  import ChartGrid from '../ChartGrid.svelte';
  import { min, max, scaleLinear, scaleBand, groups, extent, stack, range, area } from 'd3';
  import { _ } from 'svelte-i18n';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let labels;

  const margin = {
    top: 14,
    right: 20,
    bottom: 20,
    left: 20
  };

  let width = parentWidth;
  let height = 350;

  $: cellwidth = parentWidth / 2;

  $: w = cellwidth - margin.left - margin.right;
  $: h = height - margin.top - margin.bottom;

  $: x = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([20, w]);

  $: y = scaleLinear().domain([0, 100]).range([h, 0]);

  $: a1 = area()
    .x((d) => x(d.year))
    .y1((d) => y(d.fcs_pct))
    .y0((d) => y(0));

  $: a2 = area()
    .x((d) => x(d.year))
    .y1((d) => y((100 * d.fcs_population) / (d.fcs_population + d.others_population)))
    .y0((d) => y(0));
</script>

<div class="container">
  <div class="cell">
    <h4 class="title">{$_(labels.share_of_poor)}</h4>
    <div bind:clientWidth={cellwidth}>
      <svg width={cellwidth} {height}>
        <g transform="translate({margin.left}, {margin.top})">
          <rect fill="var(--color-grey-100)" x={x.range()[0]} width={w - margin.right} height={h} />
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
            innerWidth={w}
            hideLines={true}
            innerHeight={h}
            scale={x}
            ticks={x.ticks($isMobile ? 3 : 5)}
            xAxisTitle={$_(labels.x_axis)}
          />
          <path d={a1(data)} fill="var(--color-base-red500)" />
          <line x1={x.range()[0]} y1={y(50)} x2={x.range()[1]} y2={y(50)} stroke="black" stroke-width={2} stroke-dasharray="3 3" />
          <text x={x(2015)} y={y(65)} class="label middle small" fill="var(--color-base-grey600)">{$_(labels.poor)}</text>
          <text x={x(2015)} y={y(15)} class="label middle small stronger white" fill="var(--color-base-red500)">{$_(labels.fcs)}</text>
        </g>
      </svg>
    </div>
  </div>
  <div class="cell">
    <h4 class="title">{$_(labels.share_of_global)}</h4>
    <div bind:clientWidth={cellwidth}>
      <svg width={cellwidth} {height}>
        <g transform="translate({margin.left}, {margin.top})">
          <rect x={margin.left} fill="var(--color-grey-100)" width={w - margin.right} height={h} />
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
            ticks={x.ticks($isMobile ? 3 : 5)}
            xAxisTitle={$_(labels.x_axis)}
          />
          <path d={a2(data)} fill="var(--color-base-red500)" />
          <text x={x(2015)} y={y(55)} class="label middle small" fill="var(--color-base-grey600)">{$_(labels.poor)}</text>
          <text x={x(2015)} y={y(5)} class="label middle small stronger white" fill="var(--color-base-red500)">{$_(labels.fcs)}</text>
        </g>
      </svg>
    </div>
  </div>
</div>

<style>
  h4 {
    text-align: center;
  }
  .container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    row-gap: var(--space-xl);
    column-gap: var(--grid-gutter);
    justify-content: center;
    flex-wrap: wrap;
    padding-top: var(--space-s-m);
    overflow: hidden;
  }
  .cell {
    width: var(--col-6);
  }
</style>
