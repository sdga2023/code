<script>
  import { line, area } from 'd3';

  import { bisector, extent, max } from 'd3-array';

  import { scaleLinear } from 'd3-scale';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import HoverMarker from '../general/HoverMarker.svelte';
  import Date from '../general/Date.svelte';
  import Number from '../general/Number.svelte';

  export let data;
  export let maxDeaths;

  let w;

  let padding = 20;

  $: h = w ? w / 2 : 0;

  let xScale, yScale, actLineGen, actAreaGen, actBottomLineGen, expLineGen, bottomArea, topArea, income, covidArea;
  $: if (data) {
    income = data[0].income;
    xScale = scaleLinear()
      .domain(extent(data.map((d) => d.absoluteMonth)))
      .range([padding, w - padding]);

    yScale = scaleLinear()
      .domain([0, maxDeaths])
      .range([h - padding, padding]);

    actAreaGen = area()
      .x((d) => xScale(d.absoluteMonth))
      .y0(h - padding)
      .y1((d) => yScale(d['acm.mean']));
    actLineGen = line()
      .x((d) => xScale(d.absoluteMonth))
      .y((d) => yScale(d['acm.mean']));
    actBottomLineGen = area()
      .x((d) => xScale(d.absoluteMonth))
      .y0(0)
      .y1((d) => yScale(d['acm.mean']));
    expLineGen = line()
      .x((d) => xScale(d.absoluteMonth))
      .y((d) => yScale(d['expected.mean']));

    bottomArea = area()
      .x((d) => xScale(d.absoluteMonth))
      .y0(h - padding)
      .y1((d) => yScale(d['expected.mean']));
    topArea = area()
      .x((d) => xScale(d.absoluteMonth))
      .y0(0)
      .y1((d) => yScale(d['expected.mean']));

    // This is not actual Covid numbers - TODO: replace!
    covidArea = area()
      .x((d) => xScale(d.absoluteMonth))
      .y0(h - padding)
      .y1((d) => yScale(Math.abs(d['excess.mean'] / 4)));
  }

  let tooltipVisible = false;
  let mousePos = { x: -1, y: 0 };

  let component;
  let tooltipTargetPos = { x: 0, y: 0 };
  let highlight = null;

  const bisect = bisector((d) => d.absoluteMonth).left;

  function showTooltip(e) {
    tooltipVisible = true;

    const x = e.clientX;
    const y = e.clientY;

    tooltipTargetPos = { ...tooltipTargetPos, x, y };
  }
  function hideTooltip() {
    tooltipVisible = false;
    mousePos = { x: -1, y: 0 };
    highlight = null;
  }

  function moveCursor(e) {
    const bounds = component.getBoundingClientRect();
    const mouseX = xScale.invert(e.clientX - bounds.left).toFixed(0);
    mousePos = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };

    highlight = data[bisect(data, mouseX, 1)];
    console.log(highlight);

    showTooltip(e);
  }
</script>

<div class="excess-chart-multiple" bind:clientWidth={w} bind:this={component}>
  <svg
    width={w}
    height={h}
    on:mouseover={showTooltip}
    on:mouseout={hideTooltip}
    on:mousemove={moveCursor}
    on:focus={showTooltip}
    on:blur={hideTooltip}
  >
    {#if actLineGen}
      <defs>
        <clipPath id="{income}-bottom-area"><path d={bottomArea(data)} /></clipPath>
        <clipPath id="{income}-top-area"><path d={topArea(data)} /></clipPath>

        <pattern id="{income}-diagonalHatch" width="5" height="5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <svg:line x1="0" y1="0" x2="0" y2="10" style="stroke:blue; stroke-width:2" />
        </pattern>
        <pattern id="{income}-negativeDiagonalHatch" width="5" height="5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <svg:line x1="0" y1="0" x2="0" y2="10" style="stroke:var(--color-vis-red); stroke-width:2;" />
        </pattern>
      </defs>
      <rect x={padding} y={h - padding} width={w - padding} height="1" />

      <path clip-path="url(#{income}-bottom-area)" d={actBottomLineGen(data)} style="fill: var(--color-base-purple400); opacity: 0.5" />
      <path clip-path="url(#{income}-top-area)" d={actAreaGen(data)} style="fill: var(--color-base-red400); opacity: 0.5" />

      <path style="stroke: var(--color-vis-red);stroke-width: 3px" d={actLineGen(data)} fill="none" />

      <path d={expLineGen(data)} stroke="black" stroke-width="1" fill="transparent" />

      <path class="covid" d={covidArea(data)} />

      {#if mousePos.x > -1 && highlight}
        <g class="overlay">
          <rect
            x={xScale(highlight.absoluteMonth)}
            y={yScale(highlight['acm.mean'])}
            width={1}
            height={h - padding - yScale(highlight['acm.mean'])}
          />
          <HoverMarker x={xScale(highlight.absoluteMonth)} y={yScale(highlight['acm.mean'])} fill="var(--color-vis-red)" />
          <HoverMarker x={xScale(highlight.absoluteMonth)} y={yScale(highlight['expected.mean'])} fill="var(--color-grey-400)" />
          <HoverMarker
            x={xScale(highlight.absoluteMonth)}
            y={yScale(Math.abs(highlight['excess.mean'] / 4))}
            fill="var(--color-vis-cat8-8)"
          />
        </g>
      {/if}

      <text x={w / 2} y={h}>{income}</text>
    {/if}
  </svg>

  <Tooltip visible={tooltipVisible} targetPos={tooltipTargetPos}>
    {#if highlight}
      <p class="label small" style="margin-bottom: var(--space-2xs)">
        Deaths <Date month={highlight.month - 1} year={highlight.year} />
      </p>
      <p class="label caps stronger"><Number value={highlight['expected.mean']} /></p>
      <p class="label small">Expected</p>
      <hr />
      <p class="label caps stronger"><Number value={highlight['acm.mean']} /></p>
      <p class="small">Actual</p>
      <hr />
      <p class="label caps stronger">?</p>
      <p class="label small">Covid</p>
    {/if}
  </Tooltip>
</div>

<style type="text/scss">
  .excess-chart-multiple {
    flex-basis: 24%;

    text {
      text-anchor: middle;
    }

    .covid {
      fill: var(--color-vis-cat8-8);
    }

    .overlay {
      pointer-events: none;
    }
  }
</style>
