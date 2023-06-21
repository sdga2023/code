<script>
  import { pie, arc } from 'd3-shape';
  import Number from '../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import { ColorThemeBgWeaker } from '$lib/styles/tokens.es6';
  import Tooltip from '../general/Tooltip.svelte';

  export let data;
  export let region;
  export let height;
  export let colorScale;

  $: pieData = data.filter((d) => d.region == region);
  $: arcs = pie()
    .sort(null)
    .value((d) => d.share)(pieData);

  $: temporaryShare =
    pieData.find((d) => d.driver == 'forestry').share +
    pieData.find((d) => d.driver == 'shiftingagriculture').share +
    pieData.find((d) => d.driver == 'wildfire').share;

  $: outlines = pie().sort(null)([temporaryShare, 100 - temporaryShare]);

  let w;

  let hoveredData;
  let mousePos = { x: 0, y: 0 };
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
</script>

<div bind:clientWidth={w} on:mousemove={updateMouse}>
  <div class={'region title'}>{$_(`region.${region}`)}</div>
  <div class="container" style:width={w + 'px'} style:height={height + 'px'}>
    <svg width={w} {height}>
      <g transform={'translate(' + w / 2 + ',' + height / 2 + ')'}>
        {#each arcs as slice}
          <path
            d={arc()
              .innerRadius(0)
              .outerRadius(height / 2 - 2)(slice)}
            stroke={ColorThemeBgWeaker}
            stroke-width={0.5}
            fill={colorScale[slice.data.driver].color}
            on:mouseover={() => (hoveredData = slice)}
            on:mouseout={() => (hoveredData = null)}
            on:focus={() => (hoveredData = slice)}
            on:blur={() => (hoveredData = null)}
          />
        {/each}
        {#each outlines as outline, i}
          <path
            class="outlines"
            d={arc()
              .innerRadius(0)
              .outerRadius(height / 2 - 2)(outline)}
            stroke={'#ffffff'}
            stroke-width={i == 0 ? 4 : 0}
            fill={'none'}
          />
          <path
            class="outlines"
            d={arc()
              .innerRadius(0)
              .outerRadius(height / 2 - 2)(outline)}
            stroke={'#000000'}
            stroke-width={i == 0 ? 2 : 0}
            fill={'none'}
          />
        {/each}
      </g>
    </svg>
    <div class="labels">
      {#each arcs as slice}
        {#if slice.data.share > 9}
          <div
            class={'pielabel number'}
            class:white={!('' + slice.data.driver == 'shiftingagriculture')}
            style:left={arc()
              .innerRadius(0)
              .outerRadius(height / 2)
              .startAngle(slice.startAngle)
              .endAngle(slice.endAngle)
              .centroid()[0] +
              w / 2 +
              'px'}
            style:top={arc()
              .innerRadius(0)
              .outerRadius(height / 2)
              .startAngle(slice.startAngle)
              .endAngle(slice.endAngle)
              .centroid()[1] +
              height / 2 -
              20 +
              'px'}
          >
            <Number value={slice.data.share} digits={1} unit={'%'} />
          </div>
        {/if}
      {/each}
    </div>
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

<style>
  svg {
    overflow: visible;
  }
  .region {
    text-align: center;
  }
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
  path.outlines {
    pointer-events: none;
  }
  .pielabel {
    position: absolute;
    transform: translateX(-50%);
    /*transform: translateY(-50%);*/
    line-height: 1rem;
    text-align: center;
    max-width: 120px;
    /*   text-shadow: -1px -1px white, -1px 1px white, 1px 1px white, 1px -1px white, -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white; */
  }
</style>
