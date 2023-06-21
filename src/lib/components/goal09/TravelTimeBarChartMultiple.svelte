<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { format } from 'd3-format';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';

  export let data;
  export let level;
  export let height;
  export let primary;
  export let postprimary;
  export let gross_enroll;
  export let net_enroll;
  export let completion;

  const variableMap = {
    gross_enroll: gross_enroll,
    net_enroll: net_enroll,
    completion: completion
  };

  let margins = {
    top: 24,
    right: 0,
    bottom: 10,
    left: 0
  };

  let w;
  let h = height;

  $: barData = data.filter((d) => d.level == level);
  $: labelData = barData;

  $: xScale = scaleLinear()
    .domain([0, 3.3])
    .range([0, w - margins.left - margins.right]);

  $: yScale = scaleBand()
    .domain(barData.map((d) => d.variable))
    .range([0, h - margins.bottom - margins.top])
    .paddingInner(0.4);
</script>

<div class="barchart" bind:clientWidth={w}>
  <p class="title">{level == 'primary' ? primary : postprimary}</p>
  {#if w}
    <svg width={w} height={h}>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#each barData as bar}
          <rect
            x={xScale(0)}
            y={yScale(bar.variable)}
            width={xScale(bar.effect)}
            height={yScale.bandwidth()}
            fill={Colors.ColorVisBinaryPos}
          />
        {/each}
        {#each labelData as label}
          <text
            x={xScale(label.effect) - 10}
            y={yScale(label.variable) + yScale.bandwidth() / 2 + 4}
            class="number end white"
            fill={Colors.ColorVisBinaryPos}
          >
            {format('+')(label.effect)}
          </text>

          <text class="category" x={xScale(0)} y={yScale(label.variable) - 4}>
            {variableMap[label.variable]}
          </text>
        {/each}
      </g>
    </svg>
  {/if}
</div>

<style>
  .barchart {
    width: 100%;
  }
</style>
