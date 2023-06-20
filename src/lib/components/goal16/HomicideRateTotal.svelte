<script>
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import ChartGrid from '../ChartGrid.svelte';
  import { scaleLinear, scalePoint, line, extent, groups, local, curveCatmullRom } from 'd3';
  import { max } from 'd3-array';
  import { fade } from 'svelte/transition';
  import HomicideRateCountry from './HomicideRateCountry.svelte';
  import CountryPicker from '../general/CountryPicker.svelte';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import { isMobile } from '$lib/stores/isMobile';
  import { ScatterCircleRadius, ScatterCircleRadiusMob } from '$lib/styles/vis';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let activeScene;
  export let labels;

  const margin = {
    top: 30,
    right: 20,
    bottom: 60,
    left: 20
  };

  $: width = parentWidth;
  $: height = parentHeight;

  $: regions = groups(data, (d) => d.region_iso3c)
    .filter((d) => d[0] !== 'WLD')
    .sort((b, a) => max(b[1], (d) => d.rate) - max(a[1], (d) => d.rate))
    .map((d) => d[0]);

  let countriesToRemove = countriesISO.filter((d) => !data.map((d) => d.iso3c).includes(d));
  let remove = (iso) => countriesToRemove.includes(iso);

  $: w = width - margin.left - margin.right;
  $: h = height - margin.top - margin.bottom;

  $: y = scaleLinear()
    .domain([0, max(data, (d) => d.rate)])
    .range([h, 0])
    .nice();

  $: x = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([40, w]);

  $: x2 = scalePoint()
    .domain(regions.filter((d) => d !== 'WLD'))
    .range([40, w]);

  $: l = line()
    .x((d) => x(d.year))
    .y((d) => y(d.rate))
    .curve(curveCatmullRom);

  let selectedCountry = null;

  let hover;

  let mousePosition = { x: 0, y: 0 };
  function updateMouse(evt) {
    mousePosition = { x: evt.clientX, y: evt.clientY };
  }
</script>

<div class:hide={activeScene.index < 2}>
  <CountryPicker bind:selectedCountry clear={() => (selectedCountry = null)} {remove} />
