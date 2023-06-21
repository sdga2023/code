<script>
  import { scaleLinear, scalePoint } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from './../ChartGrid.svelte';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let trendClass;
  export let title;
  export let selectedCountry;

  let margins = {
    top: 14,
    right: 32,
    bottom: 32,
    left: 32
  };

  const colorScale = {
    EAS: Colors.ColorVisRegionEAS,
    ECS: Colors.ColorVisRegionECS,
    LCN: Colors.ColorVisRegionLCN,
    MEA: Colors.ColorVisRegionMEA,
    NAC: Colors.ColorVisRegionNAC,
    SAS: Colors.ColorVisRegionSAS,
    SSF: Colors.ColorVisRegionSSF
  };

  let w;
  $: h = 500;

  $: xScale = scalePoint()
    .domain(['2000', '2022'])
    .range([0, w - margins.right - margins.left]);
  const xTicks = ['2000', '2022'];
  $: yScale = scaleLinear()
    .domain([0.35, 1])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0.5, 0.75, 1];

  let currentCountry;
  $: currentCountryData = currentCountry ? data.find((d) => d.iso3c == currentCountry) : null;
  $: selectedCountryData = selectedCountry ? data.find((d) => d.iso3c == selectedCountry) : null;
  $: referenceCountryData = $referenceCountry ? data.find((d) => d.iso3c == $referenceCountry) : null;
</script>

<div class="rlislope" bind:clientWidth={w}>
  <div class={'title caps'}>{title}</div>
  {#if w}
    <svg width={w} height={h}>
      <g transform={`translate(0, ${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w}
          scale={yScale}
          ticks={yTicks}
          hideLines="true"
        />
      </g>
      <g transform={`translate(${margins.left}, 0)`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
        />
        {#each data as country}
          <line
            x1={xScale('2000')}
            x2={xScale('2022')}
            y1={yScale(country.X2000)}
            y2={yScale(country.X2022)}
            stroke-width={currentCountry || selectedCountry || $referenceCountry
              ? country.iso3c == currentCountry || country.iso3c == selectedCountry || country.iso3c == $referenceCountry
                ? 4
                : 1
              : 2}
            stroke={$referenceCountry === country.iso3c ? Colors.ColorReferenceCountry : colorScale[country.region_iso3c]}
            opacity={currentCountry || selectedCountry || $referenceCountry
              ? country.iso3c == currentCountry || country.iso3c == selectedCountry || country.iso3c == $referenceCountry
                ? 1
                : $referenceCountry && !selectedCountry && !currentCountry
                ? 1
                : 0.3
              : 0.5}
            class="slope"
            on:mouseover={() => (currentCountry = country.iso3c)}
            on:mouseout={() => (currentCountry = null)}
            on:focus={() => (currentCountry = country.iso3c)}
            on:blur={() => (currentCountry = null)}
            on:click={() => (selectedCountry = country.iso3c)}
          />
        {/each}
        {#if currentCountryData}
          <text
            class={`caps country-label ${currentCountryData.region_iso3c}`}
            x={xScale('2000') + (xScale('2022') - xScale('2000')) / 2}
            y={yScale(currentCountryData.X2000) + (yScale(currentCountryData.X2022) - yScale(currentCountryData.X2000)) / 2 + 6}
            text-anchor="middle"
            fill={colorScale[currentCountryData.region_iso3c]}>{$_(`country.${currentCountryData.iso3c.toLowerCase()}`)}</text
          >
          <text
            class={`small number ${currentCountryData.region_iso3c}`}
            x={xScale('2000') - 2}
            y={yScale(currentCountryData.X2000) + 6}
            text-anchor={'end'}
            ><Number value={currentCountryData.X2000} digits="2" />
          </text>
          <text
            class={`small number ${currentCountryData.region_iso3c}`}
            x={xScale('2022')}
            y={yScale(currentCountryData.X2022) + 6}
            text-anchor={'start' + 2}
            ><Number value={currentCountryData.X2022} digits="2" />
          </text>
        {/if}
        {#if selectedCountryData}
          <text
            class={`caps country-label ${selectedCountryData.region_iso3c}`}
            x={xScale('2000') + (xScale('2022') - xScale('2000')) / 2}
            y={yScale(selectedCountryData.X2000) + (yScale(selectedCountryData.X2022) - yScale(selectedCountryData.X2000)) / 2 + 6}
            text-anchor="middle"
            fill={colorScale[selectedCountryData.region_iso3c]}>{$_(`country.${selectedCountryData.iso3c.toLowerCase()}`)}</text
          >
          <text
            class={`small number ${selectedCountryData.region_iso3c}`}
            x={xScale('2000') - 2}
            y={yScale(selectedCountryData.X2000) + 6}
            text-anchor={'end'}
            ><Number value={selectedCountryData.X2000} digits="2" />
          </text>
          <text
            class={`small number ${selectedCountryData.region_iso3c}`}
            x={xScale('2022') + 2}
            y={yScale(selectedCountryData.X2022) + 6}
            text-anchor={'start'}
            ><Number value={selectedCountryData.X2022} digits="2" />
          </text>
        {/if}
        {#if referenceCountryData}
          <text
            class={`caps country-label reference-label`}
            x={xScale('2000') + (xScale('2022') - xScale('2000')) / 2}
            y={yScale(referenceCountryData.X2000) + (yScale(referenceCountryData.X2022) - yScale(referenceCountryData.X2000)) / 2 + 6}
            text-anchor="middle"
            fill={colorScale[referenceCountryData.region_iso3c]}>{$_(`country.${referenceCountryData.iso3c.toLowerCase()}`)}</text
          >
          <text class={`small number reference-label`} x={xScale('2000') - 2} y={yScale(referenceCountryData.X2000) + 6} text-anchor={'end'}
            ><Number value={referenceCountryData.X2000} digits="2" />
          </text>
          <text
            class={`small number reference-label`}
            x={xScale('2022') + 2}
            y={yScale(referenceCountryData.X2022) + 6}
            text-anchor={'start'}
            ><Number value={referenceCountryData.X2022} digits="2" />
          </text>
        {/if}
      </g>
    </svg>
  {/if}
</div>

<style>
  line {
    transition: opacity 0.15s, stroke-width 0.15s;
  }
  .slope {
    outline: none;
  }
  .slope:focus {
    stroke-width: 4px;
  }
  .country-label {
    pointer-events: none;
  }
  .SSF {
    fill: var(--color-vis-region-SSF);
  }
  .MEA {
    fill: var(--color-vis-region-MEA);
  }
  .ECS {
    fill: var(--color-vis-region-ECS);
  }
  .SAS {
    fill: var(--color-vis-region-SAS);
  }
  .EAS {
    fill: var(--color-vis-region-EAS);
  }
  .NAC {
    fill: var(--color-vis-region-NAC);
  }
  .LCN {
    fill: var(--color-vis-region-LCN);
  }
</style>
