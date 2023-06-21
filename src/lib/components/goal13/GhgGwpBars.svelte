<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { min, max } from 'd3-array';
  import { format } from 'd3-format';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';

  export let data;
  export let height;
  export let colors;
  export let title;

  let margins = {
    top: 20,
    right: 15,
    bottom: 16,
    left: 0
  };

  let w;
  let h = height;

  $: xScale = scaleBand()
    .domain(data.map((d) => d.gas))
    .range([0, w - margins.left - margins.right])
    .paddingInner(0.2);

  $: yScale = scaleLinear()
    .domain([0, 1000])
    .range([h - margins.top - margins.bottom, 0]);
</script>

<p class="label title caps">{title}</p>
<div class="barchart" bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h}>
      <g transform={'translate(' + margins.left + xScale.bandwidth() / 2 + ',' + margins.top + ')'}>
        {#each data as bar}
          <rect
            x={xScale(bar.gas) - xScale.bandwidth() / 2}
            y={yScale(bar.gwp)}
            width={xScale.bandwidth()}
            height={Math.abs(yScale(bar.gwp) - yScale(0))}
            fill={colors[bar.gas].color}
          />
        {/each}
        {#each data as label}
          <text x={xScale(label.gas)} y={yScale(label.gwp)} dy={-6} class="number middle">
            {label.gwp}
          </text>
        {/each}
      </g>
    </svg>
  {/if}
  <div class="labels">
    {#each data as label}
      <div class={'category small bar-label'} style:left={xScale(label.gas) + xScale.bandwidth() / 2 + 'px'} style:top={h - 16 + 'px'}>
        {colors[label.gas].label}
      </div>
    {/each}
  </div>
</div>

<style>
  .barchart {
    width: 100%;
  }
  .labels {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .bar-label {
    position: absolute;
    transform: translateX(-50%);
    line-height: 1rem;
    text-align: center;
    max-width: 100px;
  }
</style>
