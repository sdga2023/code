<script>
  import { pie, arc } from 'd3-shape';
  import Number from '../general/Number.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from '../general/Tooltip.svelte';

  export let data;
  export let commodity;
  export let wildfire;
  export let forestry;
  export let shiftingagriculture;
  export let urbanization;
  export let unknown;
  export let temporarydrivers;

  const colorScale = {
    wildfire: { color: Colors.ColorBaseRed500, label: wildfire },
    forestry: { color: Colors.ColorBaseRed700, label: forestry },
    shiftingagriculture: { color: Colors.ColorBaseRed400, label: shiftingagriculture },
    commodity: { color: Colors.ColorBaseYellow400, label: commodity },
    urbanization: { color: Colors.ColorBaseYellow200, label: urbanization },
    unknown: { color: Colors.ColorGrey400, label: unknown }
  };

  $: arcs = pie().value((d) => d.share)(data);
  $: arcOutlines = pie()([77.9, 22.1]);

  let w;
  let h = 450;

  $: radius = w > 400 ? 200 : w / 2 - 2;

  let hoveredData;
  let mousePos = { x: 0, y: 0 };
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
  $: console.log(hoveredData);
</script>

<div bind:clientWidth={w} on:mousemove={updateMouse}>
  <div class="container" style:width={w + 'px'} style:height={h + 'px'}>
    <svg width={w} height={h}>
      <g transform={'translate(' + w / 2 + ',' + h / 2 + ')'}>
        {#each arcs as slice}
          <path
            d={arc().innerRadius(0).outerRadius(radius)(slice)}
            stroke={Colors.ColorThemeBgWeaker}
            stroke-width={0.5}
            fill={colorScale[slice.data.driver].color}
            on:mouseover={() => (hoveredData = slice)}
            on:mouseout={() => (hoveredData = null)}
            on:focus={() => (hoveredData = slice)}
            on:blur={() => (hoveredData = null)}
          />
        {/each}
        {#each arcOutlines as outline, i}
          <!-- <path d={arc().innerRadius(0).outerRadius(radius)(outline)} stroke={'#FFFFFF'} stroke-width={i == 0 ? 5 : 0} fill={'none'} /> -->
          <path
            class="pie-outline"
            d={arc().innerRadius(0).outerRadius(radius)(outline)}
            stroke={'#ffffff'}
            stroke-width={i == 0 ? 6 : 0}
            fill={'none'}
          />
          <path
            class="pie-outline"
            d={arc().innerRadius(0).outerRadius(radius)(outline)}
            stroke={'#000000'}
            stroke-width={i == 0 ? 2.5 : 0}
            fill={'none'}
          />
        {/each}
        <text class={'caps stronger pie-outline'} x={50} y={40} text-anchor={'middle'}>{temporarydrivers}</text>
      </g>
    </svg>
    <div class="labels">
      {#each arcs as slice}
        {#if slice.data.share > 5}
          <div
            class={'pielabel category small'}
            class:white={!(colorScale[slice.data.driver].label === shiftingagriculture)}
            style:left={arc()
              .innerRadius(0)
              .outerRadius(h / 2)
              .startAngle(slice.startAngle)
              .endAngle(slice.endAngle)
              .centroid()[0] +
              w / 2 +
              'px'}
            style:top={arc()
              .innerRadius(0)
              .outerRadius(h / 2)
              .startAngle(slice.startAngle)
              .endAngle(slice.endAngle)
              .centroid()[1] +
              h / 2 -
              20 +
              'px'}
          >
            {colorScale[slice.data.driver].label}
            <p class="label number">
              <Number value={slice.data.share} digits={1} unit={'%'} />
            </p>
          </div>
        {/if}
      {/each}
    </div>
    {#if hoveredData && mousePos}
      <Tooltip visible={true} targetPos={{ x: mousePos.x + 0, y: mousePos.y }}>
        <!--p class="label caps">{$_(`region.${hoveredData.data.region}`)}</p-->
        <p class="label stronger">
          {colorScale[hoveredData.data.driver].label + ': '}<Number value={Math.round(hoveredData.data.share)} unit="%" />
        </p>
      </Tooltip>
    {/if}
  </div>
</div>

<style>
  .container {
    position: relative;
  }
  .labels {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .pielabel {
    position: absolute;
    transform: translateX(-50%);
    /*transform: translateY(-50%);*/
    line-height: 1rem;
    text-align: center;
    max-width: 120px;
    /* text-shadow: -1px -1px white, -1px 1px white, 1px 1px white, 1px -1px white, -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;*/
  }
  .pie-outline,
  .pie-outline-label {
    pointer-events: none;
  }
</style>
