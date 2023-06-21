<script>
    import ChartGrid from "../ChartGrid.svelte";
    import { LineChartCircleRadius } from '$lib/styles/vis';
    import { fade } from 'svelte/transition';
    import * as Colors from '$lib/styles/tokens.es6.js';
    import Number from '../general/Number.svelte';
    import { _ } from 'svelte-i18n';
    
    export let averageData;
    export let quintileData;
    export let margins;
    export let yScale;
    export let yTicks;
    export let yaxistitle;
    export let xScale;
    export let activeScene;
    export let colourScale;
    export let w;
    export let h;
    export let beforecovid;
    export let apriljune;
    export let country

    let chartHeight;

</script>

<div class="container">
<p class="label title geo centered">{$_('country.' + country)}</p>
<div class="svg-container" bind:clientHeight={chartHeight}>
<svg width={w} height={h} class="slopechart">
    <g transform={`translate(${margins.left - 16}, ${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right + 16}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={'%'}
        yAxisTitle={yaxistitle}
      />
    </g>
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      {#each ['learning_activities_precovid', 'learning_activities'] as xtick}
        <line x1={xScale(xtick)} x2={xScale(xtick)} y1={yScale(0)} y2={yScale(100)} class="gridline" />
        <text
          class="axis-label weaker middle"
          x={xScale(xtick)}
          dx={xtick == 'learning_activities_precovid' ? + 20 : - 20}
          y={yScale(0) + 14}
          >{xtick == 'learning_activities_precovid' ? beforecovid : apriljune}</text
        >
      {/each}
      {#each quintileData as quint}
        <!-- Cirlces for quintiles that do the whole animation -->
        <circle
          class={activeScene.index < 4 ? 'transition' : ''}
          transform={`translate(${activeScene.index < 3 ? xScale('learning_activities_precovid') : xScale('learning_activities')},
              ${
                activeScene.index < 2
                  ? yScale(averageData.find(d => d.quintile == "average").learning_activities_precovid)
                  : activeScene.index < 3
                  ? yScale(quint.learning_activities_precovid)
                  : yScale(quint.learning_activities)
              })`}
          cx={0}
          cy={0}
          r={LineChartCircleRadius}
          fill={colourScale(quint.quintile)}
        />
        <!-- Quintile circles that stay on the left -->
        <circle
          class={activeScene.index < 3 ? 'transition' : ''}
          transform={`translate(${xScale('learning_activities_precovid')},
                            ${activeScene.index < 2 ? yScale(averageData.find(d => d.quintile == "average").learning_activities_precovid) : yScale(quint.learning_activities_precovid)})`}
          cx={0}
          cy={0}
          r={4}
          fill={colourScale(quint.quintile)}
        />
        {#if activeScene.index > 1 && (quint.quintile == '1' || quint.quintile == '5')}
          <text
            class={'number small end'}
            x={xScale('learning_activities_precovid') - 8}
            y={yScale(quint.learning_activities_precovid) + 4}
            dy={quint.quintile == '5' ? -6 : 6}
            fill={Colors.ColorVisBinaryNeg}
            transition:fade|local={{ delay: 1500 }}
            >{quint.quintile == '5' ? quint.learning_activities_precovid + '%' : quint.learning_activities_precovid + '%'}</text
          >
        {/if}
        {#if activeScene.index > 2}
          <line
            x1={xScale('learning_activities_precovid')}
            x2={xScale('learning_activities')}
            y1={yScale(quint.learning_activities_precovid)}
            y2={yScale(quint.learning_activities)}
            stroke={colourScale(quint.quintile)}
            transition:fade|local={{ delay: 1500 }}
          />
          {#if quint.quintile == '1' || quint.quintile == '5'}
            <text
              class={'number small'}
              x={xScale('learning_activities') + 8}
              y={yScale(quint.learning_activities) + 4}
              dy={quint.quintile == '5' ? -6 : 6}
              fill={Colors.ColorVisBinaryNeg}
              transition:fade|local={{ delay: 1500 }}>{quint.learning_activities + '%'}</text
            >
          {/if}
        {/if}
      {/each}

      {#each averageData as country}
        <!-- Circle for country average that stays on the left -->
        <circle
          class={activeScene.index < 3 ? 'transition' : ''}
          transform={`translate(${xScale('learning_activities_precovid')},
                          ${yScale(country.learning_activities_precovid)})`}
          cx={0}
          cy={0}
          r={5}
          fill={Colors.ColorVisReference}
        />
        {#if activeScene.index < 2}
          <text
            class={'number end'}
            x={xScale('learning_activities_precovid') - 8}
            y={yScale(country.learning_activities_precovid) + 4}
            fill={Colors.ColorVisReference}
            transition:fade|local={{ delay: 1500 }}><Number value={country.learning_activities_precovid} unit="%" /></text
          >
        {/if}
        <!-- Circle for country average that moves to after covid -->
        <circle
          class={activeScene.index < 3 ? 'transition' : ''}
          transform={`translate(${activeScene.index == 0 ? xScale('learning_activities_precovid') : xScale('learning_activities')},
                          ${
                            activeScene.index == 0 ? yScale(country.learning_activities_precovid) : yScale(country.learning_activities)
                          })`}
          cx={0}
          cy={0}
          r={5}
          fill={Colors.ColorVisReference}
        />

        {#if activeScene.index > 0 && activeScene.index < 2}
          <line
            x1={xScale('learning_activities_precovid')}
            x2={xScale('learning_activities')}
            y1={yScale(country.learning_activities_precovid)}
            y2={yScale(country.learning_activities)}
            stroke={Colors.ColorVisReference}
            transition:fade|local={{ delay: activeScene.index == 1 ? 1500 : 0 }}
          />
          <text
            class={'number start'}
            x={xScale('learning_activities') + 8}
            y={yScale(country.learning_activities) + 4}
            dy={country.iso3c == 'NGA' ? 5 : country.iso3c == 'UGA' ? -5 : 0}
            fill={Colors.ColorVisBinaryNeg}
            transition:fade|local={{ delay: 1500 }}><Number value={country.learning_activities} unit="%" /></text
          >
        {/if}
      {/each}
    </g>
  </svg>
  </div>
</div>

<style>
.container {
    display: flex;
    flex-direction: column;
    margin: auto;
}
.svg-container {
    height: 100%;
}
  circle.transition {
    transition: transform 1.5s;
  }
  line {
    transition: x2 1.5s;
  }
</style>