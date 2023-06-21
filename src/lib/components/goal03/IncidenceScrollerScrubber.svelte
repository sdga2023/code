<script>
  import { Number } from '$lib/components';
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import { scaleLinear, max, area, line, curveMonotoneX, min } from 'd3';

  export let richData;
  export let w;
  export let h;

  export let maxYear;

  export let accessors;

  export let baseColor;

  export let activeState;
  export let currentYear;

  $: absoluteAccessor = accessors.find((a) => a.absolute);

  const margins = {
    top: 10,
    left: 10,
    right: 0,
    bottom: 16
  };

  // calculate totals:
  let yearlyCases = [];
  $: if (richData?.length > 1) {
    yearlyCases = [];
    for (let year = 2000; year <= maxYear; year++) {
      let sum = richData.find((c) => c['Country Code'] === 'WLD' && c.type === absoluteAccessor.prop)?.[year];
      yearlyCases.push({ year, sum });
    }
  }

  $: xScale = scaleLinear()
    .domain([2000, maxYear])
    .range([margins.left, w - margins.left - margins.right]);

  $: dataExtent = [min(yearlyCases, (d) => d.sum), max(yearlyCases, (d) => d.sum)];

  $: yScale = scaleLinear()
    .domain(dataExtent)
    .range([h - margins.bottom, margins.top]);

  $: labelYScale = (v) => {
    let y = yScale(v) + 23;
    if (y > h / 2) {
      y -= 30;
    }
    return y;
  };

  $: caseline = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.sum))
    .curve(curveMonotoneX)(yearlyCases);
  $: casearea = area()
    .x((d) => xScale(d.year))
    .y1(yScale(0))
    .y0((d) => yScale(d.sum))
    .curve(curveMonotoneX)(yearlyCases);

  $: yearLabels = yearlyCases.filter((d) => (+d.year % 5 === 0 && +d.year !== 2020) || +d.year === maxYear);
  $: valueLabels = yearlyCases.filter((d, i) => i === 0 || i === yearlyCases.length - 1);

  function updateMouse(evt) {
    let mousePos = { x: evt.layerX, y: evt.layerY };
    currentYear = Math.round(xScale.invert(mousePos.x));

    if (currentYear < 2000) currentYear = 2000;
    if (currentYear > maxYear) currentYear = maxYear;
  }
</script>

<g style="--base-color: {baseColor}" class="linechart">
  <rect x={xScale(2019.25)} y={0} width={xScale(2021) - xScale(2019.25)} height={1000} class="annotated-area" />
  <text x={xScale(maxYear)} y={18} class="label end caps">COVID-19</text>

  <path d={caseline} class="bg" />
  <path d={caseline} class="line" />
  {#each valueLabels as label, i}
    <circle cx={xScale(label.year)} cy={yScale(label.sum)} r={LineChartCircleRadius} />
    <text
      x={xScale(label.year)}
      y={labelYScale(label.sum)}
      class="label"
      class:stronger={label.year === maxYear}
      class:first={i === 0}
      class:last={i === valueLabels.length - 1}
    >
      <Number value={label.sum} digits={0} />{` `}</text
    >
  {/each}
  {#each yearLabels as label, i}
    <text x={xScale(label.year)} y={h - 2} class="label weaker small" class:first={i === 0} class:last={i === yearLabels.length - 1}
      >{label.year}</text
    >
  {/each}
  {#each yearlyCases.filter((d) => d.year === currentYear) as active}
    <rect x={xScale(active.year)} y={yScale(active.sum)} width={1} height={1000} class="scrub" />
    <circle cx={xScale(active.year)} cy={yScale(active.sum)} r={LineChartCircleRadius} />
    <text
      x={xScale(active.year)}
      y={labelYScale(active.sum)}
      class="label"
      class:stronger={active.year === maxYear}
      class:first={active.year === 2000}
      class:last={active.year === maxYear}
    >
      <Number value={active.sum} digits={0} />{` `}</text
    >
    <text
      x={xScale(active.year)}
      y={h - 2}
      class="label stronger small"
      class:first={active.year === 2000}
      class:last={active.year === maxYear}>{active.year}</text
    >
  {/each}

  <rect
    class="interactive"
    x={margins.left}
    y={0}
    width={w - margins.left - margins.right}
    height={h}
    on:pointerover={updateMouse}
    on:pointermove={updateMouse}
  />
</g>

<style type="scss">
  circle {
    fill: var(--base-color);
  }

  .label {
    text-anchor: middle;
  }
  .label.first {
    text-anchor: start;
  }
  .label.last {
    text-anchor: end;
  }

  .scrub {
    fill: var(--base-color);
  }

  path.area {
    fill: var(--base-color);
  }
  path.line {
    fill: none;
    stroke: var(--base-color);
  }

  .interactive {
    fill: none;
  }
</style>
