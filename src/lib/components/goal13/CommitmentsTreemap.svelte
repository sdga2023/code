<script>
    import { treemap, hierarchy, group, treemapSquarify } from 'd3';
    import * as Colors from '$lib/styles/tokens.es6.js';
    import Tooltip from '../general/Tooltip.svelte';
    import Number from '../general/Number.svelte';
    import { _ } from 'svelte-i18n';
  
    export let data;
    export let policy;
    export let pledge;
    export let law;
    export let notsubmitted;
  
    const colorScale = {
      'In Policy Document': { color: Colors.ColorBaseRed400, label: policy },
      'In Political Pledge': { color: Colors.ColorBaseGreen400, label: pledge },
      'In Law': { color: Colors.ColorBaseBlue400, label: law },
      'No document submitted': { color: Colors.ColorGrey400, label: notsubmitted }
    };
  
    let margins = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };
  
    let w;
    let h = 550;
  
    $: hierarchyData = hierarchy(
      group(
        data,
        (d) => d.status,
        (d) => d.iso3c,
      )
    ).sum((d) => d.emissions).sort((a, b) => b.value - a.value);

    $: treemapData = treemap()
      .round(true)
      .size([w - margins.left - margins.right, h - margins.top - margins.bottom])
      .tile(treemapSquarify)(hierarchyData);
  
    let hoverData;
  
    let mousePos;
    function updateMouse(evt) {
      mousePos = { x: evt.clientX, y: evt.clientY };
    }
  </script>
  
  <div bind:clientWidth={w}>
    <svg width={w} height={h} on:mousemove={updateMouse}>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#each treemapData.leaves() as box}
          <rect
            x={box.x0}
            y={box.y0}
            width={box.x1 - box.x0}
            height={box.y1 - box.y0}
            fill={colorScale[box.data.status].color}
            stroke="white"
            stroke-width={1}
            on:mouseover={() => (hoverData = box)}
            on:mouseout={() => (hoverData = null)}
            on:focus={() => (hoverData = box)}
            on:blur={() => (hoverData = null)}
          />
        {/each}
        {#each treemapData.descendants().filter((d) => d.depth == 1) as label}
          <text class="caps" x={label.x0 + 4} y={label.y0 + 18}>{colorScale[label.data[0]].label}</text>
        {/each}
        {#each treemapData.descendants().filter((d) => d.depth == 2) as label}
        {#if label.data[1][0].emissions > 114}
          <text class="small" x={label.x0 + (label.x1 - label.x0) / 2} y={label.y0 + (label.y1 - label.y0) / 2 + 4} text-anchor={'middle'}
            >{label.data[0]}</text
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
            fill={"none"}
            stroke={"black"}
            stroke-width={1.5}
          />
        {/if}
      </g>
    </svg>
    {#if hoverData && mousePos}
      <Tooltip visible={true} targetPos={mousePos}>
        <p>
          <span class="label caps stronger">{$_(`country.${hoverData.data.iso3c.toLowerCase()}`)}</span>
        </p>
        <p>
          <span class="label stronger">{hoverData.data.status}</span>
        </p>
        <p class="label">
          <Number value={hoverData.data.emissions} digits={1} />
        </p>
        <!--p class="label small weaker">{'CO2e/year'}</p-->
      </Tooltip>
    {/if}
  </div>
  
  <style>
    text,
    .outline {
      pointer-events: none;
    }
  </style>