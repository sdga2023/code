<script>
  // your script goes here

  import { scaleLinear, scaleBand } from 'd3-scale';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { ticks } from 'd3-array';
  import { format } from 'd3-format';
  import Tooltip from '../general/Tooltip.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { RefCountryOffset, RefOffset } from '$lib/styles/vis';
  import capitalize from '$lib/components/tools/capitalize.js';
  import { _ } from 'svelte-i18n';

  export let data;
  export let label_tooltip_1 = 'women bear the burden of collecting water in';
  export let label_tooltip_2 = 'of households and men in';
  export let label_tooltip_3 = 'of households';
  let barProp1 = 'male';
  let barProp2 = 'female';

  $: dataSorted = data.sort((a, b) => a['female'] - b['female']);

  //data = data.sort((a, b) => b[barProp2] - a[barProp2]);

  let margins = {
    top: 15,
    right: 0,
    bottom: 15,
    left: 30
  };

  let w,
    h = 450;
  $: chartWidth = w - margins.left - margins.right;
  $: chartHeight = h - margins.top - margins.bottom;

  const r = 5;
  const yDomain = [-1, 1];
  const formatY = (d) => format('.0%')(Math.abs(d));

  $: xScale = scaleBand()
    .domain(dataSorted.map((d) => d.country))
    .range([0, chartWidth])
    .padding(0.1);
  $: yScale = scaleLinear().domain(yDomain).range([chartHeight, 0]);
  $: yDiff = yDomain[1] - yDomain[0];
  $: yTicks = ticks(...[...yDomain, 8]);

  let hover,
    mousePosition = { x: 0, y: 0 };
  const formatPercent = format('.0%');

  $: refCountry = dataSorted?.find((c) => $referenceCountry === c.iso3c);
</script>

<div bind:clientWidth={w}>
  {#if w && h}
    <svg
      width={w}
      height={h}
      on:mousemove={(e) => {
        mousePosition = { x: e.clientX, y: e.clientY };
      }}
    >
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <g class="y-axis" transform={`translate(${-margins.left}, ${0})`}>
          <ChartGrid
            gridType="yGrid"
            innerWidth={w}
            innerHeight={h}
            scale={yScale}
            ticks={yTicks}
            formatter={formatY}
            yAxisUnits={$_('female')}
            yAxisUnitsBottom={$_('male')}
          />
        </g>
        <g>
          {#if dataSorted}
            {#each dataSorted as d, i}
              <g transform={`translate(${xScale(d.country)}, 0)`}>
                <rect
                  class={`bar-${barProp1}`}
                  width={xScale.bandwidth()}
                  height={chartHeight * (d[barProp1] / yDiff)}
                  x={0}
                  y={yScale(0)}
                  fill={Colors.ColorVisGenderMale}
                />
                <rect
                  class={`bar-${barProp2}`}
                  width={xScale.bandwidth()}
                  height={chartHeight * (d[barProp2] / yDiff)}
                  x={0}
                  y={yScale(d[barProp2])}
                  fill={Colors.ColorVisGenderFemale}
                />
                <rect
                  class="hover-rect"
                  width={xScale.bandwidth()}
                  height={chartHeight * ((d[barProp1] + d[barProp2]) / yDiff)}
                  x={0}
                  y={yScale(d[barProp2])}
                  on:mouseover={() => (hover = d)}
                  on:mouseout={() => (hover = undefined)}
                />
              </g>
            {/each}
            {#if refCountry}
              <rect
                class="ref"
                width={xScale.bandwidth()}
                height={chartHeight * ((refCountry[barProp1] + refCountry[barProp2]) / yDiff)}
                x={xScale(refCountry.country)}
                y={yScale(refCountry['female'])}
              />
              <text
                class:middle={xScale(refCountry.country) > 20 && xScale(refCountry.country) < w - 100}
                class:end={xScale(refCountry.country) >= w - 100}
                class="reference-label"
                x={xScale(refCountry.country)}
                y={yScale(refCountry['female']) - 5}>{refCountry.country}</text
              >
            {/if}
          {/if}
        </g>
      </g>
    </svg>
    <CategoricalLegend legendType="gender" />
    {#if hover}
      <Tooltip visible={hover !== undefined} targetPos={mousePosition}>
        <div class="label">
          {capitalize($_('in', { default: 'in' }))} <span class="label stronger">{hover.country}</span>, {label_tooltip_1}
          <span class="label stronger">{formatPercent(hover.female)}</span>
          {label_tooltip_2}
          <span class="label stronger">{formatPercent(hover.male)}</span>
          {label_tooltip_3}.
        </div>
      </Tooltip>
    {/if}
  {/if}
</div>

<style lang="scss">
  .hover-rect {
    fill: none;
    &:hover {
      cursor: pointer;
      stroke: var(--color-grey-600);
      stroke-width: 2.5;
    }
  }

  .ref {
    fill: none;
    stroke: var(--color-reference-country);
    stroke-width: 2.5;
  }
</style>
