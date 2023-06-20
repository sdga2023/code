<script>
  import { stack, stackOrderNone, stackOffsetNone, area, curveNatural } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from '../ChartGrid.svelte';

  export let data;
  export let yaxisunits;
  export let road;
  export let rail;
  export let shipping;
  export let aviation;
  export let pipelines;

  let margins = {
    top: 40,
    right: 12,
    bottom: 30,
    left: 14
  };
  let w;
  let h = 450;

  const colorScale = {
    road: { color: Colors.ColorVisCat83, label: road, x: 2010, y: 3 },
    shipping: { color: Colors.ColorVisCat86, label: shipping, x: 2011, y: 5.7 },
    aviation: { color: Colors.ColorVisCat87, label: aviation, x: 2013, y: 6.8 },
    pipelines: { color: Colors.ColorVisCat81, label: pipelines, x: 2015, y: 8 },
    rail: { color: Colors.ColorVisCat82, label: rail, x: 2018, y: 8.45 }
  };

  $: stackedData = stack().keys(Object.keys(colorScale)).order(stackOrderNone).offset(stackOffsetNone)(data);

  $: xScale = scaleLinear()
    .domain([2000, 2021])
    .range([0, w - margins.right]);
  const xTicks = [2000, 2005, 2010, 2015, 2020];
  $: yScale = scaleLinear()
    .domain([0, 9])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 3, 6, 9];
  $: areaGenerator = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveNatural);
</script>

<div bind:clientWidth={w}>
  <!--CategoricalLegend legendType={'regions'} /-->
  <svg width={w} height={h} class="stacked-area">
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={yaxisunits}
      />
    </g>
    <g transform={`translate(${margins.left},${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
        hideLines="true"
      />
      {#if stackedData && areaGenerator && xScale && yScale}
        {#each stackedData as series, i}
          <path d={areaGenerator(series)} style:fill={colorScale[series.key].color} />
        {/each}
        {#each stackedData as series, i}
          <text
            class="category no-stroke"
            x={xScale(colorScale[series.key].x)}
            y={yScale(colorScale[series.key].y)}
            text-align={'middle'}
            style:fill={series.key == 'road'
              ? Colors.ColorThemeText
              : series.key == 'pipelines' || series.key == 'rail'
              ? colorScale[series.key].color
              : Colors.ColorThemeDarkText}>{colorScale[series.key].label}</text
          >
        {/each}
      {/if}
    </g>
  </svg>
</div>
