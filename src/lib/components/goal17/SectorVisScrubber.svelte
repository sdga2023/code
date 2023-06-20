<script>
  import { Number } from '$lib/components';
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import { scaleLinear, scaleSqrt, max, area, line, curveMonotoneX, min, extent, stack } from 'd3';

  export let data;
  export let w;
  export let h;

  export let COLORMAP;

  export let unit_label;

  export let years;
  export let currentYear;
  export let highlightedTops;

  let baseColor = 'black';

  const margins = {
    top: 10,
    left: 10,
    right: 0,
    bottom: 16
  };

  $: sectors = Array.from(new Set(data.map((d) => d.sec))) ?? [];
  $: sectorTops = sectors.reduce((acc, sector) => {
    acc[sector] = Array.from(new Set(data.filter((d) => d.sec === sector).map((d) => d.top)));
    return acc;
  }, {});

  // fetch totals:
  let yearlyCases = [];
  $: if (data) {
    yearlyCases = [];
    for (let year = years[0]; year <= years[1]; year++) {
      let sum = data.filter((d) => d.year === year).reduce((acc, val) => acc + val.amount, 0);
      let sectorVals = sectors.reduce((acc, sector) => {
        const val = data.filter((d) => d.year === year && d.sec === sector).reduce((a, v) => a + v.amount, 0);
        acc[sector] = val;
        return acc;
      }, {});
      yearlyCases.push({ year, sum, ...sectorVals });
    }
  }

  $: xScale = scaleLinear()
    .domain(years)
    .range([margins.left, w - margins.left - margins.right]);

  $: dataExtent = [min(yearlyCases, (d) => d.sum), max(yearlyCases, (d) => d.sum)];

  $: yScale = scaleLinear()
    .domain([0, dataExtent[1]])
    .range([h - margins.bottom, margins.top]);

  $: labelYScale = (v) => {
    let y = yScale(v) + 23;
    if (y > h / 2) {
      y -= 30;
    }
    return y;
  };

  $: sectorStack = stack().keys(sectors)(yearlyCases);

  $: sectorLines = sectors.reduce((acc, sector, i) => {
    acc[sector] = area()
      .x((d) => xScale(d?.data?.year))
      .y0(([y1]) => yScale(y1))
      .y1(([, y2]) => yScale(y2))
      .curve(curveMonotoneX);

    return acc;
  }, {});

  $: yearLabels = new Array(years[1] - years[0] + 1).fill(0).map((d, i) => ({ year: years[0] + i }));
  $: valueLabels = yearlyCases.filter((d, i) => i === 0 || i === yearlyCases.length - 1);

  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.offsetX, y: evt.offsetY };
    currentYear = Math.round(xScale.invert(mousePos.x));

    if (currentYear < years[0]) currentYear = years[0];
    if (currentYear > years[1]) currentYear = years[1];
  }
</script>

<div class="sector-vis-scrubber">
  <p class="label">Total spending across sectors (in {unit_label})</p>
  <svg width={w} height={h}>
    <g style="--base-color: {baseColor}" class="linechart">
      <!--
    <rect x={xScale(2019.25)} y={0} width={xScale(2021) - xScale(2019.25)} height={1000} class="annotated-area" />
    <text x={xScale(years[1])} y={18} class="label end caps">COVID-19</text>
    -->

      <!--
    <path d={caseline(yearlyCases)} class="bg" />
    <path d={caseline(yearlyCases)} class="line" />
    -->

      {#each sectors as sector}
        <path
          class:highlighted={sectorTops[sector].some((top) => highlightedTops.includes(top))}
          d={sectorLines[sector](sectorStack.find((d) => d.key === sector))}
          style:fill={COLORMAP[sector]}
          stroke={COLORMAP[sector]}
        />
      {/each}

      {#each valueLabels as label, i}
        <text
          x={xScale(label.year)}
          y={labelYScale(label.sum)}
          class="label"
          class:stronger={label.year === years[1]}
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
          class:stronger={active.year === years[1]}
          class:first={active.year === years[0]}
          class:last={active.year === years[1]}
        >
          <Number value={active.sum} digits={0} />{` `}</text
        >
        <text
          x={xScale(active.year)}
          y={h - 2}
          class="label stronger small"
          class:first={active.year === years[0]}
          class:last={active.year === years[1]}>{active.year}</text
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
  </svg>
</div>

<style type="scss">
  .sector-vis-scrubber {
    align-self: center;
  }

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

  path {
    opacity: 0.2;
  }
  path.highlighted {
    opacity: 1;
    stroke: black;
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
