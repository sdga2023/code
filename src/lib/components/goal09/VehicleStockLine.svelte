<script>
  import { scaleLinear } from 'd3-scale';
  import { line, curveNatural } from 'd3-shape';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import { filter } from 'd3-array';

  export let data;
  export let oecd;
  export let nonoecd;
  export let yaxistitle;
  export let yaxisunits;

  $: labels = data ? data.filter((d) => d.year == 2010 || d.year == 2050) : [];

  let margins = {
    top: 20,
    right: 104,
    bottom: 24,
    left: 30
  };

  let w;
  let h = 450;

  $: xScale = scaleLinear()
    .domain([2010, 2050])
    .range([0, w - margins.left - margins.right]);
  $: xTicks = [2010, 2020, 2030, 2040, 2050];
  $: yScale = scaleLinear()
    .domain([0, 1050])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = [0, 250, 500, 750, 1000];

  $: lineGenerator_oecd = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.conventional_oecd))
    .curve(curveNatural);

  $: lineGenerator_nonoecd = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.conventional_non_oecd))
    .curve(curveNatural);
</script>

<div class="linechart" bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h}>
      <g transform={'translate(0,' + margins.top + ')'}>
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
        {#if xScale && xTicks && w && yScale && lineGenerator_oecd && data && labels}
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
            hideLines={true}
          />

          <path d={lineGenerator_oecd(data)} class="bg" />
          <path d={lineGenerator_oecd(data.filter((d) => d.year <= 2022))} stroke={Colors.ColorVisCat82} />
          <path d={lineGenerator_oecd(data)} stroke={Colors.ColorVisCat82} class="projection" />

          <path d={lineGenerator_nonoecd(data)} class="bg" />
          <path d={lineGenerator_nonoecd(data.filter((d) => d.year <= 2022))} stroke={Colors.ColorVisCat81} />
          <path d={lineGenerator_nonoecd(data)} stroke={Colors.ColorVisCat81} class="projection" />
          {#each labels as label}
            <circle
              cx={xScale(label.year)}
              cy={yScale(label.conventional_non_oecd)}
              r={LineChartCircleRadius}
              fill={Colors.ColorVisCat81}
            />
            <circle cx={xScale(label.year)} cy={yScale(label.conventional_oecd)} r={LineChartCircleRadius} fill={Colors.ColorVisCat82} />
            {#if label.year == 2050}
              <text class={'category'} x={xScale(label.year) + 6} y={yScale(label.conventional_non_oecd)} style:fill={Colors.ColorVisCat81}
                >{nonoecd}</text
              >
              <text
                class={'number'}
                x={xScale(label.year) + 6}
                y={yScale(label.conventional_non_oecd) + 18}
                style:fill={Colors.ColorVisCat81}><Number value={label.conventional_non_oecd} digits={1} /></text
              >

              <text class={'category'} x={xScale(label.year) + 6} y={yScale(label.conventional_oecd)} style:fill={Colors.ColorVisCat82}
                >{oecd}</text
              >
              <text class={'number'} x={xScale(label.year) + 6} y={yScale(label.conventional_oecd) + 18} style:fill={Colors.ColorVisCat82}
                ><Number value={label.conventional_oecd} digits={1} /></text
              >
            {/if}
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
</div>
