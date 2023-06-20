<script>
  import { _ } from 'svelte-i18n';
  import { scaleLinear, scaleBand } from 'd3';
  import { Number, Tooltip, ChartGrid } from '$lib/components';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import * as Colors from '$lib/styles/tokens.es6';
  import capitalize from '$lib/components/tools/capitalize.js';

  export let data;

  export let label_women_15 = 'Women married by age 15';
  export let label_women_18 = 'Women married by age 18';
  export let label_tooltip_15 = 'of women are married by age 15';
  export let label_tooltip_18 = 'of women are married by 18';

  let w;
  let h = 600;

  const margins = {
    top: 20,
    right: 0,
    bottom: 0,
    left: 20
  };

  const countryAccessor = (d) => d?.code;
  const married15Acc = (d) => d?.married_by_15;
  const married18Acc = (d) => d?.married_by_18;

  $: countries = Array.from(new Set(data.map(countryAccessor)));

  $: x = scaleBand()
    .domain(countries)
    .range([margins.left, (w ?? 1000) - margins.right])
    .padding(0.05);
  $: y = scaleLinear()
    .domain([0, 1])
    .range([h - margins.top - margins.bottom, margins.top]);

  $: yTicks = y.ticks();

  let hoverPos;
  let hoverData;
  function updateMouse(evt, d) {
    hoverPos = { x: evt.clientX, y: evt.clientY };

    hoverData = d;
  }

  $: referenceCountryData = data.find((d) => countryAccessor(d) === $referenceCountry);
</script>

<div class="svg-container" bind:clientWidth={w}>
  <svg width={w} height={h}>
    <ChartGrid
      gridType="yGrid"
      innerHeight={h - margins.top - margins.bottom}
      innerWidth={(w ?? 1000) - margins.left - margins.right}
      scale={y}
      ticks={yTicks}
      yAxisUnits={'%'}
      formatter={(d) => (d * 100).toFixed(0)}
    />
    {#each data.sort((a, b) => married18Acc(b) - married18Acc(a)) as d}
      <rect
        class="married-18"
        x={x(countryAccessor(d))}
        y={y(married18Acc(d))}
        width={x.bandwidth()}
        height={y(married15Acc(d)) - y(married18Acc(d))}
      />
      <rect
        class="married-15"
        x={x(countryAccessor(d))}
        y={y(married15Acc(d))}
        width={x.bandwidth()}
        height={y.range()[0] - y(married15Acc(d))}
      />
      <rect
        class="interactive"
        x={x(countryAccessor(d))}
        width={x.bandwidth()}
        y={0}
        height={h}
        on:mouseover={(e) => updateMouse(e, d)}
        on:click={(e) => updateMouse(e, d)}
        on:mouseout={(e) => updateMouse(e, null)}
      />
    {/each}
    {#each [hoverData, referenceCountryData].filter((d) => d) as d}
      <rect
        class="highlight-or-reference"
        class:highlight={countryAccessor(hoverData) === countryAccessor(d)}
        class:reference={countryAccessor(referenceCountryData) === countryAccessor(d)}
        x={x(countryAccessor(d))}
        y={y(married18Acc(d))}
        width={x.bandwidth()}
        height={y.range()[0] - y(married18Acc(d))}
      />
      {#if countryAccessor(referenceCountryData) === countryAccessor(d)}
        <text
          class="reference-label"
          class:middle={x(countryAccessor(d)) > 100 && x(countryAccessor(d) < w - 100)}
          class:end={x(countryAccessor(d)) > w - 100}
          x={x(countryAccessor(d))}
          y={y(married18Acc(referenceCountryData)) - 10}>{$_('country.' + $referenceCountry.toLowerCase())}</text
        >
      {/if}
    {/each}
  </svg>
  <CategoricalLegend
    legendType="custom"
    customItems={[
      { key: label_women_15, colour: Colors.ColorBaseRed500 },
      { key: label_women_18, colour: Colors.ColorBaseYellow200 }
    ]}
  />
</div>
{#if hoverData}
  <Tooltip visible={true} targetPos={hoverPos}>
    <p class="label">
      {capitalize($_('in', { default: 'in' }))}
      <span class="label stronger geo">{$_(`country.${countryAccessor(hoverData)?.toLowerCase()}`)},</span>
      <span class="label stronger"><Number value={married15Acc(hoverData) * 100} unit="%" digits="1" /></span>
      {label_tooltip_15},
      <span class="label stronger"> <Number value={married18Acc(hoverData) * 100} unit="%" digits="1" /></span>
      {label_tooltip_18}.
    </p>
  </Tooltip>
{/if}

<style>
  .svg-container {
    flex: 1;
  }

  .married-15 {
    fill: var(--color-base-red500);
  }

  .married-18 {
    fill: var(--color-base-yellow200);
  }

  rect.highlight-or-reference {
    fill: none;
    pointer-events: none;
    stroke-width: 2px;
    outline: none;
  }
  rect.interactive:focus {
    outline: none;
  }
  rect.highlight {
    stroke: black;
  }

  .interactive {
    opacity: 0;
  }
</style>
