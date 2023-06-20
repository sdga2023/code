<script>
  import { _ } from 'svelte-i18n';
  import { scaleLinear, scaleSequential } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from './../ChartGrid.svelte';
  import Tooltip from './../general/Tooltip.svelte';
  import Number from './../general/Number.svelte';
  import { interpolateLab, piecewise } from 'd3';
  import Legend from '../general/Legend.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { fade } from 'svelte/transition';
  import { tweened } from 'svelte/motion';
  import * as eases from 'svelte/easing';

  export let data;
  export let yaxisunits;
  export let countrypopulation;
  export let totalpopulation;
  export let percapita;
  export let legendtitle;
  export let legendunits;
  export let millionpeople;
  export let activeScene;
  export let ghg;
  export let co2;
  export let ch4;

  const gasMap = {
    ghg: ghg,
    co2: co2,
    ch4: ch4
  };

  const incomeIndices = [0, 1, 4, 6];

  $: data = incomeIndices.includes(activeScene.index)
    ? data.filter((d) => ['HIC', 'LIC', 'UMC', 'LMC'].includes(d.iso3c))
    : data.filter((d) => !['WLD', 'HIC', 'LIC', 'UMC', 'LMC'].includes(d.iso3c));
  $: refCountryData = $referenceCountry ? data.find((d) => d.iso3c == $referenceCountry) : null;

  $: gas = activeScene.index < 4 ? 'ghg' : activeScene.index < 6 ? 'co2' : 'ch4';

  let margins = {
    top: 20,
    right: 14,
    bottom: 50,
    left: 20
  };
  let w;
  let h = 600;

  $: colorScale = incomeIndices.includes(activeScene.index)
    ? scaleSequential(piecewise(interpolateLab, [Colors.ColorBaseTeal300, Colors.ColorBasePurple400])).domain([0, 20000])
    : scaleSequential(piecewise(interpolateLab, [Colors.ColorBaseTeal300, Colors.ColorBasePurple400])).domain([0, 20000]);

  $: xScale = scaleLinear()
    .domain([0, 7700000000])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [];

  const yMax = tweened(32, {
    duration: 750,
    easing: eases.cubicInOut
  });
  $: if(activeScene.index < 4){
    $yMax = 32
  }
  $: if(activeScene.index > 3 && activeScene.index < 6){
    $yMax = 15
  }
  $: if(activeScene.index > 5 && activeScene.index < 7){
    $yMax = 2
  }
  $: if(activeScene.index == 7){
    $yMax = 5
  }
  $: yScale = scaleLinear()
    .domain([0, $yMax])
    .range([h - margins.bottom, margins.top]);
  $: yTicks = activeScene.index < 4
    ? [0, 10, 20, 30]
    : activeScene.index < 6
      ? [0, 5, 10, 15]
      : [0, 1, 2, 3, 4, 5]

  const labels = ['CHN', 'IND'];

  let hoveredCountry = null;

  let tooltipVisible = false;
  let tooltipTargetPos = { x: 0, y: 0 };

  function showTooltip(e, countryData) {
    hoveredCountry = countryData;
    tooltipVisible = true;
    const x = e.clientX;
    const y = e.clientY;
    tooltipTargetPos = { ...tooltipTargetPos, x, y };
  }
  function hideTooltip() {
    tooltipVisible = false;
  }
</script>

