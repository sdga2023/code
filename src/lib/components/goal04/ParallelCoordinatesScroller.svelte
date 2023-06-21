<script>
  import { scaleLinear, scaleLog, scalePoint } from 'd3-scale';
  import { line, curveBumpX } from 'd3-shape';
  import { extent, max, min } from 'd3-array';
  import { fade } from 'svelte/transition';
  import { getIncomeLevel } from './../../../data/countryRegionIncomeDictionary';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let parentHeight;
  export let parentWidth;
  export let activeScene;

  export let income;
  export let learningpoverty;
  export let instructiondayslost;
  export let internetusers;
  export let higherincome;
  export let lowerincome;
  export let morelearningpoverty;
  export let lesslearningpoverty;
  export let longerclosure;
  export let shorterclosure;
  export let moreinternetusers;
  export let lessinternetusers;

  let margins = {
    top: 10,
    right: 10,
    bottom: 24,
    left: 10
  };

  $: w = parentWidth > 1000 ? 1000 : parentWidth;
  $: h = parentHeight > 600 ? 600 : parentHeight;
  $: mobile = parentWidth < 600;

  const dimensions = [
    { key: 'gni_per_capita', labelhigh: higherincome, labellow: lowerincome },
    { key: 'learning_poverty', labelhigh: morelearningpoverty, labellow: lesslearningpoverty },
    { key: 'unicef_total_closed', labelhigh: longerclosure, labellow: shorterclosure },
    { key: 'internet_users', labelhigh: moreinternetusers, labellow: lessinternetusers }
  ];
  $: xScale = scalePoint()
    .domain(dimensions.map((d) => d.key))
    .range([0, w - margins.left - margins.right])
    .padding(0);
  $: yScales = {
    gni_per_capita: scaleLog()
      .domain(extent(data, (d) => d.gni_per_capita))
      .range([h - margins.top - margins.bottom, 0]),
    learning_poverty: scaleLinear()
      .domain(extent(data, (d) => d.learning_poverty))
      .range([0, h - margins.top - margins.bottom]),
    unicef_total_closed: scaleLinear()
      .domain(extent(data, (d) => d.unicef_total_closed))
      .range([0, h - margins.top - margins.bottom]),
    internet_users: scaleLinear()
      .domain(extent(data, (d) => d.internet_users))
      .range([h - margins.top - margins.bottom, 0])
  };

  let colourScale = {
    HIC: Colors.ColorVisIncomeHigh,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    LIC: Colors.ColorVisIncomeLow
  };

  $: coordsDataHigh = data.map((d) => {
    let coords = [];
    if (['HIC'].includes(getIncomeLevel(d.iso3c))) {
      dimensions.forEach((dim, i) => {
        if (i == 0) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 0 && i == 1) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 1 && i == 2) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 2 && i == 3) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
      });
    }
    return { ...d, coords: coords };
  });

  $: coordsDataLow = data.map((d) => {
    let coords = [];
    if (['LIC'].includes(getIncomeLevel(d.iso3c))) {
      dimensions.forEach((dim, i) => {
        if (activeScene.index > 2 && i == 0) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 3 && i == 1) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 4 && i == 2) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 5 && i == 3) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
      });
    }
    return { ...d, coords: coords };
  });

  $: coordsDataMiddle = data.map((d) => {
    let coords = [];
    if (['LMC', 'UMC'].includes(getIncomeLevel(d.iso3c))) {
      dimensions.forEach((dim, i) => {
        if (activeScene.index > 2 && i == 0) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 3 && i == 1) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 4 && i == 2) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 5 && i == 3) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
      });
    }
    return { ...d, coords: coords };
  });

  $: coordsDataReference = data
    .filter((d) => d.iso3c == $referenceCountry)
    .map((d) => {
      let coords = [];
      dimensions.forEach((dim, i) => {
        if (i == 0) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 0 && i == 1) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 1 && i == 2) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 2 && i == 3) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
      });
      return { ...d, coords: coords };
    });

  $: coordsDataHover = data
    .filter((d) => d.iso3c == hoveredCountry)
    .map((d) => {
      let coords = [];
      dimensions.forEach((dim, i) => {
        if (i == 0) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 0 && i == 1) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 1 && i == 2) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
        if (activeScene.index > 2 && i == 3) {
          coords.push([xScale(dim.key), yScales[dim.key](d[dim.key])]);
        }
      });
      return { ...d, coords: coords };
    });

  let hoveredCountry;
  $: hoveredCountryData = hoveredCountry ? data.find((d) => d.iso3c == hoveredCountry) : null;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  const circleRadius = 4;
  const highlightCircleRadius = 7;
