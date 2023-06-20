<script>
  import { pie, arc } from 'd3-shape';
  import Number from '../general/Number.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let largescale
  export let smallscale

  $: arcs = pie().value((d) => d.share)(data);

  let w;
  let h = 450;

  $: radius = w > 400 ? 200 : w / 2 - 2;

  const colorScale = {
    large: { color: Colors.ColorVisBinaryNeg, label: largescale },
    small: { color: Colors.ColorVisBinaryPos, label: smallscale },
  };
</script>

<div bind:clientWidth={w}>
  <div class="container" style:width={w + 'px'} style:height={h + 'px'}>
    <svg width={w} height={h}>
      <g transform={'translate(' + w / 2 + ',' + h / 2 + ')'}>
        {#each arcs as slice}
          <path
            d={arc().innerRadius(0).outerRadius(radius)(slice)}
            stroke={Colors.ColorThemeBgWeaker}
            stroke-width={1}
            fill={colorScale[slice.data.fisheries].color}
          />
        {/each}
      </g>
    </svg>
    <div class="labels">
      {#each arcs as slice}
          <div
            class={'pielabel category small'}
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
            {colorScale[slice.data.fisheries].label}
            <p class="label number">
              <Number value={slice.data.share} digits={0} unit={'%'} />
            </p>
          </div>
      {/each}
    </div>
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
  }
  .pielabel {
    position: absolute;
    transform: translateX(-50%);
    line-height: 1rem;
    text-align: center;
    max-width: 120px;
    color: white;
  }
</style>