<Legend title={legendtitle} color={colorScale} units="" unitLabel={legendunits} digits="0" />
<div bind:clientWidth={w} bind:clientHeight={h} class="svg-container">
  <svg width={w} height={h}>
    <defs>
      <!--

      <marker id="arrowhead_pos" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={ColorVisBinaryPos} />
      </marker>
              
      -->

      <marker id="endarrowblack" viewBox="0 0 10 10" markerWidth="6" markerHeight="6" refX="0" refY="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={Colors.ColorThemeTextWeaker} />
      </marker>
      <marker
        id="startarrowblack"
        viewBox="0 0 10 10"
        markerWidth="6"
        markerHeight="6"
        refX="0"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={Colors.ColorThemeTextWeaker} />
      </marker>

      <marker id="endarrowwhite" viewBox="0 0 10 10" markerWidth="6" markerHeight="6" refX="0" refY="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
      </marker>
      <marker
        id="startarrowwhite"
        viewBox="0 0 10 10"
        markerWidth="6"
        markerHeight="6"
        refX="0"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
      </marker>
    </defs>
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={yaxisunits}
        yAxisTitle={gasMap[gas]}
      />
    </g>
    <g transform={`translate(${margins.left},${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />

      {#each data as country}
        <rect
          x={xScale(country['cumpop_' + gas] - country.pop)}
          y={yScale(country[gas + 'percap'])}
          height={yScale(0) - yScale(country[gas + 'percap'])}
          width={xScale(country.pop)}
          fill={colorScale(country[gas])}
          stroke={Colors.ColorThemeBgWeaker}
          stroke-width={0.1}
          on:mouseover={(e) => showTooltip(e, country)}
          on:focus={(e) => showTooltip(e, country)}
          on:mouseout={() => hideTooltip()}
          on:blur={() => hideTooltip()}
          transition:fade|local
        />
      {/each}

      {#each data as country}
        {#if country.iso3c === 'CHN' || country.iso3c === 'UMC'}
          <line
            x1={xScale(country['cumpop_' + gas] - country.pop) + 10}
            x2={xScale(country['cumpop_' + gas]) - 10}
            y1={yScale(0) + 7}
            y2={yScale(0) + 7}
            marker-end="url(#startarrowblack)"
            marker-start="url(#endarrowblack)"
            stroke={Colors.ColorThemeTextWeaker}
            stroke-width={1.5}
            transition:fade|local
          />
          <text
            x={xScale(country['cumpop_' + gas] - country.pop / 2)}
            y={yScale(0) + 25}
            text-anchor="middle"
            class="small"
            transition:fade|local>{incomeIndices.includes(activeScene.index) ? totalpopulation : countrypopulation}</text
          >
          <line
            x1={xScale(country['cumpop_' + gas] - country.pop) + 10}
            x2={xScale(country['cumpop_' + gas] - country.pop) + 10}
            y1={yScale(0) - 10}
            y2={yScale(country[gas + 'percap']) + 10}
            marker-end="url(#startarrowwhite)"
            marker-start="url(#endarrowwhite)"
            stroke={'#ffffff'}
            stroke-width={1.5}
            transition:fade|local
          />
          <text
            x={xScale(country['cumpop_' + gas] - country.pop) + 16}
            y={yScale(country[gas + 'percap'] / 2) + 5}
            class="small no-pointer-events"
            transition:fade|local>{percapita}</text
          >
        {/if}
        {#if labels.includes(country.iso3c)}
          <text
            x={xScale(country['cumpop_' + gas] - country.pop / 2)}
            y={yScale(country[gas + 'percap']) - 4}
            text-anchor={'middle'}
            class="geo"
            transition:fade|local>{$_(`country.${country.iso3c.toLowerCase()}`)}</text
          >
        {/if}
      {/each}
      {#if incomeIndices.includes(activeScene.index)}
        {#each data as income}
          <text
            x={xScale(
              income.iso3c === 'LIC'
                ? income['cumpop_' + gas]
                : income.iso3c === 'HIC'
                ? income['cumpop_' + gas] - income.pop
                : income['cumpop_' + gas] - income.pop / 2
            )}
            y={yScale(income[gas + 'percap']) - 4}
            text-anchor={income.iso3c === 'LIC' ? 'end' : income.iso3c === 'HIC' ? 'start' : 'middle'}
            class="geo"
            transition:fade|local>{$_(`country.${income.iso3c.toLowerCase()}`)}</text
          >
        {/each}
      {/if}

      {#if refCountryData}
        <rect
          x={xScale(refCountryData['cumpop_' + gas] - refCountryData.pop)}
          y={yScale(refCountryData[gas + 'percap'])}
          height={yScale(0) - yScale(refCountryData[gas + 'percap'])}
          width={xScale(refCountryData.pop)}
          fill={'none'}
          stroke={Colors.ColorReferenceCountry}
          stroke-width={4}
          style:pointer-events={'none'}
        />
        <rect
          x={xScale(refCountryData['cumpop_' + gas] - refCountryData.pop)}
          y={yScale(refCountryData[gas + 'percap'])}
          height={yScale(0) - yScale(refCountryData[gas + 'percap'])}
          width={xScale(refCountryData.pop)}
          fill={'none'}
          stroke={'#ffffff'}
          stroke-width={1}
          style:pointer-events={'none'}
        />
        <text
          x={xScale(refCountryData['cumpop_' + gas]) < 68
            ? -margins.left
            : xScale.range()[1] - xScale(refCountryData['cumpop_' + gas]) < 68
            ? xScale.range()[1]
            : xScale(refCountryData['cumpop_' + gas] - refCountryData.pop / 2)}
          y={yScale(refCountryData[gas + 'percap']) - 8}
          text-anchor={xScale(refCountryData['cumpop_' + gas]) < 68
            ? 'start'
            : xScale.range()[1] - xScale(refCountryData['cumpop_' + gas]) < 68
            ? 'end'
            : 'middle'}
          class="reference-label">{$_(`country.${refCountryData.iso3c.toLowerCase()}`)}</text
        >
      {/if}
    </g>
  </svg>
  <Tooltip visible={tooltipVisible} targetPos={tooltipTargetPos}>
    {#if hoveredCountry}
      <p class="label caps">{$_(`country.${hoveredCountry.iso3c.toLowerCase()}`)}</p>
      <p class="label caps">{gasMap[gas]}</p>
      <p class="label number"><Number value={hoveredCountry[gas + 'percap']} digits={2} /></p>
      <p class="label small weaker">{yaxisunits}</p>
      <hr />
      <p class="label number"><Number value={hoveredCountry.pop / 1000000} digits="0" /></p>
      <p class="label small weaker">{millionpeople}</p>
      <hr />
      <p class="label number"><Number value={hoveredCountry[gas]} digits={0} /></p>
      <p class="label small weaker">{legendunits}</p>
    {/if}
  </Tooltip>
</div>

<style>
  .no-pointer-events {
    pointer-events: none;
  }
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
  svg {
    margin: auto;
  }
</style>
