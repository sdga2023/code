<script>
  import { chordDirected, arc, ribbonArrow, ascending } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import { browser } from '$app/environment';

  export let data;
  export let parentWidth;
  export let eu;
  export let other;

  let height;

  $: height = browser ? Math.min(parentWidth, Math.min(window.innerHeight - 100, 800)) : 800;

  const outerRingWidth = 20;
  const margin = 20;
  $: radius = height / 2 - outerRingWidth - margin;

  const colorScale = {
    EU: Colors.ColorVisRegionECS,
    JPN: Colors.ColorVisRegionEAS,
    KOR: Colors.ColorBaseOrange500,
    USA: Colors.ColorVisRegionNAC
  };

  $: matrixData = data.map((row) => {
    let rowData = [];
    Object.keys(row).forEach((d) => {
      if (d != 'origin') {
        rowData.push(row[d]);
      }
    });
    return rowData;
  });
  $: geos = data.map((d) => d.origin);

  $: vehiclesChord = matrixData
    ? chordDirected()
        .padAngle(0)
        .sortSubgroups(ascending)(matrixData)
        .sort((a, b) => {
          return a.source.value - b.source.value;
        })
    : [];

  const originLabels = ['EU', 'JPN', 'KOR', 'USA'];
  const countryLabels = ['NGA', 'other', 'UKR', 'KEN', 'BEN', 'MMR', 'MNG', 'TZA', 'GHA', 'KHM', 'PAK'];
  $: originLabelsIndices = originLabels.map((d) => geos.indexOf(d));
  $: countryLabelsIndices = countryLabels.map((d) => geos.indexOf(d));

  let currentCountryData;
  let currentRibbonData;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
</script>

{#if vehiclesChord.length > 0 && parentWidth}
  <svg width={parentWidth} {height} on:mousemove={updateMouse}>
    <g transform={`translate(${parentWidth / 2}, ${height / 2})`}>
      {#each vehiclesChord as chord}
        <path
          class="ribbon"
          d={ribbonArrow().radius(radius)(chord)}
          fill={colorScale[geos[chord.source.index]]}
          stroke={'white'}
          stroke-width={0.5}
          opacity={currentCountryData && (currentCountryData.index == chord.target.index || currentCountryData.index == chord.source.index)
            ? 1
            : !currentCountryData
            ? 0.6
            : 0.1}
          on:mouseover={() => (currentRibbonData = chord)}
          on:mouseout={() => (currentRibbonData = null)}
          on:focus={() => (currentRibbonData = chord)}
          on:blur={() => (currentRibbonData = null)}
        />
      {/each}
      <!-- arcs -->
      {#each vehiclesChord.groups as group}
        <path
          d={arc()
            .innerRadius(radius)
            .outerRadius(radius + outerRingWidth)(group)}
          fill={colorScale[geos[group.index]] ? colorScale[geos[group.index]] : Colors.ColorGrey200}
          stroke={'white'}
          stroke-width={1}
          on:mouseover={() => (currentCountryData = group)}
          on:mouseout={() => (currentCountryData = null)}
          on:focus={() => (currentCountryData = group)}
          on:blur={() => (currentCountryData = null)}
        />
      {/each}

      {#if currentCountryData}
        <path
          class="arc-outline"
          d={arc()
            .innerRadius(radius)
            .outerRadius(radius + outerRingWidth)(currentCountryData)}
          fill={'none'}
          stroke={'black'}
          stroke-width={2}
        />
      {/if}
      {#if currentRibbonData}
        <path
          class="ribbon-outline"
          d={ribbonArrow().radius(radius)(currentRibbonData)}
          stroke={'black'}
          stroke-width={2}
          fill={colorScale[geos[currentRibbonData.source.index]]}
        />
      {/if}

      <!-- labels -->
      {#each vehiclesChord.groups as group}
        {#if originLabelsIndices.includes(group.index)}
          <text
            class="label geo"
            x={arc()
              .innerRadius(radius)
              .outerRadius(radius + outerRingWidth)
              .centroid(group)[0]}
            y={arc()
              .innerRadius(radius)
              .outerRadius(radius + outerRingWidth)
              .centroid(group)[1] + 4}
            text-anchor={'middle'}>{geos[group.index] == 'EU' ? eu : $_(`country.${geos[group.index].toLowerCase()}`)}</text
          >
        {/if}
        {#if countryLabelsIndices.includes(group.index)}
          <text
            class="label small"
            x={arc()
              .innerRadius(radius)
              .outerRadius(radius + outerRingWidth)
              .centroid(group)[0]}
            y={arc()
              .innerRadius(radius)
              .outerRadius(radius + outerRingWidth)
              .centroid(group)[1] + 4}
            text-anchor={'middle'}>{geos[group.index] == 'other' ? other : $_(`country.${geos[group.index].toLowerCase()}`)}</text
          >
        {/if}
      {/each}
    </g>
  </svg>
{/if}
{#if currentCountryData && mousePos}
  <Tooltip visible={true} targetPos={mousePos}>
    <p class="label caps">
      {geos[currentCountryData.index] == 'EU'
        ? eu
        : geos[currentCountryData.index] == 'other'
        ? other
        : $_(`country.${geos[currentCountryData.index].toLowerCase()}`)}
    </p>
    <p class="label stronger"><Number value={currentCountryData.value} digits={0} /></p>
    <p class="label small weaker">
      {['KOR', 'USA', 'EU', 'JPN'].includes(geos[currentCountryData.index]) ? 'Exported vehicles' : 'Imported vehicles'}
    </p>
  </Tooltip>
{/if}
{#if currentRibbonData && mousePos}
  <Tooltip visible={true} targetPos={mousePos}>
    <p class="label caps">
      From
      {geos[currentRibbonData.source.index] == 'EU'
        ? eu
        : geos[currentRibbonData.source.index] == 'other'
        ? other
        : $_(`country.${geos[currentRibbonData.source.index].toLowerCase()}`)} to {geos[currentRibbonData.target.index] == 'EU'
        ? eu
        : geos[currentRibbonData.target.index] == 'other'
        ? other
        : $_(`country.${geos[currentRibbonData.target.index].toLowerCase()}`)}
    </p>
    <p class="label stronger"><Number value={currentRibbonData.source.value} digits={0} /></p>
    <p class="label small weaker">
      {'Used vehicles'}
    </p>
  </Tooltip>
{/if}

<style>
  .ribbon {
    transition: opacity 0.25s;
  }
  text.label,
  .arc-outline,
  .ribbon-outline {
    pointer-events: none;
  }
</style>
