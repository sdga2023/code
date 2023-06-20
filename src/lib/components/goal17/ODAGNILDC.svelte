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

  export let data;
  export let parentWidth;
  export let number_label = 'billion USD';
  export let billion_label = 'billion';

  export let oda_goal_label = 'ODA goals to LDCs';
  export let of_gni_label = 'of GNI';
  export let oda_goal_explicit_label = '0.15% to 0.2% of GNI';
  export let oda_label = 'Total ODA to LDCs';
  export let actual_oda_label = 'Actual ODA to LDCs';
  export let difference_label = 'Difference to ODA goal of at least';

  const exists = (d) => d;
  const myExtent = (d, a) => (d ? extent(d, a) : [0, 0]);
  const myMax = (d, a) => (d ? max(d, a) : 0);

  $: w = parentWidth;
  let h = 450;

  let margins = {
    top: 30,
    right: 15,
    bottom: 20,
    left: 20
  };

  const ACC_ATTRIBUTE = 'viz_oda_ldc_pctgni';
  let acc = (d) => d?.[ACC_ATTRIBUTE];
  const AREA_ACC_ATTRIBUTE = 'viz_oda_ldc_usdmn';
  let areaAcc = (d) => d?.[AREA_ACC_ATTRIBUTE];
  let POINT_FIFTEEN = 'point_fifteen';
  let pointFifteenAcc = (d) => d?.[POINT_FIFTEEN];
  let POINT_TWENTY = 'point_twenty';
  let pointTwentyAcc = (d) => d?.[POINT_TWENTY];
  let yearAccessor = (d) => d?.year;

  $: countries = ['DAC'];
  $: enrichedData = data
    ? data
        .filter((d) => d.iso3 === 'DAC' && acc(d))
        .map((d) => {
          const pointFifteen = (0.15 / acc(d)) * areaAcc(d);
          const pointTwenty = (0.2 / acc(d)) * areaAcc(d);
          return { ...d, [POINT_FIFTEEN]: pointFifteen, [POINT_TWENTY]: pointTwenty };
        })
        .sort((a, b) => a.year - b.year)
    : [];

  $: availableCountries = countryPickerCountries.filter((iso) => !countries.includes(iso));

  $: years = myExtent(enrichedData, (d) => yearAccessor(d));
  $: midYear = years[0] + (years[1] - years[0]) / 2;
  $: allYears = Array.from({ length: 1 + years[1] - years[0] }, (_, i) => years[0] + i);

  $: maxYear = max(enrichedData, yearAccessor);

  let xScale;
  let yScale;
  let lineGenerator,
    areaGenerator,
    pointFifteenAreaGenerator,
    pointTwentyAreaGenerator,
    pointFifteenLineGenerator,
    pointTwentyLineGenerator;

  $: if (enrichedData) {
    xScale = scaleLinear()
      .domain(years)
      .range([0, w - margins.left - margins.right]);

    yScale = scaleLinear()
      .domain([0, myMax(enrichedData, (d) => pointTwentyAcc(d))])
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

      pointFifteenAreaGenerator = area()
        .defined((d) => pointFifteenAcc(d))
        .x((d) => xScale(yearAccessor(d)))
        .y0((d) => yScale(areaAcc(d)))
        .y1((d) => yScale(pointFifteenAcc(d)));

      pointTwentyAreaGenerator = area()
        .defined((d) => pointFifteenAcc(d) && pointTwentyAcc(d))
        .x((d) => xScale(yearAccessor(d)))
        .y0((d) => yScale(pointFifteenAcc(d)))
        .y1((d) => yScale(pointTwentyAcc(d)));

      pointFifteenLineGenerator = line()
        .defined((d) => pointFifteenAcc(d))
        .x((d) => xScale(yearAccessor(d)))
        .y((d) => yScale(pointFifteenAcc(d)))
        .curve(curveMonotoneX);

      pointTwentyLineGenerator = line()
        .defined((d) => pointTwentyAcc(d))
        .x((d) => xScale(yearAccessor(d)))
        .y((d) => yScale(pointTwentyAcc(d)))
        .curve(curveMonotoneX);
    }
  }

  $: yearLabels = Array.from(new Set(data?.map((d) => yearAccessor(d)).filter((d) => (d % 5 === 0 && d !== 2020) || d === 2021))).filter(
    exists
  );
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
        id="LDCDiagonalHatch"
        width="100px"
        height="5px"
        patternUnits="userSpaceOnUse"
        patternContentUnits="userSpaceOnUse"
        viewBox="0 0 10 5"
        preserveAspectRatio="none"
        patternTransform="rotate(90)"
      >
        <line x1="0" x2="10" y1="5" y2="5" stroke-width="1" style:stroke="var(--color-vis-reference)" />
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
          <path d={pointTwentyAreaGenerator(enrichedData.filter((d) => d.iso3 === iso3))} class="area" style:fill="var(--color-grey-400)" />
          <path d={pointTwentyAreaGenerator(enrichedData.filter((d) => d.iso3 === iso3))} class="area missing" />
          <path d={pointFifteenAreaGenerator(enrichedData.filter((d) => d.iso3 === iso3))} class="area missing" />
        {/each}

        <!--
        <path d={pointFifteenLineGenerator(enrichedData)} class="bg gni-limit" />
        <path d={pointTwentyLineGenerator(enrichedData)} class="bg gni-limit" />


        <path d={pointFifteenLineGenerator(enrichedData)} class="gni-limit" />
        <path d={pointTwentyLineGenerator(enrichedData)} class="gni-limit" />

        -->

        <!-- actual ODA top line: -->
        <path d={lineGenerator(enrichedData)} class="bg average" />
        <path d={lineGenerator(enrichedData)} class="average" />
        <text x={xScale(2020)} y={yScale(92000)} class="stronger end">{oda_goal_label}</text>
        <text
          class="label end"
          x={xScale(2020)}
          y={yScale(
            (pointTwentyAcc(enrichedData.find((d) => yearAccessor(d) === 2014)) -
              pointFifteenAcc(enrichedData.find((d) => yearAccessor(d) === 2014))) /
              2 +
              pointFifteenAcc(enrichedData.find((d) => yearAccessor(d) === 2014))
          )}>{oda_goal_explicit_label}</text
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
            y1={yScale(pointTwentyAcc(currentYearData))}
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
            cy={yScale(pointFifteenAcc(currentYearData))}
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
      <span class="label stronger">{currentYear}</span>
      {oda_goal_label}
    </p>
    <p>
      <span class="number"
        ><Number value={pointFifteenAcc(currentYearData) / 1000} digits={2} unit="$" /> - <Number
          value={pointTwentyAcc(currentYearData) / 1000}
          digits={2}
          unit="$"
        />
      </span>
      {billion_label}
    </p>
    <hr />
    <p class="label small">{actual_oda_label}</p>
    <p>
      <span class="number" style:color="var(--color-vis-binary-pos)"
        ><Number value={areaAcc(currentYearData) / 1000} digits={2} unit="$" /></span
      >
      {billion_label} (<span class="number"><Number value={acc(currentYearData)} digits="2" unit="%" /></span>
      {' '}{of_gni_label})
    </p>
    <hr />
    <p class="label small">{difference_label}</p>
    <p>
      <span class="number" style:color="var(--color-vis-binary-neg)"
        ><Number value={(areaAcc(currentYearData) - pointFifteenAcc(currentYearData)) / 1000} digits={2} unit="$" /></span
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
    fill: url(#LDCDiagonalHatch);
  }
  .linechart path.bg.average {
    stroke: white;
  }
  .linechart .average {
    stroke: var(--color-vis-binary-pos);
  }

  svg path.gni-limit {
    stroke: var(--color-vis-reference);
    stroke-width: 2;
  }

  circle {
    fill: none;
    stroke: var(--color-vis-reference);
  }
</style>
