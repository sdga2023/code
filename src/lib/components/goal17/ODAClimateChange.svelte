<script>
  import { ChartGrid, Tooltip, Number, CategoricalLegend } from '$lib/components';
  import { isMobile } from '$lib/stores/isMobile';
  import { scaleBand, scaleLinear, max, stack } from 'd3';

  export let data;
  export let unit_label = 'billion USD';

  const acc = (d) => d?.total_climate;
  const yearAcc = (d) => d?.year;

  const keyOrder = ['climate_adapt_only', 'climate_adaptmitig', 'climate_mitig_only'];
  const keys = { climate_mitig_only: 'Mitigation', climate_adaptmitig: 'Adaptation and mitigation', climate_adapt_only: 'Adaptation' };

  const colorMap = {
    climate_mitig_only: 'var(--color-vis-cat8-1)',
    climate_adaptmitig: 'var(--color-vis-cat8-2)',
    climate_adapt_only: 'var(--color-vis-cat8-3)'
  };

  $: margins = {
    top: 20,
    right: 0,
    bottom: 0,
    left: $isMobile ? 60 : 100
  };

  let w = 1;
  $: h = $isMobile ? 450 : 600;

  $: years = Array.from(new Set(data.map(yearAcc)));

  $: stacked = stack().keys(keyOrder)(data);

  $: xScale = scaleBand().domain(years).range([margins.left, w]).paddingInner(0.5);

  $: yScale = scaleLinear()
    .domain([0, max(data, acc)])
    .range([h - margins.bottom - margins.top, margins.top])
    .nice();

  let mousePos;
  let hoverYear;
  function updateMouse(evt, bar) {
    if (!bar) {
      hoverYear = null;
    } else {
      hoverYear = bar;
    }
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
</script>

<div class="svg-container" bind:clientWidth={w} bind:clientHeight={h}>
  <svg width={w} height={h}>
    <g transform="translate({margins.left}px, {margins.top}px)">
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={years}
        hideLines
      />
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w}
        scale={yScale}
        ticks={yScale.ticks()}
        yAxisUnits={unit_label}
      />

      {#each stacked as key}
        {#each key as d}
          <rect
            class:hovered={d.data.year === hoverYear?.data?.year}
            x={xScale(d.data.year) - xScale.bandwidth() / 2}
            width={xScale.bandwidth()}
            y={yScale(d[1])}
            height={yScale(d[0]) - yScale(d[1])}
            style:fill={colorMap[key.key]}
            on:mouseover={(e) => updateMouse(e, d)}
            on:mousemove={(e) => updateMouse(e, d)}
            on:mouseout={(e) => updateMouse(e)}
          />
        {/each}
      {/each}
    </g>
  </svg>
</div>
<CategoricalLegend legendType="custom" customItems={keyOrder.map((key) => ({ key: keys[key], colour: colorMap[key] }))} />
{#if hoverYear}
  <Tooltip visible={true} targetPos={mousePos}
    ><p class="label geo">{hoverYear.data.year}</p>
    {#each [...keyOrder].reverse() as key}
      <p class="number">
        <span class="circle" style:background-color={colorMap[key]} />
        <Number value={hoverYear.data[key]} digits="0" />&nbsp;{unit_label}
      </p>
      <p class="label small weaker">{keys[key]}</p>
    {/each}</Tooltip
  >
{/if}

<style>
  rect.hovered {
    stroke: white;
    stroke-width: 2px;
  }

  span.circle {
    width: 10px;
    height: 10px;
    display: inline-block;
    border-radius: 100%;
  }
</style>
