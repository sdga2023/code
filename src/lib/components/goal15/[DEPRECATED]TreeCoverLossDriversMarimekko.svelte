<script>
  import { treemap, treemapSliceDice, hierarchy, group } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';

  export let data;
  export let commodity;
  export let wildfire;
  export let forestry;
  export let shiftingagriculture;
  export let urbanization;
  export let unknown;
  export let share;
  
  const colorScale = {
    commodity: { color: Colors.ColorBaseRed400, label: commodity },
    wildfire: { color: Colors.ColorBaseTeal400, label: wildfire },
    forestry: { color: Colors.ColorBaseGreen400, label: forestry },
    shiftingagriculture: { color: Colors.ColorBaseBlue400, label: shiftingagriculture },
    urbanization: { color: Colors.ColorBaseOrange400, label: urbanization },
    unknown: { color: Colors.ColorGrey500, label: unknown }
  };

  let margins = {
    top: 40,
    right: 0,
    bottom: 0,
    left: 0
  };

  let w;
  let h = 550;

  $: hierarchyData = hierarchy(
    group(
      data,
      (d) => d.region,
      (d) => d.tree_cover_loss_drivers
    )
  ).sum((d) => d.tree_cover_loss_ha_tot);
  $: treemapData = treemap()
    .round(true)
    .tile(treemapSliceDice)
    .size([w - margins.left - margins.right, h - margins.top - margins.bottom])
    (hierarchyData);
</script>

<div class="container" bind:clientWidth={w}>
  <svg width={w} height={h}>
    <defs>
      <marker id="arrowhead" markerWidth="5" markerHeight="6" refX="5" refY="3" orient="auto">
        <polygon points="0 0, 5 3, 0 6" fill={'white'} stroke="white" stroke-width={0} />
      </marker>
    </defs>
    <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#each treemapData.descendants().filter(d => d.depth == 2) as box}
            <rect
                x={box.x0}
                y={box.y0}
                width={box.x1 - box.x0}
                height={box.y1 - box.y0}
                fill={colorScale[box.data[0]].color}
                stroke="white"
                stroke-width={1}
            ></rect>
            {#if box.data[1][0].region == "LCN" && box.data[0] == "commodity"}
            <line
            x1={box.x0 + 3}
            x2={box.x1 - 3}
            y1={8}
            y2={8}
            stroke={'#ffffff'}
            stroke-width={1.5}
            marker-end={'url(#arrowhead)'}
          ></line>
          <line
            x1={box.x1 - 3}
            x2={box.x0 + 3}
            y1={8}
            y2={8}
            stroke={'#ffffff'}
            stroke-width={1.5}
            marker-end={'url(#arrowhead)'}
          ></line>
          {/if}
        {/each}
    </g>
    {#each treemapData.descendants().filter(d => d.depth == 1) as region}
            <text
                class={'small'}
                x={region.x0 + (region.x1 - region.x0)/2}
                y={30}
                dy={/*region.data[0] == "MEA" ||*/ region.data[0] == "SAS" ? -16 : 0}
                text-anchor={region.data[0] == "SAS" ? 'end' : 'middle'}
            >{$_(`region.${region.data[0]}`)}</text>
        {/each}
  </svg>
  <div class="labels">

    {#each treemapData.descendants().filter(d => d.depth == 2) as box}
    {#if box.data[1][0].region == "LCN" && ["commodity", "forestry", "shiftingagriculture"].includes(box.data[0])}
      <div class='label'
        style:left={box.x0 + 'px'}
        style:top={box.y0 + (box.y1 - box.y0)/2 + 'px'}
        style:width={(box.x1 - box.x0) + 'px'}
      >{colorScale[box.data[0]].label}</div>
      
      {#if box.data[0] == "commodity"}
        <div class="label small"
        style:top={'26px'}
        style:width={(box.x1 - box.x0) + 'px'}
        >{share}</div>
      {/if}

    {/if}

    {#if box.data[1][0].region == "ECS" && box.data[0] == "wildfire"}
      <div class='label'
        style:left={box.x0 + 'px'}
        style:top={box.y0 + (box.y1 - box.y0)/2 + 'px'}
        style:width={(box.x1 - box.x0) + 'px'}
      >{colorScale[box.data[0]].label}</div>
    {/if}

    {#if box.data[1][0].region == "NAC" && box.data[0] == "urbanization"}
      <div class='label'
        style:left={box.x0 + 'px'}
        style:top={box.y0 + (box.y1 - box.y0)/2 + 'px'}
        style:width={(box.x1 - box.x0) + 'px'}
      >{colorScale[box.data[0]].label}</div>
    {/if}
    {/each}
  </div>
</div>

<style>
  .container {
    position: relative;
  }
  .labels {
    position: absolute;
    top: 0;
    bottom: 0;
  }
  .label {
    position: absolute;
    transform: translateY(24px);
    text-align: center;
    text-shadow:
  -1px -1px 0 var(--color-theme-bg-weaker),
   0   -1px 0 var(--color-theme-bg-weaker),
   1px -1px 0 var(--color-theme-bg-weaker),
   1px  0   0 var(--color-theme-bg-weaker),
   1px  1px 0 var(--color-theme-bg-weaker),
   0    1px 0 var(--color-theme-bg-weaker),
  -1px  1px 0 var(--color-theme-bg-weaker),
  -1px  0   0 var(--color-theme-bg-weaker);
  }
</style>
