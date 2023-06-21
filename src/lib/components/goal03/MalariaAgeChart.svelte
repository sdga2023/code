<script>
  import { max, extent, scaleLinear, area, curveMonotoneX, stack } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { CategoricalLegend, Number, Tooltip } from '$lib/components';
  import ChartGrid from '../ChartGrid.svelte';

  export let parentWidth;

  export let data;

  export let age_label_0;
  export let age_label_1;
  export let age_label_2;
  export let age_label_3;
  export let age_label_4;
  export let age_label_5;
  export let age_label_6;
  export let yaxistitle;
  export let yaxisunits;
  export let tooltip_label = 'Average annual malaria deaths 2000-2019';

  let yearAccessor = (d) => +d['Age group'].replace('Malaria ', '');

  const ageGroups = ['1-59 months', '5-14 years', '15-29 years', '30-49 years', '50-59 years', '60-69 years', '70+ years'];
  const ageLabels = {
    '1-59 months': age_label_0,
    '5-14 years': age_label_1,
    '15-29 years': age_label_2,
    '30-49 years': age_label_3,
    '50-59 years': age_label_4,
    '60-69 years': age_label_5,
    '70+ years': age_label_6
  };
  const ageColors = {
    '1-59 months': Colors.ColorVisCat81,
    '5-14 years': Colors.ColorVisCat82,
    '15-29 years': Colors.ColorVisCat83,
    '30-49 years': Colors.ColorVisCat84,
    '50-59 years': Colors.ColorVisCat85,
    '60-69 years': Colors.ColorVisCat86,
    '70+ years': Colors.ColorVisCat87
  };

  const ageGroupsLegend = ageGroups.map((ageGroup, i) => ({ key: ageLabels[ageGroups[i]], colour: ageColors[ageGroups[i]] }));

  $: w = parentWidth;
  let h = 450;

  $: labelWidth = 120;

  $: margins = {
    top: 30,
    right: 20,
    bottom: 20,
    left: 30
  };
  let xScale;
  let yScale;
  let years = [];
  let areaGenerator;

  let richData = [];
  let stckData = [];

  const stck = stack().keys(ageGroups);

  $: if (data) {
    richData = [...data].reverse().map((d) => ({
      year: yearAccessor(d),
      ...ageGroups.reduce((acc, age) => {
        acc[age] = parseInt(d[age].replace(/,/g, ''));
        return acc;
      }, {})
    }));
  }

  $: console.log(data, richData);

  $: if (richData) {
    years = richData.map((d) => d.year);
  }
  $: if (richData) {
    stckData = stck(richData);
  }

  $: if (data)
    xScale = scaleLinear()
      .domain(extent(richData, (d) => d.year))
      .range([0, w - margins.left - margins.right]);
  $: if (richData) {
    yScale = scaleLinear()
      .domain([0, 800000])
      .range([h - margins.top - margins.bottom, 0]);
  }

  $: if (xScale && yScale)
    areaGenerator = area()
      .x((d) => xScale(d.data.year))
      .y0((d) => yScale(d[1]))
      .y1((d) => yScale(d[0]))
      .curve(curveMonotoneX);

  let currentYear = 2019;

  let tooltipTargetPos = { x: 0, y: 0 };
  let hoverData;

  function hoverArea(e, ageKey) {
    tooltipTargetPos = { x: e.clientX, y: e.clientY };

    const average = richData.reduce((acc, val) => val[ageKey] + acc, 0) / richData.length;

    hoverData = {
      average,
      key: ageKey
    };
  }

  function hideTooltip() {
    hoverData = null;
  }
</script>

<div class="mortality-chart">
  <CategoricalLegend legendType="custom" customItems={ageGroupsLegend} top={true} />
  {#if w}
    <svg width={w} height={h} on:mouseleave={hideTooltip} class="stacked-area">
      <g transform={`translate(0,${margins.top})`}>
        {#if yScale && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={[0, 200000, 400000, 600000, 800000]}
            yDivisor={1000}
            yAxisTitle={yaxistitle}
            yAxisUnits={yaxisunits}
          />
        {/if}
      </g>
      <g transform={`translate(${margins.left},${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={years}
        />
        {#if xScale && yScale}
          {#each stckData as stckDatum}
            <path
              d={areaGenerator(stckDatum)}
              fill={ageColors[stckDatum.key]}
              data-age-group={stckDatum.key}
              on:mouseover={(e) => hoverArea(e, stckDatum.key)}
            />
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
</div>
<Tooltip visible={hoverData} targetPos={tooltipTargetPos}>
  {#if hoverData}
    <p class="label caps">{ageLabels[hoverData.key]}</p>

    <p class="label stronger"><Number value={hoverData.average} digits={1} /></p>
    <p class="label small weaker">{tooltip_label}</p>
  {/if}
</Tooltip>
