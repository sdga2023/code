<script>
  import ChartGrid from '../ChartGrid.svelte';
  import { min, max, scaleLinear, scaleBand, groups, extent, stack, range, area } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let labels;

  const margin = {
    top: 20,
    right: 20,
    bottom: 60,
    left: 20
  };

  $: width = parentWidth;
  let height = 400;

  $: w = parentWidth - margin.left - margin.right;
  $: h = parentHeight - margin.top - margin.bottom;

  $: x = scaleBand()
    .domain(Array.from(new Set(data.map((d) => d.year))))
    .range([0, w])
    .padding(0.5);
  $: y = scaleLinear()
    .domain([0, max(data, (d) => d.fragile_lic + d.other_lic)])
    .range([h, 0]);
</script>

<svg {width} {height}>
  <g transform="translate({margin.left}, {margin.top})">
    <ChartGrid gridType="yGrid" innerWidth={w} innerHeight={h} scale={y} ticks={y.ticks()} yAxisTitle={$_(labels.legend_title)} />
    <!-- <ChartGrid gridType="xGrid" innerWidth={w / 2} hideLines={true} innerHeight={h} scale={x} ticks={x.ticks(5)} xAxisTitle="TODO" /> -->
    {#each data as d}
      <rect x={x(d.year)} width={x.bandwidth()} y={y(d.fragile_lic)} height={h - y(d.fragile_lic)} fill="var(--color-base-red500)" />
      <text
        class="label middle central white stronger small"
        x={x(d.year) + x.bandwidth() / 2}
        y={y(d.fragile_lic) + (h - y(d.fragile_lic)) / 2}
      >
        {d.fragile_lic}
      </text>

      <rect
        x={x(d.year)}
        width={x.bandwidth()}
        y={y(d.fragile_lic) - (h - y(d.other_lic))}
        height={h - y(d.other_lic)}
        fill="var(--color-vis-filtered-out)"
      />
      <text
        class="label middle central stronger small"
        x={x(d.year) + x.bandwidth() / 2}
        y={y(d.fragile_lic) - (h - y(d.other_lic)) + (h - y(d.other_lic)) / 2}
      >
        {d.other_lic}
      </text>
      <text x={x(d.year) + x.bandwidth() / 2} y={h} dy={20} class="label small middle">{d.year}</text>
    {/each}
  </g>
</svg>

<CategoricalLegend
  legendType="custom"
  title={labels.legend_title}
  customItems={[
    { key: $_(labels.legend_fcs), colour: Colors.ColorBaseRed500 },
    { key: $_(labels.legend_other), colour: Colors.ColorVisFilteredOut }
  ]}
/>
