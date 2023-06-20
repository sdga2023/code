<script>
  import { scaleLinear, scalePoint } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from './../ChartGrid.svelte';
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import Number from '../general/Number.svelte';

  export let data;
  export let low;
  export let middlelow;
  export let middlehigh;
  export let high;
  export let xaxistitle;
  export let xaxisunits;
  export let status;
  export let math;
  export let reading;

  let levels = [
    { key: 'low', label: low },
    { key: 'middlelow', label: middlelow },
    { key: 'middlehigh', label: middlehigh },
    { key: 'high', label: high }
  ];

  let margins = {
    top: 30,
    right: 16,
    bottom: 36,
    left: 80
  };

  let w;
  $: h = 250;

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [0, 25, 50, 75, 100];
  $: yScale = scalePoint()
    .domain(levels.map((d) => d.key))
    .range([0, h - margins.top - margins.bottom])
    .padding(0.3);
</script>

<div bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h} class="arrowplot">
      <defs>
        <marker id="arrowhead-orange" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill={Colors.ColorBaseOrange400} stroke="white" stroke-width={0} />
        </marker>
        <marker id="arrowhead-purple" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill={Colors.ColorBasePurple400} stroke="white" stroke-width={0} />
        </marker>
      </defs>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
          xAxisUnits={xaxisunits}
          xAxisTitle={xaxistitle}
        />
        {#each data as trend}
          <line
            x1={xScale(trend.y2019)}
            x2={xScale(trend.y2021)}
            y1={yScale(trend.ses)}
            y2={yScale(trend.ses)}
            stroke={trend.test == 'math' ? Colors.ColorBasePurple400 : Colors.ColorBaseOrange400}
            style:marker-end={trend.test == 'math' ? 'url(#arrowhead-purple)' : 'url(#arrowhead-orange)'}
          />
          <circle
            cx={xScale(trend.y2019)}
            cy={yScale(trend.ses)}
            r={LineChartCircleRadius}
            fill={trend.test == 'math' ? Colors.ColorBasePurple400 : Colors.ColorBaseOrange400}
          />
          <text
            class={'number small'}
            x={xScale(trend.y2019) + 6}
            y={yScale(trend.ses) + 4}
            dy={trend.ses == 'low' && trend.test == 'math' ? 12 : 0}
            dx={trend.ses == 'low' && trend.test == 'math' ? 16 : 0}><Number value={trend.y2019}></Number></text
          >
          <text
            class={'number small'}
            x={xScale(trend.y2021) - 6}
            y={yScale(trend.ses) + 4}
            text-anchor={'end'}
            dy={trend.ses == 'low' && trend.test == 'reading' ? +12 : 0}
            dx={trend.ses == 'low' && trend.test == 'reading' ? -16 : 0}><Number value={trend.y2021}></Number></text
          >

          {#if trend.ses == 'low' && trend.test == 'reading'}
            <text
              x={xScale(trend.y2019)}
              y={yScale(trend.ses) - 10}
              fill={Colors.ColorBaseOrange400}
              class={'number small'}
              text-anchor={'middle'}>2019</text
            >
          {/if}
          {#if trend.ses == 'low' && trend.test == 'math'}
            <text
              x={xScale(trend.y2021)}
              y={yScale(trend.ses) - 10}
              fill={Colors.ColorBasePurple400}
              class={'number small'}
              text-anchor={'middle'}>2021</text
            >
          {/if}
        {/each}
        {#each levels as level}
          <text class={'axis-label end'} x={xScale(0) - 6} y={yScale(level.key) + 4}>{level.label}</text>
        {/each}

        <text
          class={'category'}
          x={xScale(data.find((d) => d.ses == 'low' && d.test == 'math').y2021) +
            (xScale(data.find((d) => d.ses == 'low' && d.test == 'math').y2019) -
              xScale(data.find((d) => d.ses == 'low' && d.test == 'math').y2021)) /
              2}
          y={yScale('low') - 6}
          style:fill={Colors.ColorBasePurple400}
          text-anchor={'middle'}
          >{math}
        </text>

        <text
          class={'category'}
          x={xScale(data.find((d) => d.ses == 'low' && d.test == 'reading').y2021) +
            (xScale(data.find((d) => d.ses == 'low' && d.test == 'reading').y2019) -
              xScale(data.find((d) => d.ses == 'low' && d.test == 'reading').y2021)) /
              2}
          y={yScale('low') - 6}
          style:fill={Colors.ColorBaseOrange400}
          text-anchor={'middle'}>{reading}</text
        >
      </g>
      <text class={'axis-label'} x={0} y={12}>{status}</text>
    </svg>
  {/if}
</div>
