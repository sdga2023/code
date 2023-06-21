<script>
  import { _ } from 'svelte-i18n';
  import { scaleBand, scaleLinear, max } from 'd3';
  import ChartGrid from '../ChartGrid.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { getIncomeLevel, getRegion } from '../../../data/countryRegionIncomeDictionary';
  import { Number, Tooltip } from '$lib/components';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { isMobile } from '$lib/stores/isMobile';
  import * as Tokens from '$lib/styles/vis.js';
  import capitalize from '$lib/components/tools/capitalize.js';

  export let data;
  export let difference_label = 'Difference of';

  let w;
  let h = 450;

  $: r = $isMobile ? Tokens.ScatterCircleRadiusMob : Tokens.ScatterCircleRadius;

  const margins = {
    top: 0,
    right: 10,
    bottom: 10,
    left: 24
  };

  const incomeColorMap = {
    LIC: 'var(--color-vis-income-low)',
    LMC: 'var(--color-vis-income-lower-middle)',
    UMC: 'var(--color-vis-income-upper-middle)',
    HIC: 'var(--color-vis-income-high)'
  };

  const countryAccessor = (d) => d?.iso3;
  const boysAccessor = (d) => d?.Boys;
  const girlAccessor = (d) => d?.Girls;

  $: richData = data.map((d) => ({ ...d, region: getRegion(countryAccessor(d)), income: getIncomeLevel(countryAccessor(d)) }));

  $: countries = Array.from(new Set(richData.map(countryAccessor)));

  $: xScale = scaleBand()
    .domain(countries)
    .range([margins.left, w - margins.right]);
  $: yScale = scaleLinear()
    .domain([0, max(data, (d) => Math.max(boysAccessor(d), girlAccessor(d))) + 10])
    .range([h - margins.bottom - margins.top, margins.top]);

  $: yTicks = yScale.ticks();

  let tooltipVisible = false;
  let tooltipTargetPos = { x: 0, y: 0 };
  let hoveredCountry;
  function showTooltip(e, newCountry) {
    tooltipVisible = true;
    const x = e.clientX;
    const y = e.clientY;
    tooltipTargetPos = { ...tooltipTargetPos, x, y };
    hoveredCountry = newCountry;
  }
  function hideTooltip() {
    tooltipVisible = false;
  }
  $: refCountry = richData.find((c) => $referenceCountry === c.iso3);
</script>

<div class="svg-container" bind:clientWidth={w}>
  <svg width={w} height={h} on:mouseleave={hideTooltip}>
    <defs>
      <linearGradient id="boysToGirls" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="var(--color-vis-gender-male)" />
        <stop offset="100%" stop-color="var(--color-vis-gender-female)" />
      </linearGradient>
      <linearGradient id="girlsToBoys" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="var(--color-vis-gender-female)" />
        <stop offset="100%" stop-color="var(--color-vis-gender-male)" />
      </linearGradient>
    </defs>
    <ChartGrid
      gridType="yGrid"
      innerHeight={h - margins.top - margins.bottom}
      innerWidth={w - margins.right}
      scale={yScale}
      ticks={yTicks}
      yAxisUnits="%"
    />
    {#each richData as d}
      <g
        class:highlight={countryAccessor(hoveredCountry) === countryAccessor(d)}
        class:ref={$referenceCountry === d.iso3}
        transform="translate({Math.floor(xScale(countryAccessor(d))) + 0.5}, 0)"
      >
        {#if girlAccessor(d) > boysAccessor(d)}
          <rect
            x={-0.5}
            width={1}
            y={yScale(girlAccessor(d))}
            height={yScale(boysAccessor(d)) - yScale(girlAccessor(d))}
            style:fill="var(--color-grey-300)"
          />
        {:else}
          <rect
            x={-0.5}
            width={1}
            y={yScale(boysAccessor(d))}
            height={yScale(girlAccessor(d)) - yScale(boysAccessor(d))}
            style:fill="var(--color-grey-300)"
          />
        {/if}
        <circle class="bg" cy={yScale(boysAccessor(d))} r={r + 1.5} style:fill="white" />
        <circle class="bg" cy={yScale(girlAccessor(d))} r={r + 1.5} style:fill="white" />
        <circle cy={yScale(boysAccessor(d))} {r} style:fill="var(--color-vis-gender-male)" />
        <circle cy={yScale(girlAccessor(d))} {r} style:fill="var(--color-vis-gender-female)" />
        <rect
          class="interactive"
          x={-xScale.bandwidth() / 2}
          width={xScale.bandwidth()}
          y={0}
          height={h}
          on:mouseenter={(e) => showTooltip(e, d)}
          on:mousemove={(e) => showTooltip(e, d)}
        />
      </g>
    {/each}
    {#if refCountry}
      <text
        class:middle={xScale(countryAccessor(refCountry)) > 20 && xScale(countryAccessor(refCountry)) < w - 100}
        class:end={xScale(countryAccessor(refCountry)) >= w - 100}
        class="reference-label"
        x={xScale(countryAccessor(refCountry))}
        y={yScale(boysAccessor(refCountry)) - 12}>{refCountry.country}</text
      >
    {/if}
  </svg>
</div>
<CategoricalLegend
  legendType="custom"
  customItems={[
    { key: $_('girls').charAt(0).toUpperCase() + $_('girls').slice(1), colour: 'var(--color-vis-gender-female)' },
    { key: $_('boys').charAt(0).toUpperCase() + $_('boys').slice(1), colour: 'var(--color-vis-gender-male)' }
  ]}
/>
<Tooltip visible={tooltipVisible} targetPos={tooltipTargetPos}>
  {#if hoveredCountry}
    <p class="geo">{$_(`country.${countryAccessor(hoveredCountry).toLowerCase()}`)}</p>
    <hr />
    <p class="label">
      <span class="dot" style:background-color="var(--color-vis-gender-female)" />{capitalize($_('girls'))}:
      <span class="label stronger"> <Number value={girlAccessor(hoveredCountry)} unit="%" digits="1" /></span>
    </p>
    <p class="label">
      <span class="dot" style:background-color="var(--color-vis-gender-male)" />{capitalize($_('boys'))}:
      <span class="label stronger"> <Number value={boysAccessor(hoveredCountry)} unit="%" digits="1" /></span>
    </p>
    <hr />
    <p class="label">
      {difference_label}
      <span
        class="label stronger"
        style:color={girlAccessor(hoveredCountry) > boysAccessor(hoveredCountry)
          ? 'var(--color-vis-binary-pos)'
          : 'var(--color-vis-binary-neg)'}
        ><Number value={girlAccessor(hoveredCountry) - boysAccessor(hoveredCountry)} unit="%" digits="1" /></span
      >
    </p>{/if}
</Tooltip>

<style>
  .interactive {
    opacity: 0;
  }

  g.ref circle.bg,
  g.ref rect {
    stroke: var(--color-reference-country);
  }

  g.highlight circle.bg,
  g.highlight rect {
    stroke: black;
  }

  .dot {
    display: inline-block;
    vertical-align: middle;
    width: 8px;
    height: 8px;
    border-radius: 100%;

    margin-right: var(--space-xs);
  }
</style>
