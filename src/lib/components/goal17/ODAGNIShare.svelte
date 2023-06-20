<script>
  import { min, max, extent, scaleLinear, area, line, curveMonotoneX } from 'd3';
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';

  import * as Colors from '$lib/styles/tokens.es6.js';
  import { Number, Tooltip } from '$lib/components';

  import { LineChartCircleRadius } from '$lib/styles/vis';
  import ChartGrid from '../ChartGrid.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import CountryPicker from '../general/CountryPicker.svelte';
  import countryPickerCountries from '../../../data/other/wb_countries_iso3.json';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let parentWidth;
  export let number_label = 'billion USD';
  export let billion_label = 'billion';

  export let oda_goal_label = 'ODA goal';
  export let of_gni_label = ' of GNI';
  export let oda_goal_explicit_label = 'ODA goal of 0.7% GNI';
  export let oda_label = 'Total ODA';
  export let actual_oda_label = 'Actual ODA';
  export let difference_label = 'Difference to ODA goal';

  const exists = (d) => d;
  const myExtent = (d, a) => (d ? extent(d, a) : [0, 0]);
  const myMax = (d, a) => (d ? max(d, a) : 0);

  $: w = parentWidth;
  let h = 640;

  const GNI_LIMIT = 0.7;

  let margins = {
    top: 30,
    right: 15,
    bottom: 20,
    left: 20
  };

  const ACC_ATTRIBUTE = 'viz_odagni_pct';
  let acc = (d) => d?.[ACC_ATTRIBUTE];
  const AREA_ACC_ATTRIBUTE = 'viz_oda_usdmn';
  let areaAcc = (d) => d?.[AREA_ACC_ATTRIBUTE];
  let POINT_SEVEN = 'point_seven';
  let pointSevenAcc = (d) => d?.[POINT_SEVEN];

  $: countries = ['DAC'];
  $: enrichedData = data
    ? data
        .filter((d) => d.iso3 === 'DAC')
        .map((d) => {
          const pointSeven = (0.7 / acc(d)) * areaAcc(d);
          return { ...d, [POINT_SEVEN]: pointSeven };
        })
        .sort((a, b) => a.year - b.year)
    : [];

  $: averageSpending = data ? data.filter((d) => d.iso3 === 'DAC').sort((a, b) => yearAccessor(a) - yearAccessor(b)) : [];

  $: availableCountries = countryPickerCountries.filter((iso) => !countries.includes(iso));

  let yearAccessor = (d) => d?.year;
  $: years = myExtent(data, (d) => yearAccessor(d));
  $: midYear = years[0] + (years[1] - years[0]) / 2;
  $: allYears = Array.from(new Set(data?.map((d) => yearAccessor(d)))).sort((a, b) => a - b);

  $: maxYear = max(enrichedData, yearAccessor);

  let xScale;
  let yScale;
  let lineGenerator, areaGenerator, pointSevenAreaGenerator, pointSevenLineGenerator;

  $: if (enrichedData) {
    xScale = scaleLinear()
      .domain(myExtent(data, (d) => yearAccessor(d)))
      .range([0, w - margins.left - margins.right]);

    yScale = scaleLinear()
      .domain([0, myMax(enrichedData, (d) => pointSevenAcc(d))])
      .range([h - margins.top - margins.bottom, 0]);

    if (xScale && yScale) {
      lineGenerator = line()
        .defined((d) => acc(d))
        .x((d) => xScale(yearAccessor(d)))
        .y((d) => yScale(areaAcc(d)))
        .curve(curveMonotoneX);

      areaGenerator = area()
        .defined((d) => areaAcc(d))
        .x((d) => xScale(yearAccessor(d)))
        .y0(h - margins.top - margins.bottom)
        .y1((d) => yScale(areaAcc(d)));

      pointSevenAreaGenerator = area()
        .defined((d) => pointSevenAcc(d))
        .x((d) => xScale(yearAccessor(d)))
        .y0((d) => yScale(areaAcc(d)))
        .y1((d) => yScale(pointSevenAcc(d)))
        .curve(curveMonotoneX);

      pointSevenLineGenerator = line()
        .defined((d) => pointSevenAcc(d))
        .x((d) => xScale(yearAccessor(d)))
        .y((d) => yScale(pointSevenAcc(d)))
        .curve(curveMonotoneX);
    }
  }

  $: yearGap = $isMobile ? 10 : 5;

  $: yearLabels = Array.from(
    new Set(data?.map((d) => yearAccessor(d)).filter((d) => (d % yearGap === 0 && d !== 2020) || d === 2022))
  ).filter(exists);
  $: valueLabels = enrichedData.filter((d, i) => i === 0);

  $: currentYear = maxYear;
  $: currentYearData = enrichedData.find((d) => yearAccessor(d) === currentYear);

  let yTicks = [];

  $: if (yScale) {
    yTicks = yScale.ticks();
  }

  let currentYear = 2021;
  let tooltipTargetPos;

  function hover(e) {
    const bounds = e.target.getBoundingClientRect();

    let x = e.clientX - bounds.x;
    let y = e.clientY;

    const yearDistHalf = (xScale(2020) - xScale(2019)) / 2;
    currentYear = Math.floor(xScale.invert(x + yearDistHalf));

    if (currentYear < years[0]) {
      currentYear = years[0];
    }
    if (currentYear > years[1]) {
      currentYear = years[1];
    }

    let mousePos = { x: e.clientX, y: e.clientY };

    // y = yScale(pointSevenAcc(enrichedData.find((d) => yearAccessor(d) === currentYear)));
    //console.log(y);

    tooltipTargetPos = { ...tooltipTargetPos, x, y, mousePos };
  }
