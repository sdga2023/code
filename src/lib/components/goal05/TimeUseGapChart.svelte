<script>
  // your script goes here
  import Image from '../Image.svelte';
  import { _ } from 'svelte-i18n';

  import { scaleLinear, scaleBand } from 'd3-scale';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import * as Tokens from '$lib/styles/vis.js';
  import { max, ticks } from 'd3-array';
  import { format } from 'd3-format';
  import Tooltip from '../general/Tooltip.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { isMobile } from '$lib/stores/isMobile';

  export let data, yAxisUnits;
  export let label_tooltip_1 = 'women on average spend';
  export let label_tooltip_2 = 'hours on domestic work versus';
  export let label_tooltip_3 = 'hours for men';

  let circleProp1 = 'male';
  let circleProp2 = 'female';
  $: sortedData = data.sort((a, b) => a['female'] - b['female']);

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

  $: r = $isMobile ? Tokens.ScatterCircleRadiusMob : Tokens.ScatterCircleRadius;
  const yDomain = [0, Math.ceil(max(data, (d) => d[circleProp2]))];

  $: xScale = scaleBand()
    .domain(data.map((d) => d.country))
    .range([0, chartWidth]);
  $: yScale = scaleLinear().domain(yDomain).range([chartHeight, 0]);

  $: yTicks = ticks(...[...yDomain, 6]);

  let hover,
    mousePosition = { x: 0, y: 0 };
  const formatHours = format('.1f');

  $: refCountry = sortedData.find((c) => $referenceCountry === c.iso3c);
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
          <ChartGrid gridType="yGrid" innerWidth={w} innerHeight={h} scale={yScale} ticks={yTicks} {yAxisUnits} />
        </g>
        <g>
          {#if sortedData}
            {#each sortedData as d}
              <g
                transform={`translate(${xScale(d.country)}, 0)`}
                class:hovered={hover?.iso3c && hover?.iso3c === d.iso3c}
                class:ref={refCountry && refCountry.iso3c === d.iso3c}
              >
                <line y1={yScale(d[circleProp1])} y2={yScale(d[circleProp2])} stroke={Colors.ColorGrey300} />
                <circle class="circle-male" cy={yScale(d[circleProp1])} {r} stroke="white" fill={Colors.ColorVisGenderMale} />
                <circle class="circle-female" cy={yScale(d[circleProp2])} {r} stroke="white" fill={Colors.ColorVisGenderFemale} />
                <rect
                  class="hover-rect"
                  x={-xScale.bandwidth() / 2}
                  width={xScale.bandwidth()}
                  height={chartHeight}
                  on:mouseover={() => (hover = d)}
                  on:mouseout={() => (hover = undefined)}
                />
              </g>
            {/each}
          {/if}
        </g>
        {#if refCountry}
          <text
            class="reference-label"
            class:middle={xScale(refCountry.country) > 20 && xScale(refCountry.country) < w - 100}
            class:end={xScale(refCountry.country) >= w - 100}
            x={xScale(refCountry.country)}
            y={yScale(refCountry[circleProp1]) + (yScale(refCountry[circleProp2]) - yScale(refCountry[circleProp1])) / 2}
            >{refCountry.country}</text
          >
        {/if}
      </g>
    </svg>
    <CategoricalLegend legendType="gender" />
    {#if hover}
      <Tooltip visible={hover !== undefined} targetPos={mousePosition}>
        <div class="label">
          <span class="label stronger">{hover.iso3c === 'WLD' ? 'Worldwide' : $_('country.' + hover.iso3c.toLowerCase())}</span>: {label_tooltip_1}
          <span class="label stronger">{formatHours(hover.female)}</span>
          {label_tooltip_2} <span class="label stronger">{formatHours(hover.male)}</span>
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
    }
  }

  .hovered {
    line {
      stroke-width: 2.5;
      stroke: var(--color-grey-600);
    }
    circle {
      stroke-width: 2.5;
      stroke: var(--color-grey-600);
    }
  }
  .ref {
    line {
      stroke-width: 2.5;
      stroke: var(--color-reference-country);
    }
    circle {
      stroke-width: 2.5;
      stroke: var(--color-reference-country);
    }
  }
</style>
