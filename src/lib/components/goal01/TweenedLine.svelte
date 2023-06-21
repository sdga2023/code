<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { line, curveNatural } from 'd3-shape';
  import { fade } from 'svelte/transition';

  export let data;
  export let activeScene;
  export let xScale;
  export let yScale;
  export let colour;

  $: startData = data
    ? data.map((d) => {
        let obj = {};
        obj.x = xScale(d.gdppc);
        obj.y = yScale(d.povertyrate);
        return obj;
      })
    : [];

  $: endData = data
    ? data.map((d) => {
        let obj = {};
        obj.x = xScale(d.gdppc);
        obj.y = yScale(d.ghgpc);
        return obj;
      })
    : [];

  const tweenedData = tweened(undefined, {
    duration: 500,
    easing: cubicOut
  });
  $: if (startData.length > 1 && activeScene.index < 3) {
    tweenedData.set(startData);
  }

  $: if (activeScene.index > 2) {
    tweenedData.set(endData);
  }

  $: lineGenerator = line()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(curveNatural);
</script>

{#if $tweenedData}
  <path d={lineGenerator($tweenedData)} fill={'none'} stroke={colour} transition:fade|local />
{/if}

<style>
  path {
    stroke-width: 8;
    stroke-linecap: round;
    opacity: 0.6;
  }
</style>
