<script>
  import { ChartGrid, Tooltip, Number, CategoricalLegend } from '$lib/components';
  import { isMobile } from '$lib/stores/isMobile';
  import { extent, scaleLinear, min, max, line, curveNatural } from 'd3';

  export let data;
  export let unit_label = 'billion USD';

  const yearAcc = (d) => d?.Year;

  const keyOrder = ['Remittances (BPM6)', 'FDI', 'PF', 'ODA'];
  const keys = {
    'Remittances (BPM6)': 'Remittances',
    FDI: 'Foreign Direct Investments (FDI)',
    ODA: 'ODA',
    PF: 'Portfolio debt and equity flows'
  };

  const colorMap = {
    'Remittances (BPM6)': 'var(--color-vis-cat8-2)',
    FDI: 'var(--color-vis-cat8-1)',
    ODA: 'var(--color-vis-blue)',
    PF: 'var(--color-vis-cat8-3)'
  };

  const margins = {
    top: 20,
    right: 0,
    bottom: 0,
    left: 60
  };

  let w = 1;
  $: h = $isMobile ? 450 : 600;

  $: years = Array.from(new Set(data.map(yearAcc)));
  $: yearsRange = extent(years);

  $: lineGen = line()
    .defined((d) => d.year && d.value)
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value))
    .curve(curveNatural);

  $: xScale = scaleLinear().domain(yearsRange).range([margins.left, w]);

  $: yScale = scaleLinear()
    .domain([min(data.map((d) => keyOrder.map((key) => d[key])).flat()), max(data.map((d) => keyOrder.map((key) => d[key])).flat())])
    .range([h - margins.bottom - margins.top, margins.top])
    .nice();

  let mousePos;
  let hoverYear;
  function updateMouse(evt) {
    const relativeX = evt.layerX;
    mousePos = { x: evt.clientX, y: evt.clientY };

    let activeYear = Math.round(xScale.invert(relativeX));
    if (activeYear < yearsRange[0]) {
      activeYear = yearsRange[0];
    }
    if (activeYear > yearsRange[1]) {
      activeYear = yearsRange[1];
    }
    hoverYear = data.find((d) => yearAcc(d) === activeYear);
  }
  function clearHover() {
    hoverYear = null;
  }
</script>

<div class="svg-container linechart" bind:clientWidth={w} bind:clientHeight={h}>
  <svg width={w} height={h}>
    <g transform="translate({margins.left}px, {margins.top}px)">
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xScale.ticks()}
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
      <line x1={0} x2={w} y1={yScale(0)} y2={yScale(0)} style:stroke="var(--color-grey-800)" />
      {#each keyOrder as key}
        <path class="bg" class:main={key === 'ODA'} d={lineGen(data.map((d) => ({ year: yearAcc(d), value: d[key] })))} />
        <path class:main={key === 'ODA'} d={lineGen(data.map((d) => ({ year: yearAcc(d), value: d[key] })))} style:stroke={colorMap[key]} />
      {/each}
      {#if hoverYear}
        <rect x={xScale(yearAcc(hoverYear))} width="1" y={0} height={h} style:fill="var(--color-grey-600)" />
        {#each keyOrder as key}
          <g transform="translate({xScale(yearAcc(hoverYear))}, {yScale(hoverYear[key])})">
            <circle r="4" style:fill={colorMap[key]} />
          </g>
        {/each}
      {/if}
      <rect
        x="0"
        y="0"
        width={w}
        height={h}
        class="interactive"
        on:mouseover={(e) => updateMouse(e)}
        on:mousemove={(e) => updateMouse(e)}
        on:mouseout={(e) => clearHover()}
      />
    </g>
  </svg>
</div>
<CategoricalLegend legendType="custom" customItems={keyOrder.map((key) => ({ key: keys[key], colour: colorMap[key] }))} />
{#if hoverYear}
  <Tooltip visible={true} targetPos={mousePos}
    ><p class="label geo">{yearAcc(hoverYear)}</p>
    {#each keyOrder as key}
      <p class="number">
        <span class="circle" style:background-color={colorMap[key]} />
        <Number value={hoverYear[key]} digits="0" fallback="-" />&nbsp;{unit_label}
      </p>
      <p class="label small weaker">{keys[key]}</p>
    {/each}</Tooltip
  >
{/if}

<style>
  path.main.bg {
    stroke-width: 10px;
  }
  path.main {
    stroke-width: 6px;
  }

  span.circle {
    width: 10px;
    height: 10px;
    display: inline-block;
    border-radius: 100%;
  }

  rect.interactive {
    opacity: 0;
  }
</style>
