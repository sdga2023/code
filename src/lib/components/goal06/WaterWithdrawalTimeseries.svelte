<script>
  import ChartGrid from '../ChartGrid.svelte';
  import { scaleLog, extent, groups, line, scaleQuantize, max, min, range } from 'd3';
  import CountryPath from './CountryPath.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { format } from 'd3-format';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let parentWidth;
  export let parentHeight;
  export let data;
  export let labels;
  export let activeScene;

  $: width = parentWidth;
  $: height = parentHeight;

  const data2 = data.filter((d) => d.year >= 1975 && d.population !== null && d.water_withdrawals_in_billions_m3 !== null);

  const margins = {
    top: 32,
    right: 10,
    bottom: 40,
    left: 10
  };

  $: w = width - margins.left - margins.right;
  $: h = height - margins.top - margins.bottom;

  let mousePosition = { x: 0, y: 0 };

  $: x = scaleLog()
    .domain(extent(data2, (d) => d.population))
    .range([0, w]);

  $: y = scaleLog()
    .domain(extent(data2, (d) => d.water_withdrawals_in_billions_m3))
    .range([h, 0]);

  $: l = line()
    .x((d) => x(d.population))
    .y((d) => y(d.water_withdrawals_in_billions_m3));

  const p = scaleQuantize().domain([0, 1]).range(range(1975, 2021));

  $: year = p(activeScene.progress);

  let hover;
</script>

<p class="label title centered" style:font-size="var(--font-size-xl)">{year}</p>
<div class="svg-container scatterplot" bind:clientHeight={height} bind:clientWidth={width}>
  <svg {width} {height} on:mousemove={(e) => (mousePosition = { x: e.clientX, y: e.clientY })}>
    <g transform="translate({margins.left}, {margins.top})">
      <ChartGrid
        gridType="xGrid"
        innerWidth={w}
        innerHeight={h}
        scale={x.nice()}
        ticks={x.ticks(5)}
        xAxisTitle={$_(labels['total_population'])}
        formatter={(d) => format('.0s')(d).replace(/G/, 'B')}
      />
      <ChartGrid
        gridType="yGrid"
        innerWidth={w}
        innerHeight={h}
        scale={y.nice()}
        ticks={y.ticks(5)}
        yAxisTitle={$_(labels['water_withdrawals'])}
      />

      {#each groups(data2, (d) => d.iso3c) as country}
        <CountryPath {activeScene} pathString={l(country[1])} data={country} {year} {x} {y} bind:hover />
      {/each}

      {#if $referenceCountry && data.filter((d) => d.iso3c === $referenceCountry && d.year === year).length > 0}
        {@const referenceData = data.filter((d) => d.iso3c === $referenceCountry && d.year === year)}

        <text
          x={x(max(referenceData, (d) => d.population))}
          y={y(
            (max(referenceData, (d) => d.water_withdrawals_in_billions_m3) +
              min(referenceData, (d) => d.water_withdrawals_in_billions_m3)) /
              2
          )}
          dx={10}
          class="reference-label"
        >
          {$_(`country.${$referenceCountry.toLowerCase()}`)}
        </text>
      {/if}
    </g>
  </svg>
</div>

<CategoricalLegend legendType="regions" />

{#if hover !== undefined && hover.year}
  <Tooltip targetPos={mousePosition} visible={true}>
    <div class="label caps">{$_(`country.${hover.iso3c.toLowerCase()}`)}, {hover.year}</div>
    <hr />
    <div class="label stronger"><Number value={hover.water_withdrawals_in_billions_m3} /></div>
    <div class="label small weaker">{@html labels['billions_m3_html']}</div>
  </Tooltip>
{/if}

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
