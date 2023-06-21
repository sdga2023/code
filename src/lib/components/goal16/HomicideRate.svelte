<script>
  import { scaleLinear } from 'd3';
  import { format } from 'd3-format';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let activeScene;
  export let labels;

  const f = format('.2%');

  const margin = {
    top: 30,
    right: 5,
    bottom: 20,
    left: 0
  };

  $: width = parentWidth;
  $: height = parentHeight;

  $: w = parentWidth - margin.left - margin.right;
  $: h = parentHeight - margin.top - margin.bottom;

  $: stacked = data
    .sort((a, b) => a.rate_change - b.rate_change)
    .reduce((acc, cur, i) => {
      if (i === 0) {
        acc.push({
          ...cur,
          d0: 0,
          d1: cur.counts
        });
      } else {
        acc.push({
          ...cur,
          d0: acc[i - 1].d1,
          d1: acc[i - 1].d1 + cur.counts
        });
      }

      return acc;
    }, []);

  const xDomain = tweened([0, 0], {
    duration: 1000,
    easing: cubicInOut
  });

  const yDomain = tweened([-0.3, 0.3], {
    duration: 1000,
    easing: cubicInOut
  });

  const usaStrokeWidth = tweened(0, {
    duration: 600,
    delay: 400,
    easing: cubicInOut
  });

  $: {
    if (activeScene.index === 0) {
      $xDomain = [-20000, stacked[stacked.length - 1].d1];
      $yDomain = [-0.3, 0.3];

      $usaStrokeWidth = 0;
    } else if (activeScene.index === 1) {
      $xDomain = [206500, stacked[stacked.length - 1].d1];
      $yDomain = [-0, 0.4];

      $usaStrokeWidth = 2;
    } else {
      $xDomain = [-20000, stacked[stacked.length - 1].d1];
      $yDomain = [-0.3, 0.3];

      $usaStrokeWidth = 0;
    }
  }

  $: y = scaleLinear().domain($yDomain).range([h, 0]);

  $: x = scaleLinear().domain($xDomain).range([0, w]);

  let hover;

  let mousePosition = { x: 0, y: 0 };
  function updateMouse(evt) {
    mousePosition = { x: evt.clientX, y: evt.clientY };
  }

  function getOpacity(country) {
    if (activeScene.index === 1) {
      return country.iso3_code === 'ISL' ? 1 : 0.4;
    } else if (activeScene.index === 2) {
      return country.iso3_code === 'USA' ? 1 : 0.4;
    } else {
      return 1;
    }
  }
</script>

