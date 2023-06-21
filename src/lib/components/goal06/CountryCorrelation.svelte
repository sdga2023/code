<script>
  import ChartGrid from '../ChartGrid.svelte';
  import { scaleLinear, extent, interval } from 'd3';
  import CountryCorrelationCountry from './CountryCorrelationCountry.svelte';
  import { writable } from 'svelte/store';

  export let data = [];
  export let labels = {};

  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  let width = 0;
  const height = 800;

  $: w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  const variables = ['total_population', 'gdp_ppp', 'agricultural_land'];
  let vi = 0;

  $: x = scaleLinear()
    .domain(extent(data || [], (d) => d[variables[vi]]))
    .range([0, w - margin.left - margin.right]);

  $: y = scaleLinear()
    .domain(extent(data || [], (d) => d.total_freshwater_withdrawal))
    .range([h - margin.bottom, margin.top]);

  const data2 = writable(data);

  interval(() => {
    vi = (vi + 1) % variables.length;

    $data2 = data.map((d) => ({
      ...d,
      x: x(d[variables[vi]]),
      y: y(d.total_freshwater_withdrawal)
    }));
  }, 3000);
</script>

{#if data && data.length > 0}
  <div class="chart" bind:clientWidth={width}>
    <svg {width} {height}>
      <g transform="translate({margin.left}, {margin.top})">
        <text style="anchor: middle;" x={w / 2}>{labels[variables[vi]]}</text>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margin.top - margin.bottom}
          innerWidth={w - margin.left - margin.right}
          scale={x}
          ticks={x.ticks()}
          xAxisTitle={variables[vi]}
        />
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margin.top - margin.bottom}
          innerWidth={w - margin.left - margin.right}
          scale={y}
          ticks={y.ticks()}
          yAxisTitle="Total freshwater withdrawal (million cubic meters)"
        />
        {#each $data2 as country, i}
          <CountryCorrelationCountry {country} x={x(country[variables[vi]])} y={y(country[variables[vi]])} />
        {/each}
      </g>
    </svg>
  </div>
{/if}
