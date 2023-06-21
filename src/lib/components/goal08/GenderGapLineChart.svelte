<script>
  import { scaleLinear } from 'd3-scale';
  import { line, curveNatural } from 'd3-shape';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import ChartGrid from './../ChartGrid.svelte';
  import { nest } from 'd3-collection';

  export let data;
  export let yaxistitle;
  export let yaxisunits;

  let margins = {
    top: 30,
    right: 300,
    bottom: 20,
    left: 16
  };

  let w;
  let h = 450;

  let nestedData = nest()
    .key((d) => d.iso3c)
    .entries(data);

  $: xScale = scaleLinear()
    .domain([2015, 2022])
    .range([0, w - margins.left - margins.right]);

  const xTicks = [2015, 2019, 2022];
  let yDomain = [-2, 15];
  $: yScale = scaleLinear()
    .domain(yDomain)
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 5, 10, 15];

  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.gap))
    .curve(curveNatural);

  const colorScale = {
    EAS: Colors.ColorVisRegionEAS,
    ECS: Colors.ColorVisRegionECS,
    LCN: Colors.ColorVisRegionLCN,
    MEA: Colors.ColorVisRegionMEA,
    NAC: Colors.ColorVisRegionNAC,
    SAS: Colors.ColorVisRegionSAS,
    SSF: Colors.ColorVisRegionSSF
  };
  const labelNudges = {
    EAS: 10,
    ECS: 0,
    LCN: 0,
    MEA: 0,
    NAC: -6,
    SAS: 6,
    SSF: 0
  };
</script>

<div bind:clientWidth={w} class="line-chart">
  <svg width={w} height={h}>
    {#if w}
      <g transform={'translate(0,' + margins.top + ')'}>
        <rect
          x={xScale(2019) + margins.left}
          y={0}
          width={xScale(2022) - xScale(2019)}
          height={h - margins.top - margins.bottom}
          fill={Colors.ColorThemeBgWeaker}
        />
        {#if yScale && yTicks && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={yTicks}
            yAxisTitle={yaxistitle}
            yAxisUnits={yaxisunits}
          />
        {/if}
      </g>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
        />
        {#each nestedData as lineData}
          <path d={lineGenerator(lineData.values)} fill={'none'} stroke={colorScale[lineData.key]} stroke-width={1.5} />
          {#if xScale && yScale}
            {#each lineData.values as point}
              <circle
                cx={xScale(point.year)}
                cy={yScale(point.gap)}
                r={4}
                fill={colorScale[lineData.key]}
                stroke={'white'}
                stroke-width={1}
              />
              {#if point.year == 2022}
                <text
                  x={xScale(2022) + 6}
                  y={yScale(point.gap) + 5 + labelNudges[lineData.key]}
                  class="small"
                  fill={lineData.key == 'SSF' ? Colors.ColorBaseYellow300 : colorScale[lineData.key]}>{$_(`region.${lineData.key}`)}</text
                >
              {/if}
            {/each}
          {/if}
        {/each}
      </g>
    {/if}
  </svg>
</div>

<style>
  .line-chart {
    width: 100%;
  }
</style>