<div class="svg-container" bind:clientHeight={height} bind:clientWidth={width}>
  <svg {width} {height} on:mousemove={updateMouse}>
    <defs class="s-A8kItIMSuk1V"
      ><marker
        id="startarrowblack"
        viewBox="0 0 10 10"
        markerWidth="6"
        markerHeight="6"
        refX="8"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
        class="s-A8kItIMSuk1V"><path d="M 0 0 L 10 5 L 0 10 z" fill="#706f7d" class="s-A8kItIMSuk1V" /></marker
      ><marker
        id="endarrowblack"
        viewBox="0 0 10 10"
        markerWidth="6"
        markerHeight="6"
        refX="8"
        refY="5"
        orient="auto-start-reverse"
        class="s-A8kItIMSuk1V"><path d="M 0 0 L 10 5 L 0 10 z" fill="#706f7d" class="s-A8kItIMSuk1V" /></marker
      ><marker
        id="endarrowwhite"
        viewBox="0 0 10 10"
        markerWidth="6"
        markerHeight="6"
        refX="8"
        refY="5"
        orient="auto-start-reverse"
        class="s-A8kItIMSuk1V"><path d="M 0 0 L 10 5 L 0 10 z" fill="white" class="s-A8kItIMSuk1V" /></marker
      ><marker
        id="startarrowwhite"
        viewBox="0 0 10 10"
        markerWidth="6"
        markerHeight="6"
        refX="8"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
        class="s-A8kItIMSuk1V"><path d="M 0 0 L 10 5 L 0 10 z" fill="white" class="s-A8kItIMSuk1V" /></marker
      >
    </defs>
    <g transform="translate({margin.left}, {margin.top})">
      {#each y.ticks() as tick}
        <line x1={0} x2={w} y1={y(tick)} y2={y(tick)} stroke="var(--color-grey-100)" stroke-width="1" />
        <text dy={-3} class="label small weaker" x={0} y={y(tick)}>{tick}</text>
      {/each}
      {#each stacked as s}
        <g on:mouseover={() => (hover = s)} on:mouseout={() => (hover = undefined)}>
          {#if s.rate_change < 0}
            <rect
              x={x(s.d0)}
              width={Math.max(0, x(s.d1) - x(s.d0) - 1)}
              y={y(0)}
              height={y(0) - y(Math.abs(s.rate_change))}
              fill="var(--color-vis-binary-pos)"
            />
          {:else}
            <rect
              x={x(s.d0)}
              width={Math.max(0, x(s.d1) - x(s.d0) - 1)}
              y={y(Math.abs(s.rate_change))}
              height={y(0) - y(Math.abs(s.rate_change))}
              fill="var(--color-vis-binary-neg)"
              opacity={getOpacity(s)}
            />
            {#if s.iso3_code === 'BRA'}
              <line
                marker-end="url(#startarrowwhite)"
                marker-start="url(#endarrowwhite)"
                x1={x(s.d0) + 8}
                y1={y(0)}
                x2={x(s.d0) + 8}
                y2={y(Math.abs(s.rate_change))}
                stroke-width={1.5}
                stroke="white"
              />
              <text x={x(s.d0)} y={(y(0) + y(Math.abs(s.rate_change))) / 2} class="label small end central" dx={-4}>
                {$_(labels.height_label)}
              </text>
              <line
                marker-end="url(#startarrowblack)"
                marker-start="url(#endarrowblack)"
                x1={x(s.d0)}
                y1={y(0) + 8}
                x2={x(s.d1)}
                y2={y(0) + 8}
                stroke-width={1.5}
                stroke="var(--color-theme-text-weaker)"
              />
              <text x={(x(s.d1) + x(s.d0)) / 2} y={y(0)} dy={24} class="label small middle">{$_(labels.width_label)}</text>
            {/if}
            {#if activeScene.index === 1 && s.iso3_code === 'USA'}
              <rect
                x={x(s.d0) - 3}
                width={Math.max(0, x(s.d1) - x(s.d0) - 1) + 6}
                y={y(Math.abs(s.rate_change)) - 3}
                height={y(0) - y(Math.abs(s.rate_change)) + 6}
                fill="none"
                stroke="black"
                stroke-width={$usaStrokeWidth}
                style="pointer-events: none;"
              />
            {/if}

            {#if activeScene.index === 1 && s.iso3_code === 'USA'}
              <text
                x={(x(s.d0) + Math.max(0, x(s.d1) - x(s.d0) - 1)) / 2}
                y={y(Math.abs(s.rate_change)) - 5}
                class="label middle geo"
                dy={-10}
              >
                {$_(`country.${s.iso3_code.toLowerCase()}`)}
              </text>
            {/if}
          {/if}
        </g>
      {/each}
      <line x={x.range()[0]} x2={x.range()[1]} y1={y(0)} y2={y(0)} stroke="var(--color-grey-200)" />
    </g>
  </svg>
</div>
{#if hover}
  <Tooltip visible={hover !== undefined} targetPos={mousePosition}>
    <div class="label geo">{$_(`country.${hover.iso3_code.toLowerCase()}`)}</div>
    <hr />
    <div class="label number" class:positive={hover.rate_change <= 0} class:negative={hover.rate_change > 0}>
      {hover.rate_change > 0 ? '+' : ''}<Number value={hover.rate_change} digits={2} />
    </div>
    <div class="label small weaker">
      {$_(labels.tooltip_rate_change)}
    </div>
    <hr />
    <div class="label number">
      <Number value={hover.counts} digits={0} />
    </div>
    <div class="label small weaker">
      {$_(labels.tooltip_count)}
    </div>
  </Tooltip>
{/if}

<style>
  .positive {
    color: var(--color-vis-blue);
  }

  .negative {
    color: var(--color-vis-red);
  }
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
