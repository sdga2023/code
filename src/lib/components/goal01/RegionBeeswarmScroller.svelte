<script>
  import { scalePoint, scaleLog } from 'd3-scale';
  import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';
  import { fade } from 'svelte/transition';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import * as Tokens from '$lib/styles/vis.js';

  export let data;
  export let activeScene = { index: 0 };
  export let abovepovertyline;
  export let belowpovertyline;
  export let extremepoverty;
  export let lessthan;
  export let yaxisunits;
  export let parentWidth;
  export let parentHeight;

  let margins = {
    top: 0,
    right: 20,
    bottom: 1,
    left: 20
  };

  let w = parentWidth;
  let h = parentHeight;

  $: radius = $isMobile ? Tokens.BeeswarmCircleRadiusMob : Tokens.BeeswarmCircleRadius;

  let beeswarmData90;
  let beeswarmData19;

  let byRegion = false;
  $: if (activeScene.index > 2) {
    byRegion = true;
  }
  $: if (activeScene.index < 3) {
    byRegion = false;
  }

  $: if (data) {
    // Remove the rest of the world for the regions
    if (byRegion) {
      data = data.filter((d) => d.region !== 'RESTOFWORLD');
    }
    data = data.map((d) => {
      return { ...d, fy: yScale(d.welfare) };
    });

    beeswarmData90 = data.filter((d) => d.year == 1990);
    beeswarmData19 = data.filter((d) => d.year == 2019);
  }

  const regions = ['EAS', 'SAS', 'SSF'];

  $: xScale = scalePoint()
    .domain(regions)
    .range([margins.left, w - margins.right])
    .padding(0.5);

  $: yScale = scaleLog()
    .range([h - margins.bottom, margins.top])
    .domain([0.25, 300]);
  const yTicks = w > 700 ? [0.25, 1, 10, 50, 100, 150, 200] : [0.5, 5, 20, 50, 200];

  $: simulation90 = forceSimulation(beeswarmData90)
    .force(
      'x',
      forceX()
        .x((d) => (byRegion ? xScale(d.region) - 35 : w / 3))
        .strength(0.5)
    )
    .force('collide', forceCollide(radius))
    .stop();

  $: for (let i = 0, n = Math.ceil(Math.log(simulation90.alphaMin()) / Math.log(1 - simulation90.alphaDecay())); i < n; ++i) {
    simulation90.tick();
  }

  $: simulation19 = forceSimulation(beeswarmData19)
    .force(
      'x',
      forceX()
        .x((d) => (byRegion ? 35 + xScale(d.region) : (w * 2) / 3))
        .strength(0.5)
    )
    .force('y', forceY().strength(0.5))
    .force('collide', forceCollide(radius))
    .stop();

  $: for (let i = 0, n = Math.ceil(Math.log(simulation19.alphaMin()) / Math.log(1 - simulation19.alphaDecay())); i < n; ++i) {
    simulation19.tick();
  }
</script>

{#if w}
  {#if w > 700}
    <CategoricalLegend
      top={true}
      legendType="custom"
      customItems={[
        { key: abovepovertyline, colour: Colors.ColorVisBinaryPos },
        { key: belowpovertyline, colour: Colors.ColorVisBinaryNeg }
      ]}
    />
  {/if}
  <div class="label-container">
    {#if activeScene.index < 3}
      <div class="label geo centered">
        {$_('region.WLD')}
      </div>
    {/if}
    {#if activeScene.index > 2}
      {#each regions as region, i}
        <div class="label geo centered" style:width={xScale.step() + 'px'}>
          {$_(`region.${region}`)}
        </div>
      {/each}
    {/if}
  </div>
  <div class="svg-container" bind:clientHeight={h} bind:clientWidth={w}>
    <svg width={w} height={h} class="region-beeswarm beeswarm">
      {#if activeScene.index < 6}
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w}
          scale={yScale}
          ticks={yTicks}
          yAxisUnits={yaxisunits}
        />
      {/if}
      {#each simulation90.nodes() as node}
        <circle
          cx={node.x}
          cy={node.y}
          r={radius}
          fill={node.welfare < 2.15 ? Colors.ColorVisBinaryNeg : Colors.ColorVisBinaryPos}
          fill-opacity={activeScene.index < 2
            ? node.welfare < 2.15
              ? 1
              : 0.3
            : activeScene.index == 2
            ? node.welfare > 2.15
              ? 1
              : 0.3
            : 1}
          opacity={activeScene.index == 4 || activeScene.index == 5 ? 0.3 : 1}
          transition:fade|local
        />
      {/each}

      {#if simulation19 && activeScene.index != 0 && activeScene.index != 3}
        {#each simulation19.nodes() as node}
          <circle
            cx={node.x}
            cy={node.y}
            r={radius}
            fill={node.welfare < 2.15 ? Colors.ColorVisBinaryNeg : Colors.ColorVisBinaryPos}
            fill-opacity={activeScene.index < 2
              ? node.welfare < 2.15
                ? 1
                : 0.3
              : activeScene.index == 2
              ? node.welfare > 2.15
                ? 1
                : 0.3
              : 1}
            opacity={activeScene.index == 4 && node.region == 'SSF' ? 0 : 1}
            transition:fade|local
          />
        {/each}
      {/if}

      <line y1={yScale(2.15)} y2={yScale(2.15)} x1={0} x2={w} stroke-width="1.5" stroke={Colors.ColorVisBinaryNeg} transition:fade|local />

      {#if activeScene.index < 6}
        <text
          x={0}
          y={yScale(2.15) + 18}
          fill={Colors.ColorVisBinaryNeg}
          class={'label caps stronger extreme-poverty'}
          transition:fade|local>{extremepoverty}</text
        >
        <text x={0} y={yScale(2.15) + 35} fill={Colors.ColorVisBinaryNeg} class={'label small weaker'} transition:fade|local
          >{lessthan}</text
        >
      {/if}
    </svg>
  </div>

  <div class="label-container">
    {#if activeScene.index > 2}
      {#each regions as region, i}
        <div
          class="centered"
          style:left={xScale(region) - xScale.step() / 2 + 'px'}
          style:width={xScale.step() + 'px'}
          transition:fade|local
        >
          <p class="number centered" style="padding-right: 10px;">1990</p>

          {#if (activeScene.index > 3 && i < 2) || (activeScene.index == 5 && i == 2)}
            <p class="number centered" style="display: inline-block; padding-left: 10px;">2019</p>
          {:else}
            <p class="number centered" style="opacity: 0; padding-left: 10px;">2019</p>
          {/if}
        </div>
      {/each}
    {/if}
    {#if activeScene.index === 0}
      <p class="number centered">1990</p>
      <p class="number centered" style="opacity: 0;">2019</p>
    {:else if activeScene.index < 3}
      <p class="number centered">1990</p>
      <p class="number centered">2019</p>
    {/if}
  </div>
{/if}

<style>
  .centered {
    text-align: center;
  }

  p {
    display: inline-block;
  }

  .svg-container {
    flex: 1;
    overflow: hidden;
    max-height: 700px;
  }

  .label-container {
    display: flex;
    justify-content: space-evenly;
  }

  circle {
    transition: opacity 2s, fill-opacity 2s;
  }
  .extreme-poverty {
    fill: var(--color-vis-binary-neg);
  }
</style>
