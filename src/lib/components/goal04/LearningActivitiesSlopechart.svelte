<script>
    import { scaleLinear, scalePoint } from 'd3-scale';
    import * as Colors from '$lib/styles/tokens.es6.js';
    import ChartGrid from './../ChartGrid.svelte';
    import { _ } from 'svelte-i18n';
    import Number from '../general/Number.svelte';
  
    export let data;
    export let beforecovid;
    export let apriljune;
    export let yaxistitle;

    $: averageData = data.filter(d => d.quintile == "average")

    $: xLabelTranslations = {
      learning_activities_precovid: beforecovid,
      learning_activities: apriljune
    }
  
    let margins = {
      top: 32,
      right: 250,
      bottom: 32,
      left: 210
    };
  
    let w;
    $: h = 500;
  
    $: xScale = scalePoint()
      .domain(['learning_activities_precovid', 'learning_activities'])
      .range([0, w - margins.right - margins.left]);
    const xTicks = ['learning_activities_precovid', 'learning_activities'];
    $: yScale = scaleLinear()
      .domain([0, 100])
      .range([h - margins.top - margins.bottom, 0]);
    const yTicks = [];
  </script>
  
  <div class="learningactivitiesslope" bind:clientWidth={w}>
    {#if w}
    <svg width={w} height={h}>
        <defs>
            <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color={Colors.ColorVisBinaryPos}/>
            <stop offset="100%" stop-color={Colors.ColorVisBinaryNeg}/>
            </linearGradient>
            </defs>
      <g transform={`translate(${margins.left - 16}, ${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right +16}
          scale={yScale}
          ticks={yTicks}
          yAxisUnits={'%'}
          yAxisTitle={yaxistitle}
        />
      </g>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
          {xLabelTranslations}
        />
        {#each averageData as country}
        <line
            x1={xScale('learning_activities_precovid')}
            x2={xScale('learning_activities')}
            y1={yScale(country.learning_activities_precovid)}
            y2={yScale(country.learning_activities)}
            stroke-width={1.5}
            stroke="url(#linear)"
        ></line>
          <circle
            cx={xScale('learning_activities_precovid')}
            cy={yScale(country.learning_activities_precovid)}
            r={4}
            fill={Colors.ColorVisBinaryPos}
            stroke={'white'}
            stroke-width={1}
          />
          {#if !["UGA", "NGA", "MLI"].includes(country.iso3c)}
          <text
              class={"small"}
              x={xScale('learning_activities_precovid') - 6}
              y={yScale(country.learning_activities_precovid) + 4}
              text-anchor={"end"}
              fill={Colors.ColorVisBinaryPos}
          >{country.learning_activities_precovid}</text>
          {/if}
          <circle
            cx={xScale('learning_activities')}
            cy={yScale(country.learning_activities)}
            r={4}
            fill={Colors.ColorVisBinaryNeg}
            stroke={'white'}
            stroke-width={1}
          />
          <text
              class={"small"}
              x={xScale('learning_activities') + 6}
              y={yScale(country.learning_activities) + 4}
              dy={country.iso3c == "NGA" ? 5 : country.iso3c == "UGA" ? -5 : 0}
              text-anchor={"start"}
              fill={Colors.ColorVisBinaryNeg}
          >{$_(`country.${country.iso3c.toLowerCase()}`) + ": " + country.learning_activities + "%"}</text>
        {/each}
      </g>
    </svg>
    {/if}
  </div>
  