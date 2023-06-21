<script>
  import ChartGrid from '../ChartGrid.svelte';
  import { min, max, scaleLinear, scaleBand, groups, stack, range } from 'd3';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import { _ } from 'svelte-i18n';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let labels;

  $: filtered = data.filter((d) => d.Sex !== 'Total' && d.unit === 'Counts');

  $: stacked = stack().keys(['male', 'female'])(
    groups(filtered, (d) => d.Year).map((k) => ({
      year: k[0],
      male: k[1][0].VALUE,
      female: k[1][1].VALUE
    }))
  );

  const margin = {
    top: 30,
    right: 0,
    bottom: 0,
    left: 0
  };

  const legendHeight = 60;

  let width = parentWidth;
  let height = 500;

  $: w = parentWidth - margin.left - margin.right;
  $: h = parentHeight - margin.top - margin.bottom - legendHeight;

  $: allYears = Array.from(new Set(data.map((d) => d.Year)));

  $: x = scaleBand()
    .domain(allYears)
    .range([0, w])
    .paddingInner(1)
    .paddingOuter($isMobile ? 1.3 : 0.8)
    .align($isMobile ? 0.8 : 0.6);

  $: y = scaleLinear()
    .domain([0, max(stacked, (d) => max(d, (d) => d[1]))])
    .range([h, 0])
    .nice();
</script>

<div bind:clientWidth={width}>
  <svg {width} {height}>
    <g transform="translate({margin.left}, {margin.top})">
      <ChartGrid gridType="yGrid" innerWidth={w} innerHeight={h} scale={y} ticks={y.ticks()} yAxisTitle={$_(labels.y_axis_label)} />
      {#each stacked as s, i}
        {#each s as b}
          {@const barWidth = (x.range()[1] - x.range()[0]) / (allYears.length + 2)}
          <rect
            x={x(b.data.year) - barWidth / 2}
            y={y(b[1])}
            width={barWidth}
            height={y(b[0]) - y(b[1])}
            fill="var(--color-vis-gender-{i === 0 ? 'male' : 'female'})"
          />
        {/each}
      {/each}
      {#each range( min(data, (d) => d.Year), max(data, (d) => d.Year) + 1 ) as year}
        <text class="label middle small" x={x(year)} y={h} dy={20}>{$isMobile ? `'${year - 2000}` : year}</text>
      {/each}
    </g>
  </svg>
  <CategoricalLegend legendType="gender" title={labels.legend_title} />
</div>