</div>
<div class="svg-container linechart scatterplot" bind:clientWidth={width} bind:clientHeight={height}>
  <svg {width} {height} on:mousemove={updateMouse}>
    <g transform="translate(0,{margin.top})">
      <!-- <ChartGrid gridType="xGrid" innerWidth={w} innerHeight={h} scale={x} ticks={x.domain()} xAxisTitle="regions" /> -->
      <ChartGrid gridType="yGrid" innerWidth={w} innerHeight={h} scale={y} ticks={y.ticks()} yAxisTitle={labels.y_axis_label} />

      {#if activeScene.index === 0}
        {@const wld = data.filter((d) => d.iso3c === 'WLD').sort((a, b) => a.year - b.year)}
        {@const wld2015 = wld.find((d) => d.year === 2015)}
        <g transition:fade|local>
          <path d={l(wld)} fill="none" stroke="var(--color-vis-region-WLD)" stroke-width={2} />
          <circle cx={x(wld[wld.length - 1].year)} cy={y(wld[wld.length - 1].rate)} r={5} fill="var(--color-vis-region-WLD)" />
          <text x={x(wld2015.year)} y={y(wld2015.rate)} fill="var(--color-vis-region-WLD)" class="label geo middle" dy={-10}>
            {$_(labels.world)}
          </text>
        </g>
      {:else}
        {@const byRegion = data.filter((d) => d.iso3c !== 'WLD' && regions.includes(d.iso3c))}

        {#if activeScene.index === 1}
          <g transition:fade|local>
            {#each groups(byRegion, (d) => d.iso3c) as d}
              <path d={l(d[1])} class="bg" />
              <path d={l(d[1])} fill="none" stroke="var(--color-vis-region-{d[0]})" stroke-width={2} />
            {/each}
          </g>
        {/if}

        {#if activeScene.index >= 1}
          {@const countries = data.filter((d) => d.iso3c !== d.region_iso3c)}
          {#each countries as c}
            {@const cx = activeScene.index === 1 ? x(c.year) : x2(c.region_iso3c)}
            {@const cy =
              activeScene.index === 1 ? y(byRegion.find((d) => d.region_iso3c === c.region_iso3c && d.year === c.year).rate) : y(c.rate)}
            <HomicideRateCountry
              {cx}
              {cy}
              country={c}
              on:mouseover={() => (hover = c)}
              on:mouseout={() => (hover = undefined)}
              hover={hover !== undefined && hover.iso3c === c.iso3c}
            />
          {/each}
        {/if}

        {#if activeScene.index > 1 && $referenceCountry !== undefined && selectedCountry !== $referenceCountry && data.find((d) => d.iso3c === $referenceCountry) !== undefined}
          {@const rc = data.find((d) => d.iso3c === $referenceCountry)}
          {@const cx = x2(rc.region_iso3c)}
          {@const cy = y(rc.rate)}

          <g transform="translate({cx}, {cy})">
            <circle r={($isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius) + 3} fill="black" stroke-width={2} stroke="white" />
            <circle
              r={$isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius}
              fill="var(--color-reference-country)"
              stroke-width={2}
              stroke="white"
            />
            <!-- <circle
              r={($isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius) + 2}
              fill="none"
              stroke="var(--color-reference-country)"
              stroke-width={25}
            />
            <circle r={($isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius) + 2} fill="none" stroke="white" stroke-width={2} /> -->

            {#if x2(rc.region_iso3c) < w / 2}
              <text class="reference-label start central" dy={-4} dx={14}>
                {$_(`country.${rc.iso3c.toLowerCase()}`)}
              </text>
            {:else}
              <text class="reference-label end central" dy={-1} dx={-14}>
                {$_(`country.${rc.iso3c.toLowerCase()}`)}
              </text>
            {/if}
          </g>
        {/if}

        {#if activeScene.index > 1 && selectedCountry !== null}
          {@const c = data.find((d) => d.iso3c === selectedCountry)}
          {@const cx = x2(c.region_iso3c)}
          {@const cy = y(c.rate)}

          <g transform="translate({cx}, {cy})">
            <circle
              r={($isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius) + 2}
              fill="none"
              stroke="black"
              stroke-width={2}
              style="pointer-events: none;"
            />
            <circle r={$isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius} class="emphasisbg" />
            <circle r={$isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius} class="emphasis" />
            {#if cx < w / 2}
              <text class="label start geo central" dy={-1} dx={14}>
                {$_(`country.${selectedCountry.toLowerCase()}`)}
              </text>
            {:else}
              <text class="label end geo central" dy={-1} dx={-14}>
                {$_(`country.${selectedCountry.toLowerCase()}`)}
              </text>
            {/if}
          </g>
        {/if}
      {/if}

      {#if hover && activeScene.index > 1}
        <g style="pointer-events: none;">
          <circle r={5} cx={x2(hover.region_iso3c)} cy={y(hover.rate)} fill="var(--color-vis-region-{hover.region_iso3c})" />
          <circle cx={x2(hover.region_iso3c)} cy={y(hover.rate)} r={7} class="emphasisbg" />
          <circle cx={x2(hover.region_iso3c)} cy={y(hover.rate)} r={7} class="emphasis" />
        </g>
      {/if}

      {#if activeScene.index <= 1}
        <g transition:fade|local>
          {#each x.ticks($isMobile ? 4 : 9) as tick}
            <text dy={20} class="label small middle" x={x(tick)} y={y.range()[0]}>{tick}</text>
          {/each}
        </g>
      {:else}
        <!-- <g transition:fade|local>
          {#each x2.domain() as tick}
            <text dy={20} class="label small middle" x={x2(tick)} y={y.range()[0]}>{tick}</text>
          {/each}
        </g> -->
      {/if}
    </g>
  </svg>
</div>
<CategoricalLegend
  legendType="custom"
  customItems={regions.map((d) => ({
    key: $_(`region.${d}`),
    colour: Colors[`ColorVisRegion${d}`]
  }))}
  hidden={activeScene.index === 0}
/>
{#if hover && activeScene.index > 1}
  <Tooltip visible={hover !== undefined} targetPos={mousePosition}>
    <div class="label geo">{$_(`country.${hover.iso3c.toLowerCase()}`)}</div>
    <hr />
    <div class="label number">
      <Number value={hover.rate} digits={1} />
    </div>
    <p class="label weaker small">{labels.y_axis_label}</p>
  </Tooltip>
{/if}

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
  .hide {
    opacity: 0;
    pointer-events: none;
  }
</style>
