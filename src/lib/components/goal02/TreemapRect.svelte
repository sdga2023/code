<script>
  import { tweened } from 'svelte/motion';
  import { cubicInOut, elasticOut } from 'svelte/easing';
  import Number from '../general/Number.svelte';
  import TreemapRectText from './TreemapRectText.svelte';

  export let leaf;
  export let i;
  export let xOffset = 0;
  export let yOffset = 0;
  export let hover;
  export let selectedYear;
  export let diffColor;
  export let isInactive;

  const dimensions = tweened(
    {
      width: leaf.x1 - leaf.x0,
      height: leaf.y1 - leaf.y0,

      diff: leaf.data.diff
    },
    { duration: 1400, delay: i, easing: cubicInOut }
  );

  const position = tweened(
    {
      x: leaf.x0,
      y: leaf.y0,
      xOffset: xOffset,
      yOffset: yOffset
    },
    { duration: 1400, delay: i, easing: cubicInOut }
  );

  $: $dimensions = {
    width: leaf.x1 - leaf.x0,
    height: leaf.y1 - leaf.y0,
    diff: leaf.data.diff
  };

  $: $position = {
    x: leaf.x0,
    y: leaf.y0,
    xOffset: xOffset,
    yOffset: yOffset
  };
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<g
  transform="translate({$position.x + $position.xOffset}, {$position.y + $position.yOffset})"
  on:click={() => console.log(leaf)}
  on:mousemove={(e) => {
    hover = {
      leaf,
      pos: { x: e.clientX, y: e.clientY }
    };
  }}
  on:mouseover={(e) => {
    hover = {
      leaf,
      pos: { x: e.clientX, y: e.clientY }
    };
  }}
  on:mouseout={() => (hover = undefined)}
>
  <rect
    opacity={isInactive ? 0.2 : 1}
    width={Math.max(0, $dimensions.width)}
    height={Math.max(0, $dimensions.height)}
    rx={4}
    ry={4}
    fill={diffColor}
  />

  <TreemapRectText text={leaf.parent.data[0].split(' ')[0]} rectWidth={Math.max(0, $dimensions.width)} />

  {#if leaf.data.value > 20000000 && selectedYear === 2022}
    <text
      style="text-anchor: middle; dominant-baseline: central;"
      x={$dimensions.width / 2}
      y={$dimensions.height / 2}
      class="label small number"
    >
      {#if $dimensions.diff > 0}+{/if}<Number unit="%" value={$dimensions.diff * 100} />
    </text>
  {/if}
</g>

<style>
  rect {
    stroke: white;
    stroke-width: 0.3;
  }

  text {
    fill: white;
    stroke: none;
  }
</style>
