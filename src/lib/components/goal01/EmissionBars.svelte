<script>
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';

  export let data;
  export let baseline;
  export let sdg73;
  export let reducedinequality;
  export let unit;

  let explanations =
    baseline && sdg73 && reducedinequality ? { baseline: baseline, sdg73: sdg73, reducedinequality: reducedinequality } : {};

  let margins = {
    top: 0,
    right: 30,
    bottom: 0,
    left: 0
  };

  let w;
  let h = 450;
  let barHeight = 100;

  $: xScale = scaleLinear()
    .domain([0, 16])
    .range([0, w - margins.left - margins.right]);
</script>

<div class={'container'} bind:clientWidth={w}>
  <svg width={w} height={h}>
    <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
      {#if data}
        {#each data as projection, i}
          <rect x={0} y={150 * i} width={xScale(projection.emissions)} height={barHeight} fill={Colors.ColorBaseBlue500} />
          <text x={xScale(projection.emissions) + 5} y={150 * i + barHeight / 2} fill={Colors.ColorBaseBlue500}
            ><Number value={projection.emissions} /> {unit}</text
          >
        {/each}
      {/if}
    </g>
  </svg>
  <div class="labels">
    {#if data}
      {#each data as projection, i}
        <div
          class="bar-explanation"
          style:top={4 + 150 * i + 'px'}
          style:left={margins.left + 8 + 'px'}
          style:width={xScale(projection.emissions) - 20 + 'px'}
        >
          {explanations[projection.scenario]}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .container {
    position: relative;
  }
  .labels {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.9;
  }
  .bar-explanation {
    position: absolute;
    color: white;
    line-height: 1.1;
  }
</style>