</script>

{#if w}
  <svg
    width={w}
    height={h}
    on:mouseover={hover}
    on:mousemove={hover}
    on:mouseout={() => (tooltipTargetPos = null)}
    on:focus={hover}
    on:blur={() => (tooltipTargetPos = null)}
    class="linechart"
  >
    <defs>
      <pattern
        id="myDiagonalHatch"
        width="100px"
        height="5px"
        patternUnits="userSpaceOnUse"
        patternContentUnits="userSpaceOnUse"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        patternTransform="rotate(90)"
      >
        <line x1="0" x2="100" y1="50" y2="50" stroke-width="10" style="stroke: var(--color-vis-reference);" />
      </pattern>
    </defs>
    <g transform={`translate(${0},${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={number_label}
        formatter={(d) => d / 1000}
      />
    </g>
    <g transform={`translate(${margins.left},${margins.top})`}>
      {#if xScale && yScale}
        {#each countries as iso3}
          <path d={areaGenerator(enrichedData.filter((d) => d.iso3 === iso3))} class="area" />
          <path d={pointSevenAreaGenerator(enrichedData.filter((d) => d.iso3 === iso3))} class="area missing" />
        {/each}

        <path d={lineGenerator(averageSpending)} class="bg average" />
        <path d={lineGenerator(averageSpending)} class="average" />

        <text class="label end" x={xScale(2020)} y={yScale(pointSevenAcc(enrichedData.find((d) => yearAccessor(d) === 2010))) + 40}
          >{oda_goal_explicit_label}</text
        >
        <text class="label end" x={xScale(2020)} y={yScale(areaAcc(enrichedData.find((d) => yearAccessor(d) === 2010))) + 40}
          >{oda_label}</text
        >

        {#if currentYear}
          <line
            x1={xScale(currentYear)}
            x2={xScale(currentYear)}
            y1={yScale(areaAcc(currentYearData))}
            y2={yScale(0)}
            style:stroke="var(--color-vis-binary-pos)"
            stroke-width="2"
          />
          <line
            x1={xScale(currentYear)}
            x2={xScale(currentYear)}
            y1={yScale(pointSevenAcc(currentYearData))}
            y2={yScale(areaAcc(currentYearData))}
            style:stroke="var(--color-vis-binary-neg)"
            stroke-width="2"
          />
          <circle
            cx={xScale(currentYear)}
            cy={yScale(areaAcc(currentYearData))}
            r="4"
            style:fill="var(--color-vis-binary-pos)"
            style:stroke="white"
            style:stroke-width="1.5px"
          />
          <circle
            cx={xScale(currentYear)}
            cy={yScale(pointSevenAcc(currentYearData))}
            r="4"
            style:fill="var(--color-vis-binary-neg)"
            style:stroke="white"
            style:stroke-width="1.5px"
          />
        {/if}

        {#each [...yearLabels, currentYear].filter(exists) as label}
          <text
            x={xScale(label)}
            y={yScale(0) + 12}
            class="label middle small"
            class:weaker={label !== currentYear}
            class:stronger={label === currentYear}>{label}</text
          >
        {/each}
      {/if}
    </g>
  </svg>
{/if}
{#if tooltipTargetPos}
  <Tooltip visible={true} targetPos={tooltipTargetPos.mousePos}>
    <p>
      {oda_goal_label}
      <span class="label stronger">{currentYear}:</span>
      <span class="number"><Number value={pointSevenAcc(currentYearData) / 1000} digits={2} unit="$" /></span>
      {billion_label}
    </p>
    <hr />
    <p class="label small">{actual_oda_label}</p>
    <p>
      <span class="number" style:color="var(--color-vis-binary-pos)"
        ><Number value={areaAcc(currentYearData) / 1000} digits={2} unit="$" /></span
      >
      {billion_label} (<span class="number"><Number value={acc(currentYearData)} digits="2" unit="%" /></span>
      {of_gni_label})
    </p>
    <hr />
    <p class="label small">{difference_label}</p>
    <p>
      <span class="number" style:color="var(--color-vis-binary-neg)"
        ><Number value={(areaAcc(currentYearData) - pointSevenAcc(currentYearData)) / 1000} digits={2} unit="$" /></span
      >
      {billion_label}
    </p>
  </Tooltip>
{/if}

<style>
  svg line,
  svg circle,
  svg text {
    pointer-events: none;
  }

  .linechart path.area:not(.missing) {
    fill: var(--color-vis-binary-pos);
  }
  .linechart path.area.missing {
    opacity: 1;
    stroke-width: 1px;
    fill: url(#myDiagonalHatch);
    stroke: var(--color-grey-300);
  }
  .linechart path.bg.average {
    stroke: white;
  }
  .linechart .average {
    stroke: var(--color-vis-binary-pos);
  }

  circle {
    fill: none;
    stroke: var(--color-vis-reference);
  }
</style>