</script>

{#if w}
  <div class="svg-container" bind:clientHeight={h} bind:clientWidth={w}>
    <svg width={w} height={h} on:mousemove={updateMouse}>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        {#if xScale && yScales}
          {#if activeScene.id == 'explore'}
            {#each coordsDataMiddle as country}
              <path
                class="no-pointer-events"
                d={line().curve(curveBumpX)(country.coords)}
                fill={'none'}
                stroke-width={country.iso3c == hoveredCountry ? 3 : 1}
                stroke={colourScale[getIncomeLevel(country.iso3c)]}
                transition:fade|local
                style:opacity={1}
              />
            {/each}
          {/if}

          {#each coordsDataHigh as country}
            <path
              class="no-pointer-events"
              d={line().curve(curveBumpX)(country.coords)}
              fill={'none'}
              stroke-width={country.iso3c == hoveredCountry ? 3 : 1}
              stroke={colourScale[getIncomeLevel(country.iso3c)]}
              transition:fade|local
              style:opacity={activeScene.index < 4 || activeScene.id == 'explore' ? 1 : 0.1}
            />
          {/each}

          {#each coordsDataLow as country}
            <path
              class="no-pointer-events"
              d={line().curve(curveBumpX)(country.coords)}
              fill={'none'}
              stroke-width={country.iso3c == hoveredCountry ? 3 : 1}
              stroke={colourScale[getIncomeLevel(country.iso3c)]}
              transition:fade|local
              style:opacity={activeScene.index > 3 || activeScene.id == 'explore' ? 1 : 0}
            />
          {/each}

          {#each coordsDataHigh as country}
            <circle
              cx={xScale('gni_per_capita')}
              cy={yScales['gni_per_capita'](country.gni_per_capita)}
              r={circleRadius}
              transition:fade|local
              fill={colourScale[getIncomeLevel(country.iso3c)]}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
                on:focus={() => (hoveredCountry = country.iso3c)}
                on:mouseleave={() => (hoveredCountry = null)}
                on:blur={() => (hoveredCountry = null)}
            />

            {#if activeScene.index > 0}
              <circle
                cx={xScale('learning_poverty')}
                cy={yScales['learning_poverty'](country.learning_poverty)}
                r={circleRadius}
                transition:fade|local
                fill={colourScale[getIncomeLevel(country.iso3c)]}
                on:mouseover={() => (hoveredCountry = country.iso3c)}
                on:focus={() => (hoveredCountry = country.iso3c)}
                on:mouseleave={() => (hoveredCountry = null)}
                on:blur={() => (hoveredCountry = null)}
              />
            {/if}

            {#if activeScene.index > 1}
              <circle
                cx={xScale('unicef_total_closed')}
                cy={yScales['unicef_total_closed'](country.unicef_total_closed)}
                r={circleRadius}
                transition:fade|local
                fill={colourScale[getIncomeLevel(country.iso3c)]}
                on:mouseover={() => (hoveredCountry = country.iso3c)}
                on:focus={() => (hoveredCountry = country.iso3c)}
                on:mouseleave={() => (hoveredCountry = null)}
                on:blur={() => (hoveredCountry = null)}
              />
            {/if}

            {#if activeScene.index > 2}
              <circle
                cx={xScale('internet_users')}
                cy={yScales['internet_users'](country.internet_users)}
                r={circleRadius}
                transition:fade|local
                fill={colourScale[getIncomeLevel(country.iso3c)]}
                on:mouseover={() => (hoveredCountry = country.iso3c)}
                on:focus={() => (hoveredCountry = country.iso3c)}
                on:mouseleave={() => (hoveredCountry = null)}
                on:blur={() => (hoveredCountry = null)}
              />
            {/if}
          {/each}
        {/if}

        <!-- Hovered country -->
        {#each coordsDataHover as country}
          <path class="no-pointer-events" d={line().curve(curveBumpX)(country.coords)} fill={'none'} stroke-width={6} stroke={'white'} />
          <path
            class="no-pointer-events"
            d={line().curve(curveBumpX)(country.coords)}
            fill={'none'}
            stroke-width={3}
            stroke={colourScale[getIncomeLevel(country.iso3c)]}
          /><circle
            class={'no-pointer-events'}
            cx={xScale('gni_per_capita')}
            cy={yScales['gni_per_capita'](country.gni_per_capita)}
            r={highlightCircleRadius}
            fill={Colors.grey700}
            on:mouseover={() => (hoveredCountry = country.iso3c)}
            on:focus={() => (hoveredCountry = country.iso3c)}
            on:mouseleave={() => (hoveredCountry = null)}
            on:blur={() => (hoveredCountry = null)}
          />
          <circle
            class={'no-pointer-events'}
            cx={xScale('gni_per_capita')}
            cy={yScales['gni_per_capita'](country.gni_per_capita)}
            r={circleRadius}
            fill={colourScale[getIncomeLevel(country.iso3c)]}
            stroke={'white'}
            stroke-width={1}
            on:mouseover={() => (hoveredCountry = country.iso3c)}
            on:focus={() => (hoveredCountry = country.iso3c)}
            on:mouseleave={() => (hoveredCountry = null)}
            on:blur={() => (hoveredCountry = null)}
          />
          {#if activeScene.index > 0}
            <circle
              class={'no-pointer-events'}
              cx={xScale('learning_poverty')}
              cy={yScales['learning_poverty'](country.learning_poverty)}
              r={highlightCircleRadius}
              fill={Colors.grey700}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
            <circle
              class={'no-pointer-events'}
              cx={xScale('learning_poverty')}
              cy={yScales['learning_poverty'](country.learning_poverty)}
              r={circleRadius}
              fill={colourScale[getIncomeLevel(country.iso3c)]}
              stroke={'white'}
              stroke-width={1}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
          {/if}
          {#if activeScene.index > 1}
            <circle
              class={'no-pointer-events'}
              cx={xScale('unicef_total_closed')}
              cy={yScales['unicef_total_closed'](country.unicef_total_closed)}
              r={highlightCircleRadius}
              fill={Colors.grey700}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
            <circle
              class={'no-pointer-events'}
              cx={xScale('unicef_total_closed')}
              cy={yScales['unicef_total_closed'](country.unicef_total_closed)}
              r={circleRadius}
              fill={colourScale[getIncomeLevel(country.iso3c)]}
              stroke={'white'}
              stroke-width={1}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
          {/if}
          {#if activeScene.index > 2}
            <circle
              class={'no-pointer-events'}
              cx={xScale('internet_users')}
              cy={yScales['internet_users'](country.internet_users)}
              r={highlightCircleRadius}
              fill={Colors.grey700}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
            <circle
              class={'no-pointer-events'}
              cx={xScale('internet_users')}
              cy={yScales['internet_users'](country.internet_users)}
              r={circleRadius}
              fill={colourScale[getIncomeLevel(country.iso3c)]}
              stroke={'white'}
              stroke-width={1}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
          {/if}
        {/each}

        <!-- Reference country -->
        {#each coordsDataReference as country}
          <path d={line().curve(curveBumpX)(country.coords)} fill={'none'} stroke-width={6} stroke={'white'} transition:fade|local />
          <path
            d={line().curve(curveBumpX)(country.coords)}
            fill={'none'}
            stroke-width={3}
            stroke={Colors.ColorReferenceCountry}
            transition:fade|local
          />
          <circle
            cx={xScale('gni_per_capita')}
            cy={yScales['gni_per_capita'](country.gni_per_capita)}
            r={highlightCircleRadius}
            transition:fade|local
            fill={Colors.ColorReferenceCountry}
            on:mouseover={() => (hoveredCountry = country.iso3c)}
            on:focus={() => (hoveredCountry = country.iso3c)}
            on:mouseleave={() => (hoveredCountry = null)}
            on:blur={() => (hoveredCountry = null)}
          />
          <circle
            cx={xScale('gni_per_capita')}
            cy={yScales['gni_per_capita'](country.gni_per_capita)}
            r={circleRadius}
            transition:fade|local
            fill={colourScale[getIncomeLevel(country.iso3c)]}
            stroke={'white'}
            stroke-width={1}
            on:mouseover={() => (hoveredCountry = country.iso3c)}
            on:focus={() => (hoveredCountry = country.iso3c)}
            on:mouseleave={() => (hoveredCountry = null)}
            on:blur={() => (hoveredCountry = null)}
          />
          {#if activeScene.index > 0}
            <circle
              cx={xScale('learning_poverty')}
              cy={yScales['learning_poverty'](country.learning_poverty)}
              r={highlightCircleRadius}
              transition:fade|local
              fill={Colors.ColorReferenceCountry}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
            <circle
              cx={xScale('learning_poverty')}
              cy={yScales['learning_poverty'](country.learning_poverty)}
              r={circleRadius}
              transition:fade|local
              fill={colourScale[getIncomeLevel(country.iso3c)]}
              stroke={'white'}
              stroke-width={1}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
          {/if}
          {#if activeScene.index > 1}
            <circle
              cx={xScale('unicef_total_closed')}
              cy={yScales['unicef_total_closed'](country.unicef_total_closed)}
              r={highlightCircleRadius}
              transition:fade|local
              fill={Colors.ColorReferenceCountry}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
            <circle
              cx={xScale('unicef_total_closed')}
              cy={yScales['unicef_total_closed'](country.unicef_total_closed)}
              r={circleRadius}
              transition:fade|local
              fill={colourScale[getIncomeLevel(country.iso3c)]}
              stroke={'white'}
              stroke-width={1}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
          {/if}
          {#if activeScene.index > 2}
            <circle
              cx={xScale('internet_users')}
              cy={yScales['internet_users'](country.internet_users)}
              r={highlightCircleRadius}
              transition:fade|local
              fill={Colors.ColorReferenceCountry}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
            <circle
              cx={xScale('internet_users')}
              cy={yScales['internet_users'](country.internet_users)}
              r={circleRadius}
              transition:fade|local
              fill={colourScale[getIncomeLevel(country.iso3c)]}
              stroke={'white'}
              stroke-width={1}
              on:mouseover={() => (hoveredCountry = country.iso3c)}
              on:focus={() => (hoveredCountry = country.iso3c)}
              on:mouseleave={() => (hoveredCountry = null)}
              on:blur={() => (hoveredCountry = null)}
            />
          {/if}
        {/each}

        {#each dimensions as dim, i}
          {#if i < 3}
            <text
              class="small"
              x={xScale(dim.key) + 8}
              y={yScales[dim.key](max(data, (d) => d[dim.key])) + 8}
              transform={mobile
                ? ['learning_poverty', 'unicef_total_closed'].includes(dim.key)
                  ? `rotate(-90 ${xScale(dim.key) + 8} ${yScales[dim.key](max(data, (d) => d[dim.key]))})`
                  : `rotate(-90 ${xScale(dim.key) + 8} 0)`
                : ''}
              text-anchor={mobile ? (['learning_poverty', 'unicef_total_closed'].includes(dim.key) ? 'start' : 'end') : 'start'}
              opacity={activeScene.index > i - 1 ? 1 : 0}
            >
              {mobile
                ? ['learning_poverty', 'unicef_total_closed'].includes(dim.key)
                  ? '← ' + dim.labelhigh
                  : dim.labelhigh + ' →'
                : ['learning_poverty', 'unicef_total_closed'].includes(dim.key)
                ? '↓ ' + dim.labelhigh
                : '↑ ' + dim.labelhigh}
            </text>
            <text
              class="small"
              x={mobile ? xScale(dim.key) + 18 : xScale(dim.key) + 8}
              y={yScales[dim.key](min(data, (d) => d[dim.key])) + 8}
              transform={mobile ? `rotate(-90 ${xScale(dim.key) + 18} ${yScales[dim.key](min(data, (d) => d[dim.key])) + 4})` : ''}
              opacity={activeScene.index > i - 1 ? 1 : 0}
              text-anchor={mobile && ['learning_poverty', 'unicef_total_closed'].includes(dim.key) ? 'end' : 'start'}
            >
              {mobile
                ? ['learning_poverty', 'unicef_total_closed'].includes(dim.key)
                  ? dim.labellow + ' →'
                  : '← ' + dim.labellow
                : ['learning_poverty', 'unicef_total_closed'].includes(dim.key)
                ? '↑' + dim.labellow
                : '↓' + dim.labellow}
            </text>
          {:else}
            <text
              class="small"
              x={xScale(dim.key) - 8}
              y={mobile ? yScales[dim.key](max(data, (d) => d[dim.key])) + 4 : yScales[dim.key](max(data, (d) => d[dim.key])) + 22}
              opacity={activeScene.index > i - 1 ? 1 : 0}
              transform={mobile ? `rotate(-90 ${xScale(dim.key) - 8} ${yScales[dim.key](max(data, (d) => d[dim.key])) + 4})` : ''}
              text-anchor={'end'}>{mobile ? dim.labelhigh + ' →' : dim.labelhigh + ' ↑'}</text
            >
            <text
              class="small"
              x={xScale(dim.key) - 8}
              y={mobile ? yScales[dim.key](min(data, (d) => d[dim.key])) + 4 : yScales[dim.key](min(data, (d) => d[dim.key])) - 8}
              opacity={activeScene.index > i - 1 ? 1 : 0}
              transform={mobile ? `rotate(-90 ${xScale(dim.key) - 8} ${yScales[dim.key](min(data, (d) => d[dim.key])) + 4})` : ''}
              text-anchor={mobile ? 'start' : 'end'}>{mobile ? '← ' + dim.labellow : dim.labellow + '↓'}</text
            >
          {/if}
        {/each}
      </g>
    </svg>
  </div>
{/if}
{#if parentHeight > 700}
  <CategoricalLegend legendType="income" />
{/if}

{#if hoveredCountry && hoveredCountryData && mousePos}
  <Tooltip visible={true} targetPos={mousePos}>
    <p class="label caps">{$_(`country.${hoveredCountry.toLowerCase()}`)}</p>
    <p class="label stronger"><Number value={hoveredCountryData.gni_per_capita} digits={0} unit={'$'} /></p>
    <p class="label small weaker">{income}</p>
    {#if activeScene.index > 0}
      <hr />
      <p class="label stronger"><Number value={hoveredCountryData.learning_poverty} digits={1} unit={'%'} /></p>
      <p class="label small weaker">{learningpoverty}</p>
    {/if}
    {#if activeScene.index > 1}
      <hr />
      <p class="label stronger"><Number value={hoveredCountryData.unicef_total_closed} digits={0} /></p>
      <p class="label small weaker">{instructiondayslost}</p>
    {/if}
    {#if activeScene.index > 2}
      <hr />
      <p class="label stronger"><Number value={hoveredCountryData.internet_users} digits={1} unit={'%'} /></p>
      <p class="label small weaker">{internetusers}</p>
    {/if}
  </Tooltip>
{/if}

<style>
  circle {
    stroke: white;
    stroke-width: 1px;
    opacity: 1;
  }
  path {
    transition: opacity 0.5s, stroke-width 0.5s;
  }
  circle.no-pointer-events,
  path.no-pointer-events {
    pointer-events: none;
  }
  .svg-container {
    flex: 1;
    overflow: hidden;
    max-height: 800px;
  }
</style>
