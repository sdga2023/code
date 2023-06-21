<script>
  import { scaleLinear } from 'd3-scale';
  import { line, curveCatmullRom } from 'd3-shape';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Tokens from '$lib/styles/vis.js';
  import { nest } from 'd3-collection';

  export let data;
  export let yaxistitle;
  export let yaxisunits;
  export let math;
  export let language;
  export let projection;

  let margins = {
    top: 40,
    right: 44,
    bottom: 20,
    left: 14
  };

  let w;
  let h = 450;

  let nestedData = nest()
    .key((d) => d.subject)
    .entries(data);

  $: xScale = scaleLinear()
    .domain([2011, 2021])
    .range([0, w - margins.left - margins.right]);
  const xTicks = [2011, 2013, 2015, 2017, 2019, 2021];
  let yDomain = [175, 250];
  $: yScale = scaleLinear()
    .domain(yDomain)
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [175, 200, 225, 250];

  $: lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.saeb))
    .curve(curveCatmullRom);
  $: projectionLineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.projection))
    .curve(curveCatmullRom);

  $: mathAngle = (Math.atan((yScale(250) - yScale(243)) / (xScale(2021) - xScale(2019))) * 180) / Math.PI;
</script>

<div bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h} class="linechart">
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
        {#if xScale && xTicks && w}
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
            hideLines="true"
          />
        {/if}
        {#each nestedData as lineData}
          <path
            d={projectionLineGenerator(lineData.values.filter((d) => d.year > 2018))}
            fill={'none'}
            stroke={lineData.key === 'math' ? Colors.ColorBasePurple400 : Colors.ColorBaseOrange400}
            class="projection"
          />
          <path
            d={lineGenerator(lineData.values)}
            fill={'none'}
            stroke={lineData.key === 'math' ? Colors.ColorBasePurple400 : Colors.ColorBaseOrange400}
          />

          {#each lineData.values as point}
            <circle
              cx={xScale(point.year)}
              cy={yScale(point.saeb)}
              r={Tokens.LineChartCircleRadius}
              fill={lineData.key === 'math' ? Colors.ColorBasePurple400 : Colors.ColorBaseOrange400}
            />
            {#if point.year == 2021}
              <circle
                cx={xScale(point.year)}
                cy={yScale(point.projection)}
                r={Tokens.LineChartCircleRadius}
                fill={lineData.key === 'math' ? Colors.ColorBasePurple400 : Colors.ColorBaseOrange400}
                class="projection"
              />
            {/if}
          {/each}
          <text
            x={xScale(2016)}
            y={yScale(lineData.values.find((d) => d.year === 2015).saeb + 2.5)}
            class="category middle"
            style:fill={lineData.key === 'math' ? Colors.ColorBasePurple400 : Colors.ColorBaseOrange400}
            >{lineData.key == 'math' ? math : language}</text
          >
        {/each}
        <text class={'caps small'} transform={`translate(${xScale(2020)},${yScale(247.5)}) rotate(${mathAngle})`} text-anchor={'middle'}
          >{projection}</text
        >
        <text class={'caps small'} transform={`translate(${xScale(2020)},${yScale(227.5)}) rotate(${mathAngle})`} text-anchor={'middle'}
          >{projection}</text
        >
      </g>
    </svg>
  {/if}
</div>
