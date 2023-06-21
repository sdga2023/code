<script>
  import { _ } from 'svelte-i18n';
  import { Number } from '$lib/components';

  import { liveGini } from '$lib/stores/goal10/liveGini';
  import { scaleLog } from 'd3-scale';

  import Scene from '../Scene.svelte';

  export let text;
  export let autopicking_label;
  export let actual_gini;
  export let average_transfers;

  $: times = $liveGini?.pairs?.[0]?.diff.toFixed(1) ?? 0;
  $: modifiedText = times ? text?.replace('{times}', times) : text;
  $: num = $liveGini?.pairs?.length;
  $: modified_avg_transfers = num ? average_transfers?.replace('{num}', num) : average_transfers;

  const countries = ['NAM', 'BLR'];
  const ginis = { NAM: 59.1, BLR: 25.3 };

  let w = 280;
  const h = 80;
  const padding = 5;

  $: sum = $liveGini?.pairs?.reduce((acc, val) => acc + val.diff, 0) ?? 0;
  $: avg = sum / $liveGini?.pairs?.length;

  $: barWidth = Math.min(w / 4, w / $liveGini?.pairs?.length);

  $: xScale = (i) => i * barWidth;
  let yScale = scaleLog()
    .domain([1, 600])
    .range([0, (h - padding) / 2]);
  yScale.clamp(true);
</script>

<Scene text={modifiedText}>
  <p />
  {#if autopicking_label}<button on:click={() => ($liveGini.autopicking = true)}>{autopicking_label}</button>{/if}

  <div class="gini-explorer" bind:clientWidth={w}>
    <svg width={w} height={h}>
      {#if $liveGini?.pairs?.length > 0}
        {#each $liveGini.pairs as d, i}
          <rect class="plus" x={xScale(i)} width={barWidth / 2} y={h / 2 - yScale(d.diff)} height={yScale(d.diff)} />
          <rect class="minus" x={xScale(i)} width={barWidth / 2} y={h / 2} height={yScale(d.diff)} />
        {/each}
      {/if}
    </svg>
  </div>
  <p>{modified_avg_transfers}</p>
  <p class="label stronger large"><Number value={avg} digits="1" unit="%" /></p>
  {#each countries as country}
    {#if actual_gini && country === 'NAM'}<h3 class="gini-label">
        {actual_gini}
        {$_(`country.${country.toLowerCase()}`)}
      </h3>
      <p class=" label stronger large"><Number value={ginis[country]} digits="0" /></p>{/if}
  {/each}
</Scene>

<style type="text/scss">
  .gini-explorer {
    position: sticky;
    margin: var(--space-s) 0;
  }
  h3 {
    margin-top: var(--space-xs);
  }
  h3,
  p {
    text-align: center;
  }

  button {
    z-index: 9999;
    margin: var(--space-m) 0;
    width: 100%;
  }

  rect {
    fill: var(--color-vis-region-SSF);

    &.minus {
      fill: var(--color-vis-binary-neg);
    }

    &.plus {
      fill: var(--color-vis-binary-pos);
    }
  }

  text {
    fill: var(--color-theme-text);
    font-size: var(--font-size-s);

    &.gini-label {
      fill: var(--color-theme-text);
      text-anchor: end;
    }

    &.axis {
      text-anchor: start;
    }
  }
</style>
