<script>
  import { pie, arc } from 'd3-shape';
  import Number from '../general/Number.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let colors;
  export let height;
  export let title;

  $: arcs = pie().value((d) => d.share)(data);

  let w;
  let h = height;

  $: radius = Math.min(w, h) / 2 - 25;
</script>

<p class="label title caps">{title}</p>
<div bind:clientWidth={w}>
  <div class="container" style:width={w + 'px'} style:height={h + 'px'}>
    <svg width={w} height={h}>
      <g transform={'translate(' + w / 2 + ',' + h / 2 + ')'}>
        {#each arcs as slice}
          <path
            d={arc().innerRadius(0).outerRadius(radius)(slice)}
            stroke={Colors.ColorThemeBgWeaker}
            stroke-width={0.5}
            fill={colors[slice.data.gas].color}
          />
        {/each}
      </g>
    </svg>
    <div class="labels">
      {#each arcs as slice}
        <div
          class={slice.data.gas == 'fluor' ? 'pielabel category small' : 'pielabel white category small'}
          style:left={arc()
            .innerRadius(0)
            .outerRadius(h / 2)
            .startAngle(slice.startAngle)
            .endAngle(slice.endAngle)
            .centroid()[0] +
            w / 2 +
            'px'}
          style:top={slice.data.gas == 'fluor'
            ? $isMobile
              ? arc()
                  .innerRadius(0)
                  .outerRadius(h / 2)
                  .startAngle(slice.startAngle)
                  .endAngle(slice.endAngle)
                  .centroid()[1] +
                h / 2 -
                110 +
                'px'
              : arc()
                  .innerRadius(0)
                  .outerRadius(h / 2)
                  .startAngle(slice.startAngle)
                  .endAngle(slice.endAngle)
                  .centroid()[1] +
                h / 2 -
                95 +
                'px'
            : arc()
                .innerRadius(0)
                .outerRadius(h / 2)
                .startAngle(slice.startAngle)
                .endAngle(slice.endAngle)
                .centroid()[1] +
              h / 2 -
              20 +
              'px'}
        >
          {colors[slice.data.gas].label}
          <p class="label number">
            <Number value={slice.data.share} digits={1} unit={'%'} />
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
    pointer-events: none;
  }
  .pielabel {
    position: absolute;
    transform: translateX(-50%);
    line-height: 1rem;
    text-align: center;
    max-width: 160px;
  }
  .pielabel.white {
    color: white;
  }
</style>
