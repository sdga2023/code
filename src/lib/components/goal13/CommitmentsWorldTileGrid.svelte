<script>
  import { scaleLinear } from 'd3-scale';
  import { grid } from './../../../data/worldtilegrid.js';
  import { max, extent } from 'd3-array';
  import { _ } from 'svelte-i18n';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import Minimap from '../general/Minimap.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let parentWidth;
  export let policy;
  export let pledge;
  export let law;
  export let notsubmitted;

  let margins = {
    top: 5,
    right: 10,
    bottom: 0,
    left: 10
  };

  const colorScale = [
    { key: 'In Policy Document', color: Colors.ColorBaseRed400, label: policy },
    { key: 'In Political Pledge', color: Colors.ColorBaseGreen400, label: pledge },
    { key: 'In Law', color: Colors.ColorBaseBlue400, label: law },
    { key: 'No document submitted', color: Colors.ColorGrey400, label: notsubmitted }
  ];

  let breakpoint = 1000;
  $: w = parentWidth < breakpoint ? 1500 : parentWidth;
  let h = 800;

  $: aspectRatio = w / h;
  $: visiblePartW = parentWidth;

  let minimapH = 50;
  $: minimapW = minimapH * aspectRatio;
  $: minimapInsetW = (minimapW * visiblePartW) / h;

  // Initially, center the visible part
  let minimapInsetX = minimapW / 2 - minimapInsetW / 2;
  let visiblePartX = (minimapInsetX * w) / minimapW;

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

  let currentCountry;

  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
</script>

<div>
  {#if w}
    <CategoricalLegend
      top={true}
      legendType={'custom'}
      customItems={colorScale.map((d) => {
        return { key: d.key, colour: d.color };
      })}
    />
    <svg width={w} height={h} on:mousemove={updateMouse} viewBox={`${w / 2 + visiblePartX - visiblePartW / 2} 0 ${visiblePartW} ${h}`}>
      {#if data && data.length > 0}
        <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
          {#each grid as tile}
            <g transform={'translate(' + xScale(tile.x) + ',' + yScale(tile.y) + ')'} opacity={1} class="tile">
              <!--
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
                -->
              <rect
                x={0}
                y={0}
                width={tileWidth}
                height={tileHeight}
                fill={data.find((ctr) => ctr.iso3c == tile.iso3c)
                  ? colorScale.find((d) => d.key == data.find((ctr) => ctr.iso3c == tile.iso3c).status).color
                  : 'grey'}
                title={tile.iso3c}
                opacity={1}
                stroke={tile.iso3c == $referenceCountry ? '#ffffff' : 'none'}
                stroke-width={tile.iso3c == $referenceCountry ? 2 : 0}
              />
              {#if $referenceCountry && tile.iso3c == $referenceCountry}
                <text x={tileWidth / 2} y={-6} class={'label small reference-label'} text-anchor="middle"
                  >{$_(`country.${tile.iso3c.toLowerCase()}`)}</text
                >
              {:else}
                <text x={tileWidth / 2} y={tileHeight / 2 + 4} class={'countrycode small weaker '} style:text-anchor="middle"
                  >{tile.iso3c}</text
                >
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
        {#each grid as tile}
          <g transform={`translate(${(xScale(tile.x) * minimapW) / w}, ${(yScale(tile.y) * minimapW) / w})`} class="tile">
            <rect x={0} y={0} width={(tileWidth * minimapW) / w} height={(tileHeight * minimapW) / w} fill={Colors.ColorGrey300} />
          </g>
        {/each}
      </Minimap>
    {/if}
  {/if}
  {#if currentCountry && mousePos}
    <Tooltip visible={true} targetPos={mousePos}>
      <p class="label caps">{$_(`country.${currentCountry.toLowerCase()}`)}</p>
      {#if data.find((ctr) => ctr.iso3c == currentCountry)}
        <p class="label stronger">{data.find((ctr) => ctr.iso3c == currentCountry).status}</p>
      {:else}
        <p class="label small">No data</p>
      {/if}
    </Tooltip>
  {/if}
</div>

<style>
  .countrycode {
    text-anchor: start;
    font-size: 0.7em;
    stroke-width: 1px;
  }
  .tile {
    transition: opacity 0.5s;
    pointer-events: all;
  }
</style>
