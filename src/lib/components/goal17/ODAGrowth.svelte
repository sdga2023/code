<script>
  import { min, max, extent, scaleLinear, area, line, curveMonotoneX, stack } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { Number } from '$lib/components';
  import { _ } from 'svelte-i18n';
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import ChartGrid from '../ChartGrid.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let parentWidth;
  export let number_label = ' billion $';
  export let label_1 = '';
  export let label_2 = '';
  export let textLabelizer = (d) => d / 1000;

  const exists = (d) => d;

  $: w = parentWidth;
  let h = 600;

  $: barWidth = $isMobile ? 20 : 40;

  let margins = {
    top: 50,
    right: 0,
    bottom: 20,
    left: 20
  };

  $: enrichedData = data ? data.filter((d) => d.iso3 === 'DAC').sort((a, b) => a.year - b.year) : [];

  let focusYears = [2019, 2022];

  let yearAccessor = (d) => d?.year;
  $: years = extent(enrichedData, (d) => yearAccessor(d));
  $: midYear = years[0] + (years[1] - years[0]) / 2;

  function isFocusYear(year) {
    return year >= focusYears[0] && year <= focusYears[1];
  }

  let acc = (d) => d?.viz_oda_usdmn_nocovid_norefukr;
  const accTotal = (d) => d?.viz_oda_usdmn;
  let covidAcc = (d) => d?.viz_odamn_covid;
  let refugeeAcc = (d) => d?.viz_odamn_refugees;
  let ukraineAcc = (d) => d?.viz_oda_ukr;

  const categories = [
    { acc: acc, label: 'Other', color: 'var(--color-vis-binary-pos)', attr: 'viz_oda_usdmn_nocovid_norefukr' },
    { acc: covidAcc, label: 'COVID response', color: 'var(--color-vis-green)', attr: 'viz_odamn_covid' },
    { acc: refugeeAcc, label: 'Refugee support', color: 'var(--color-vis-cat8-1)', attr: 'viz_odamn_refugees' },
    { acc: ukraineAcc, label: 'Ukraine', color: 'var(--color-vis-cat8-2)', attr: 'viz_oda_ukr' }
  ];

  let fillColor = 'var(--color-vis-binary-pos)';

  $: maxYear = max(enrichedData, yearAccessor);

  let xScale;
  let yScale;
  let lineGenerator;
  let areaGenerator;

  $: lineenrichedData = enrichedData.filter((d) => yearAccessor(d) < focusYears[0]);
  $: focusenrichedData = enrichedData.filter((d) => yearAccessor(d) >= focusYears[0]);

  $: stackData = stack().keys(categories.map((d) => d.attr))(focusenrichedData);
  $: barStart = $isMobile ? 0.5 : 0.6;

  $: if (enrichedData)
    xScale = scaleLinear()
      .domain([min(enrichedData, (d) => yearAccessor(d)), focusYears[0], focusYears[0], focusYears[1]])
      .range([0, w * (barStart + 0.05), w * (barStart + 0.08), w - margins.left - margins.right - barWidth]);
  $: if (enrichedData) {
    yScale = scaleLinear()
      .domain([0, max(enrichedData, (d) => categories.reduce((a, v) => a + d[v.attr], 0))])
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

  $: yearGap = $isMobile ? 20 : 5;
  $: yearLabels = enrichedData.filter(
    (d) =>
      (yearAccessor(d) % yearGap === 0 && yearAccessor(d) !== 2015) ||
      (yearAccessor(d) <= focusYears[1] && yearAccessor(d) >= focusYears[0] - ($isMobile ? 0 : 1))
  );
  $: valueLabels = enrichedData.filter((d, i) => i === 0);

  $: currentYear = maxYear;
  $: currentYearData = enrichedData.find((d) => yearAccessor(d) === currentYear);
  $: currentYearStackData = stackData.map((d) => {
    const res = d.find((dd) => dd.data.year === currentYear);
    if (res) {
      res.key = d.key;
    }
    return res;
  });

  let yTicks = [0];
  for (let i = 30000; i <= 210000; i += 30000) {
    yTicks.push(i);
  }

  function updateMouse(evt) {
    let mousePos = { x: evt.layerX, y: evt.layerY };
    currentYear = Math.round(xScale.invert(mousePos.x - margins.left));

    if (currentYear < years[0]) currentYear = years[0];
    if (currentYear > years[1]) currentYear = years[1];
  }
</script>

<div class="oda-line">
  {#if w}
    <svg width={w} height={h} on:mousemove={updateMouse} class="linechart">
      <g transform={`translate(${0},${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={yScale}
          ticks={yTicks}
          yDivisor={1000}
          yAxisUnits={number_label}
        />
      </g>
      <g transform={`translate(${margins.left},${margins.top})`}>
        {#if xScale && yScale}
          <rect x={xScale(2019.5)} width={xScale(maxYear) - xScale(2019)} y={-margins.top} height={h} class="annotated-area" />

          <path d={areaGenerator(lineenrichedData)} style:fill={fillColor} class="area" />
          <path d={lineGenerator(lineenrichedData)} class="bg" />
          <path d={lineGenerator(lineenrichedData)} stroke={fillColor} />

          {#each stackData as dataType}
            {#each dataType as yearData}
              <rect
                class="value-bar"
                x={xScale(yearData.data.year) - barWidth / 2}
                y={yScale(yearData[1])}
                width={barWidth}
                height={yScale(yearData[0]) - yScale(yearData[1])}
                style:fill={categories.find((d) => d.attr === dataType.key).color}
              />
            {/each}
          {/each}

          {#each [...valueLabels, currentYearData].filter(exists) as label}
            {#if isFocusYear(yearAccessor(label))}
              {#each currentYearStackData.filter((d) => d[1] - d[0] > 0) as cat}
                <rect
                  class="value-separator"
                  x={xScale(yearAccessor(label)) - barWidth / 2}
                  y={yScale(cat[1])}
                  width={barWidth}
                  height={3.5}
                  style:fill={categories.find((k) => k.attr === cat.key).color}
                />
              {/each}

              <text
                x={xScale(yearAccessor(label))}
                y={yScale(accTotal(label)) - 10}
                class={yearAccessor(label) > midYear ? (yearAccessor(label) > 2017 ? 'label end' : 'label middle') : 'label start'}
                class:stronger={true}
              >
                <Number value={textLabelizer(accTotal(label))} digits={1} unit="$" />{` `}{number_label}</text
              >

              {#each currentYearStackData.filter((d) => d[1] - d[0] > 0) as cat}
                <text
                  x={xScale(yearAccessor(label)) - 5}
                  y={8 + yScale(cat[0]) + (yScale(cat[1]) - yScale(cat[0])) / 2}
                  class={'label end stronger small'}
                  style:fill={categories.find((k) => k.attr === cat.key).color}
                >
                  <Number value={textLabelizer(cat[1] - cat[0])} digits={1} unit="$" />{` `}{number_label}</text
                >
              {/each}
            {:else}
              <circle cx={xScale(yearAccessor(label))} cy={yScale(acc(label))} r={LineChartCircleRadius} fill={fillColor} />
              <text
                x={xScale(yearAccessor(label))}
                y={yearAccessor(label) == maxYear ? yScale(acc(label)) - 10 : yScale(acc(label)) + 23}
                class={yearAccessor(label) < midYear ? 'label start' : 'label middle'}
                class:stronger={true}
              >
                <Number value={textLabelizer(acc(label))} digits={1} unit="$" />{` `}{number_label}</text
              >
            {/if}
          {/each}
          {#each [...yearLabels, currentYearData].filter(exists) as label}
            {#if !$isMobile || +yearAccessor(label) != 2017}
              <text
                x={xScale(yearAccessor(label))}
                y={yScale(0) + 12}
                class="label middle small"
                class:weaker={label !== currentYearData}
                class:stronger={label === currentYearData}>{yearAccessor(label)}</text
              >
            {/if}
          {/each}

          <rect
            x={xScale(currentYear)}
            width={1}
            y={yScale(acc(currentYearData))}
            height={yScale(0) - yScale(acc(currentYearData))}
            style={`fill: ${fillColor}`}
          />
          <text x={xScale(2019.5) + 5} y={-30} class="label start caps">{$_('covid', { default: 'COVID-19' })}</text>
        {/if}
      </g>
    </svg>
  {/if}
</div>
<CategoricalLegend legendType="custom" customItems={categories.map((d) => ({ key: d.label, colour: d.color }))} />

<style>
  .value-bar {
    fill: var(--color-vis-binary-pos);
    stroke-width: 2px;
    stroke: var(--color-theme-bg-weaker);
    opacity: 0.5;
  }

  .value-separator {
    fill: var(--color-vis-binary-pos);
    stroke-width: 1.5px;
    stroke: var(--color-theme-bg-weaker);
  }

  .covid-bar {
    stroke: var(--color-theme-bg-weaker);
    fill: var(--color-vis-green);
  }
  text.covid {
    fill: var(--color-vis-green);
  }

  text {
    user-select: none;
  }
</style>
