<script>
    import { treemap, hierarchy, group } from 'd3';
    import * as Colors from '$lib/styles/tokens.es6.js';
    import Tooltip from '../general/Tooltip.svelte';
    import Number from '../general/Number.svelte';
    import CategoricalLegend from '$lib/components/general/CategoricalLegend.svelte';
    import { fade } from 'svelte/transition';
  
    export let data;
    export let share;
    export let units;
    export let parentHeight;
    export let parentWidth;
    export let activeScene;
  
    export let industrial;
    export let agriculture;
    export let waste;
    export let landuse;
    export let building;
    export let electricityheat;
    export let fugitive;
    export let manufacturing;
    export let other;
    export let transportation;
    export let bunker;
    export let CH4;
    export let CO2;
    export let othergas;
    export let energy;
    export let nonenergy;
  
    const colorScale = {
      Transportation: { color: Colors.ColorBaseYellow200, label: transportation },
      'Manufacturing/Construction': { color: Colors.ColorBaseYellow200, label: manufacturing },
      Building: { color: Colors.ColorBaseYellow200, label: building },
      'Electricity/Heat': { color: Colors.ColorBaseYellow200, label: electricityheat },
      'Other Fuel Combustion': { color: Colors.ColorBaseYellow200, label: other },
      'Fugitive Emissions': { color: Colors.ColorBaseYellow200, label: fugitive },
      'Industrial Processes': { color: Colors.ColorBaseTeal300, label: industrial },
      Agriculture: { color: Colors.ColorBaseTeal300, label: agriculture },
      'Land-Use Change and Forestry': { color: Colors.ColorBaseTeal300, label: landuse },
      Waste: { color: Colors.ColorBaseTeal300, label: waste },
      'Bunker Fuels': { color: Colors.ColorBaseTeal300, label: bunker},
      Other: { color: Colors.ColorGrey200, label: othergas }
    };
  
    const energyMap = {
      CH4: CH4,
      CO2: CO2,
      Other: othergas
    }
  
    let margins = {
      top: 10,
      right: 30,
      bottom: 10,
      left: 20
    };
  
    $: w = parentWidth;
    $: h = parentHeight - 32;
  
    $: hierarchyData = hierarchy(
      group(
        data,
        (d) => d.gas,
        (d) => d.sector,
        (d) => d.subsector
      )
    ).sum((d) => d.share);
    $: treemapData = treemap()
      .round(true)
      .size([w - margins.left - margins.right, h - margins.top - margins.bottom])(hierarchyData);
  
    let hoverData;
  
    let mousePos;
    function updateMouse(evt) {
      mousePos = { x: evt.clientX, y: evt.clientY };
    }
  </script>
  
  <CategoricalLegend legendType={'custom'} customItems={[{ key: energy, colour: Colors.ColorBaseYellow200 },
  { key: nonenergy, colour: Colors.ColorBaseTeal300 }]}></CategoricalLegend>
    <svg width={w} height={h} on:mousemove={updateMouse}>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#each treemapData.leaves() as box}
          <rect
            x={box.x0}
            y={box.y0}
            width={box.x1 - box.x0}
            height={box.y1 - box.y0}
            fill={colorScale[box.data.subsector].color}
            stroke="white"
            stroke-width={1}
            opacity={box.data.gas == "CO2" && activeScene.id == "co2"
            ? 1
            : box.data.gas == "CH4" && activeScene.id == "methane"
              ? 1
              : 0.1}
            on:mouseover={() => (hoverData = box)}
            on:mouseout={() => (hoverData = null)}
            on:focus={() => (hoverData = box)}
            on:blur={() => (hoverData = null)}
            transition:fade|local
          />
        {/each}
        {#each treemapData.descendants().filter((d) => d.depth == 1) as label}
            <rect
            class="gas-outline"
            x={label.x0}
            y={label.y0}
            width={label.x1 - label.x0}
            height={label.y1 - label.y0}
            fill={'none'}
            stroke="white"
            stroke-width={4}
            ></rect>
          <text
            class="caps"
            x={label.x0 + 4}
            y={label.y0 + 18}
            opacity={label.data[0] == "CO2" && activeScene.id == "co2"
          ? 1
          : label.data[0] == "CH4" && activeScene.id == "methane"
            ? 1
            : 0.1}>{energyMap[label.data[0]]}</text>
        {/each}
        {#each treemapData.descendants().filter((d) => d.depth == 3) as label}
        {#if label.data[1][0].share > 2 && label.data[0] != "Other"}
          <text
            class="small stronger no-stroke"
            x={label.x0 + (label.x1 - label.x0) / 2}
            y={label.y0 + (label.y1 - label.y0) / 2 + 4}
            text-anchor={'middle'}
            opacity={label.data[1][0].gas == "CO2" && activeScene.id == "co2"
          ? 1
          : label.data[1][0].gas == "CH4" && activeScene.id == "methane"
            ? 1
            : 0.1}>{colorScale[label.data[0]].label}</text
          >
          {/if}
        {/each}
        {#if hoverData}
          <rect
            class="outline"
            x={hoverData.x0}
            y={hoverData.y0}
            width={hoverData.x1 - hoverData.x0}
            height={hoverData.y1 - hoverData.y0}
            fill={'none'}
            stroke={'black'}
            stroke-width={1.5}
          />
        {/if}
      </g>
    </svg>
    {#if hoverData && mousePos}
      <Tooltip visible={true} targetPos={mousePos}>
        <p>
          <span class="label stronger">{colorScale[hoverData.data.subsector].label}</span> 
          {#if hoverData.data.subsector != "Other"}<span class="label caps stronger">({energyMap[hoverData.data.gas]})</span>{/if}
        </p>
        <p class="label">
          <Number value={hoverData.data.share + '%'} digits={1} />
        </p>
        <p class="label small weaker">{share}</p>
        <p class="label">
          <Number value={hoverData.data.mtco2e} digits={0} />
        </p>
        <p class="label small weaker">{units}</p>
      </Tooltip>
    {/if}
  
  <style>
    text,
    .outline, .gas-outline {
      pointer-events: none;
    }
    rect, text {
    transition: opacity 0.5s;
  }
  </style>
  