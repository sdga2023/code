<script>
  import { scaleLinear } from 'd3-scale';
  import { grid } from './../../../data/worldtilegrid.js';
  import { max, extent } from 'd3-array';
  import DifferenceChartSmallMult from './DifferenceChartSmallMult.svelte';
  import { _ } from 'svelte-i18n';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import Minimap from '../general/Minimap.svelte';

  export let data;
  export let change;
  export let absolutedifference;
  export let parentWidth;

  $: outliers = grid.filter((d) => ['GUY', 'LBY', 'LBN', 'UKR', 'SUR'].includes(d.iso3c));
  $: nonoutliers = grid.filter((d) => !['GUY', 'LBY', 'LBN', 'UKR', 'SUR'].includes(d.iso3c));
  $: sortedGrid = nonoutliers.concat(outliers);
  $: if ($referenceCountry) {
    let refCountryData = sortedGrid.filter((d) => d.iso3c == $referenceCountry);
    let sortedGridWithoutRef = sortedGrid.filter((d) => d.iso3c != $referenceCountry);
    sortedGrid = sortedGridWithoutRef.concat(refCountryData);
  }

  let margins = {
    top: 5,
    right: 10,
    bottom: 0,
    left: 10
  };

  let breakpoint = 1000;
  $: w = parentWidth < breakpoint ? 1500 : parentWidth;
  let h = 800;

  $: aspectRatio = w / h;
  $: visiblePartW = parentWidth;

  let minimapH = 50;
  $: minimapW = minimapH * aspectRatio;
  $: minimapInsetW = (minimapW * visiblePartW) / h;

  // Initially, center the visible part
  $: minimapInsetX = minimapW / 2 - minimapInsetW / 2;
  $: visiblePartX = (minimapInsetX * w) / minimapW;

  let tilepadding = 2;

  // Scales for tile grid
  $: xScale = scaleLinear()
    .domain([1, max(grid, (d) => d.x) + 1])
    .range([0, w - margins.left - margins.right]);
  $: tileWidth = xScale(2) - xScale(1) - tilepadding;
  $: yScale = scaleLinear()
    .domain([1, max(grid, (d) => d.y) + 1])
    .range([0, h - margins.top - margins.bottom]);
  $: tileHeight = yScale(2) - yScale(1) - tilepadding;

  // Scales for small multiples
  $: xScaleMult = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, tileWidth - tilepadding]);
  $: yScaleMult = scaleLinear().domain([90, 130]).range([tileHeight, 0]);

  let currentCountry;

  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
  $: relDifference =
    currentCountry && data.find((d) => d.iso3c == currentCountry && d.year == 2022)
      ? data.find((d) => d.iso3c == currentCountry && d.year == 2022).gap_relative
      : null;
  $: absDifference =
    currentCountry && data.find((d) => d.iso3c == currentCountry && d.year == 2022)
      ? data.find((d) => d.iso3c == currentCountry && d.year == 2022).gap_dollars
      : null;
</script>

<div>
  {#if w}
    <svg width={w} height={h} on:mousemove={updateMouse} viewBox={`${parentWidth < breakpoint ? w / 2 + visiblePartX - visiblePartW / 2 : 0} 0 ${visiblePartW} ${h}`}>
      {#if data && data.length > 0}
        <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
          {#each sortedGrid as tile}
            <g transform={'translate(' + xScale(tile.x) + ',' + yScale(tile.y) + ')'} opacity={1} class="tile">
              {#if $referenceCountry && tile.iso3c == $referenceCountry}
                <rect
                  x={0}
                  y={0}
                  width={tileWidth}
                  height={tileHeight}
                  fill={'none'}
                  opacity={1}
                  stroke={Colors.ColorReferenceCountry}
                  stroke-width={6}
                />
              {/if}
              <rect
                x={0}
                y={0}
                width={tileWidth}
                height={tileHeight}
                fill={Colors.ColorGrey100}
                title={tile.iso3c}
                opacity={1}
                stroke={tile.iso3c == $referenceCountry ? '#ffffff' : 'none'}
                stroke-width={tile.iso3c == $referenceCountry ? 2 : 0}
              />
              <DifferenceChartSmallMult data={data.filter((d) => d.iso3c == tile.iso3c)} xScale={xScaleMult} yScale={yScaleMult} />
              {#if $referenceCountry && tile.iso3c == $referenceCountry}
                <text x={tileWidth / 2} y={-6} class={'small reference-label middle'} text-anchor="middle"
                  >{$_(`country.${tile.iso3c.toLowerCase()}`)}</text
                >
              {:else}
                <text x={0} y={11} class={'geo small start'}>{tile.iso3c}</text>
              {/if}
              <rect
                x={0}
                y={0}
                width={tileWidth}
                height={tileHeight}
                fill={'none'}
                opacity={1}
                on:mouseover={() => (currentCountry = tile.iso3c)}
                on:mouseout={() => (currentCountry = null)}
                on:focus={() => (currentCountry = tile.iso3c)}
                on:blur={() => (currentCountry = null)}
              />
            </g>
          {/each}
        </g>
      {/if}
    </svg>

    {#if parentWidth < breakpoint}
      <Minimap
        minimapH={50}
        minimapW={minimapH * aspectRatio}
        visiblePartShare={visiblePartW / w}
        widthRatio={w / minimapW}
        bind:visiblePartX
      >
        {#each sortedGrid as tile}
          <g transform={`translate(${(xScale(tile.x) * minimapW) / w}, ${(yScale(tile.y) * minimapW) / w})`} class="tile">
            <rect x={0} y={0} width={(tileWidth * minimapW) / w} height={(tileHeight * minimapW) / w} fill={Colors.ColorGrey300} />
          </g>
        {/each}
      </Minimap>
    {/if}
  {/if}
  {#if currentCountry && mousePos}
    <Tooltip visible={true} targetPos={mousePos}>
      <p class="label caps">{$_(`country.${currentCountry.toLowerCase()}`) + ', 2022'}</p>
      {#if relDifference && absDifference}
        <p class="label stronger"><Number value={relDifference + '%'} digits={1} /></p>
        <p class="label small weaker">{change}</p>
        <hr />
        <p class="label stronger"><Number value={absDifference / 1000000000} digits={2} /></p>
        <p class="label small weaker">{absolutedifference}</p>
      {:else}
        <p class="label small">No data</p>
      {/if}
    </Tooltip>
  {/if}
</div>

<style>
  .tile {
    transition: opacity 0.5s;
    pointer-events: all;
  }
</style>
