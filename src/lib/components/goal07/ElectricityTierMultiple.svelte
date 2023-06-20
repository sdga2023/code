<script>
  import { scaleLinear } from 'd3-scale';
  import Number from './../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import * as Colors from '$lib/styles/tokens.es6';
  import Tooltip from './../general/Tooltip.svelte';

  export let data;
  export let country;
  export let urban;
  export let rural;
  export let height;
  export let showLabels;
  export let tier;
  export let tooltiprural;
  export let tooltipurban;

  $: countryTiers = data.filter((d) => d.iso3c == country);

  let margins = {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2
  };

  let w;
  let h = height;

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([0, w - margins.left - margins.right]);

  let hoverData;

  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  let labelX = 10;
</script>

<div bind:clientWidth={w}>
  {#if w}
    <p class="label caps title centered">{$_(`country.${country.toLowerCase()}`)}</p>
    <svg width={w} height={h} on:mousemove={updateMouse}>
      <defs>
        <marker id="arrowhead-down" markerWidth="10" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={Colors.ColorThemeDarkText} />
        </marker>
        <marker id="arrowhead-up" markerWidth="7" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="7 0, 0 3.5, 7 7" fill={Colors.ColorThemeDarkText} />
        </marker>
      </defs>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#each countryTiers as tier, i}
          <rect
            x={xScale(tier.cumperc)}
            y={tier.rururb == 'rural' ? 0 : ((h - margins.top - margins.bottom) * tier.poprural) / 100}
            width={xScale(tier.percent)}
            height={tier.rururb == 'rural'
              ? ((h - margins.top - margins.bottom) * tier.poprural) / 100
              : ((h - margins.top - margins.bottom) * tier.popurban) / 100}
            fill={tier.rururb == 'rural' ? Colors['ColorBaseGreen' + (7 - i) * 100] : Colors['ColorBasePurple' + (13 - i) * 100]}
            stroke={Colors.ColorThemeBgWeakest}
            stroke-width={1}
            on:mouseover={() => (hoverData = tier)}
            on:mouseout={() => (hoverData = null)}
            on:focus={() => (hoverData = tier)}
            on:blur={() => (hoverData = null)}
          />
        {/each}

        {#each countryTiers as tier, i}
          {#if showLabels && tier.rururb == 'rural' && i == 0}
            <line
              x1={labelX}
              x2={labelX}
              y1={0}
              y2={((h - margins.top - margins.bottom) * tier.poprural) / 100}
              stroke={Colors.ColorThemeDarkText}
              stroke-width={1.5}
              marker-start={'url(#arrowhead-up)'}
              marker-end={'url(#arrowhead-down)'}
            />
            <text class="small data-label start" x={labelX + 6} y={((h - margins.top - margins.bottom) * tier.poprural) / 100 / 2 + 6}
              >{rural}</text
            >
          {/if}
          {#if showLabels && tier.rururb == 'urban' && i == 6}
            <line
              x1={labelX}
              x2={labelX}
              y1={((h - margins.top - margins.bottom) * tier.poprural) / 100}
              y2={h - margins.top - margins.bottom}
              stroke={Colors.ColorThemeDarkText}
              stroke-width={1.5}
              marker-start={'url(#arrowhead-up)'}
              marker-end={'url(#arrowhead-down)'}
            />
            <text
              class="small data-label start"
              x={labelX + 6}
              y={h - margins.top - margins.bottom - ((h - margins.top - margins.bottom) * tier.popurban) / 100 / 2 + 6}>{urban}</text
            >
          {/if}
        {/each}

        {#if hoverData}
          <rect
            class="hover-outline"
            x={xScale(hoverData.cumperc)}
            y={hoverData.rururb == 'rural' ? 0 : ((h - margins.top - margins.bottom) * hoverData.poprural) / 100}
            width={xScale(hoverData.percent)}
            height={hoverData.rururb == 'rural'
              ? ((h - margins.top - margins.bottom) * hoverData.poprural) / 100
              : ((h - margins.top - margins.bottom) * hoverData.popurban) / 100}
            fill={'none'}
            stroke={Colors.ColorThemeText}
            stroke-width={2}
          />
        {/if}

        {#if showLabels}
          <!--text class="small data-label" x={labelX + 6} y={h / 2 - 20} text-anchor="start">{rural}</text>
          <text class="small data-label" x={labelX + 6} y={h - 20} text-anchor="start">{urban}</text-->
        {/if}
      </g>
    </svg>
    {#if hoverData && mousePos}
      <Tooltip visible={true} targetPos={mousePos}>
        <p>
          <span class="label caps stronger">{tier + ' ' + hoverData.tier.slice(-1)}</span>
        </p>
        <p class="label">
          <Number value={hoverData.percent + '%'} digits={1} />
        </p>
        <p class="label small weaker">{hoverData.rururb == 'rural' ? tooltiprural : tooltipurban}</p>
      </Tooltip>
    {/if}
  {/if}
</div>

<style>
  .data-label {
    fill: var(--color-theme-dark-text);
    stroke: var(--color-theme-dark-bg) !important;
    stroke-width: 6px;
  }
  .hover-outline,
  text {
    pointer-events: none;
  }
</style>
