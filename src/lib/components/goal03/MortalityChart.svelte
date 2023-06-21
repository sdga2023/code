<script>
  import { max, extent, scaleLinear, area, line, curveMonotoneX } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import { Number } from '$lib/components';
  import { LineChartCircleRadius } from '$lib/styles/vis';

  export let data;
  export let parentWidth;
  export let yearAccessor;
  export let metrics;
  export let numberLabel = '';
  export let fillColor;
  export let textLabelizer = (d) => d;

  export let maxYear = 2020;

  $: w = parentWidth;
  let h = 320;

  let acc = (d) => metrics.reduce((sum, metric) => sum + d[metric], 0);

  let margins = {
    top: 30,
    right: 32,
    bottom: 20,
    left: 32
  };
  let xScale;
  let yScale;
  let lineGenerator;
  let areaGenerator;

  $: if (data)
    xScale = scaleLinear()
      .domain(extent(data, (d) => yearAccessor(d)))
      .range([0, w - margins.left - margins.right]);
  $: if (data) {
    yScale = scaleLinear()
      .domain([0, max(data, (d) => acc(d))])
      .range([h - margins.top - margins.bottom, 0]);
  }
  $: if (xScale && yScale)
    lineGenerator = line()
      .x((d) => xScale(yearAccessor(d)))
      .y((d) => yScale(acc(d)))
      .curve(curveMonotoneX);

  $: if (xScale && yScale)
    areaGenerator = area()
      .x((d) => xScale(yearAccessor(d)))
      .y0(yScale(0))
      .y1((d) => yScale(acc(d)))
      .curve(curveMonotoneX);

  $: yearLabels = data.filter((d) => (yearAccessor(d) % 5 === 0 && yearAccessor(d) !== 2020) || yearAccessor(d) === maxYear);
  $: valueLabels = data.filter((d, i) => i === 0 || i === data.length - 1 || yearAccessor(d) === 2019);

  let currentYear = maxYear;
  $: currentYearData = data.find((d) => yearAccessor(d) === currentYear);

  function updateMouse(evt) {
    let mousePos = { x: evt.layerX, y: evt.layerY };
    currentYear = Math.round(xScale.invert(mousePos.x - margins.left));

    if (currentYear < 2000) currentYear = 2000;
    if (currentYear > maxYear) currentYear = maxYear;
  }
</script>

<div class="mortality-chart">
  {#if w}
    <svg width={w} height={h} on:mousemove={updateMouse} class="linechart">
      <g transform={`translate(${margins.left},${margins.top})`}>
        {#if xScale && yScale}
          <rect
            x={xScale(2019)}
            width={xScale(maxYear) - xScale(2019)}
            y={0}
            height={h - margins.bottom - margins.top}
            class="annotated-area"
          />
          <text x={xScale(maxYear)} y={18} class="label end caps">{$_('covid', { default: 'COVID-19' })}</text>

          <rect
            x={xScale(currentYear)}
            width={1}
            y={yScale(acc(currentYearData))}
            height={yScale(0) - yScale(acc(currentYearData))}
            style={`fill: ${fillColor}`}
          />

          <path d={areaGenerator(data)} style:fill={fillColor} class="area" />
          <path d={lineGenerator(data)} class="bg" />
          <path d={lineGenerator(data)} stroke={fillColor} />

          {#each [...valueLabels, currentYearData] as label}
            <circle cx={xScale(yearAccessor(label))} cy={yScale(acc(label))} r={LineChartCircleRadius} fill={fillColor} />
            <text
              x={xScale(yearAccessor(label))}
              y={yearAccessor(label) == maxYear || yearAccessor(label) === 2000 ? yScale(acc(label)) - 10 : yScale(acc(label)) + 23}
              class={yearAccessor(label) === 2000 ? 'label start' : yearAccessor(label) === maxYear ? 'label end' : 'label middle'}
              class:stronger={yearAccessor(label) === maxYear}
            >
              <Number value={textLabelizer(acc(label))} digits={2} />{` `}{numberLabel}</text
            >
          {/each}
          {#each [...yearLabels, currentYearData] as label}
            <text x={xScale(yearAccessor(label))} y={yScale(0) + 12} class="label middle weaker small">{yearAccessor(label)}</text>
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
</div>
