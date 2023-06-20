<script>
  import Scroller from '@sveltejs/svelte-scroller';
  import ChartGrid from '../ChartGrid.svelte';

  import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
  import { scaleLinear } from 'd3-scale';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let vertical_axis_label;
  export let gini_label;

  let w = 0;
  let svgHeight = 0;
  let svgWidth = 0;
  $: svgWidth = w;

  const padding = 50;
  let radius = 15;

  let dat = [...Array(100).keys()].map((d, i) => ({ id: i, value: 0, x: w / 2, y: 500 }));
  let yScale = scaleLinear().range([450, 50]).domain([0, 1500]);

  let yTicks = [];

  let index, offset, progress;

  let selectedGini = 0.2;

  $: {
    let calculatedGini = Math.min(0.65, Math.max(0, Math.max(0, progress) * 0.5 + 0.2));
    if (!isNaN(calculatedGini)) {
      selectedGini = calculatedGini.toFixed(2);
    } else {
      selectedGini = 0.2;
    }
  }

  $: {
    if (data) {
      data[selectedGini]?.forEach((d, i) => (dat[i].value = d * 100));

      yScale.range([svgHeight - padding * 2, padding]);
      yTicks = [500, 1000, 1500];

      let sim = forceSimulation(dat)
        .force(
          'y',
          forceY()
            .y((d) => yScale(d.value))
            .strength(0.75)
        )
        .force('x', forceX().strength(0.01))
        .force('collide', forceCollide(radius / 2).strength(0.5));

      sim.alpha(1);
      sim.restart();

      //.stop();

      for (let i = 0, n = Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay())); i < n; ++i) {
        sim.tick();
      }
    }
  }
</script>

<div class="gini-simulation layout-main" bind:clientWidth={w}>
  <Scroller top={0} bottom={1} threshold={0} bind:index bind:offset bind:progress>
    <div class="background" slot="background" bind:clientHeight={svgHeight}>
      <svg width={svgWidth} height={svgHeight}>
        <filter id="gooify" width="200%" x="-100%" height="200%" y="-100%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 255 -128"
          />
        </filter>
        <g filter="url(#gooify)">
          {#if dat}
            {#each dat as d (d.id)}
              <g style="transform: translate({d.x + svgWidth / 2 ?? 0}px, {d.y ?? 0}px)">
                <circle r={radius} />
              </g>
            {/each}
          {/if}
        </g>
        {#if svgHeight && yTicks.length > 0}
          <ChartGrid
            gridType="yGrid"
            innerHeight={svgHeight}
            innerWidth={svgWidth}
            scale={yScale}
            ticks={yTicks}
            yAxisUnits={vertical_axis_label}
          />
        {/if}
      </svg>
    </div>
    <div class="foreground" slot="foreground" style={`height: ${svgHeight * 5}px`}>
      <div class="number-container">
        <p class="label">{gini_label}</p>
        <p class="label gini">{(selectedGini * 100).toFixed(0)}</p>
      </div>
    </div>
  </Scroller>
</div>

<style type="text/scss">
  .gini-simulation {
    .background {
      width: 100%;
      height: 100vh;
      padding: var(--loop-header-height) 0 0 0;
      margin: 0;
    }
    svg {
      circle {
        z-index: 999;
        pointer-events: all;
        cursor: pointer;

        fill: var(--color-base-pink600);
        //fill: transparent;
        //stroke-width: 5px;
      }

      g {
        transition: transform 1s ease-out;
      }
    }

    .foreground {
      margin: 0;
      width: 100%;
      max-width: 100%;
      z-index: 99 !important;

      p {
        font-weight: bold;

        &.label {
          text-shadow: -1px -1px 0 var(--color-theme-bg), 0 -1px 0 var(--color-theme-bg), 1px -1px 0 var(--color-theme-bg),
            1px 0 0 var(--color-theme-bg), 1px 1px 0 var(--color-theme-bg), 0 1px 0 var(--color-theme-bg), -1px 1px 0 var(--color-theme-bg),
            -1px 0 0 var(--color-theme-bg);
        }

        &.gini {
          font-family: var(--font-families-andes);
          font-size: var(--font-size-5xl);
        }
      }

      .number-container {
        position: sticky;
        top: 0;
        right: 0px;
        padding: 40vh 0;
        width: auto;
        text-align: center;

        padding: 120px 0;
      }
    }
  }

  @media screen and (max-width: 872px) {
    .gini-simulation .foreground p.gini {
      font-size: 5rem;
    }
  }
</style>
