<script>
  import { stack, stackOrderDescending, stackOffsetNone, area, curveNatural } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from '../ChartGrid.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { regionDefaultSortOrder } from '../../../data/countryRegionIncomeDictionary';

  export let data;
  export let yaxisunits;

  let margins = {
    top: 40,
    right: 40,
    bottom: 30,
    left: 14
  };
  let w;
  let h = 500;
  const colorScale = [
    { key: 'MEA', colour: Colors.ColorVisRegionMEA },
    { key: 'ECS', colour: Colors.ColorVisRegionECS },
    { key: 'EAS', colour: Colors.ColorVisRegionEAS },
    { key: 'SSF', colour: Colors.ColorVisRegionSSF },
    { key: 'LCN', colour: Colors.ColorVisRegionLCN },
    { key: 'SAS', colour: Colors.ColorVisRegionSAS },
    { key: 'NAC', colour: Colors.ColorVisRegionNAC }
  ];
  /*let chinaData = data.map(d => {
    return {year: d.year, vessels: d.CHN}
  })*/

  data.forEach((d) => {
    delete d['CHN'];
  });

  const byRegionCode = (a, b) => regionDefaultSortOrder.indexOf(a) - regionDefaultSortOrder.indexOf(b);

  // {#each groups(totalPerCountry, (d) => d.region_code).sort((a, b) => byRegionCode(a[0], b[0])) as region, i}

  $: stackedData = stack()
    .keys(colorScale.map((d) => d.key))
    .order(stackOrderDescending)
    .offset(stackOffsetNone)(data);

  $: xScale = scaleLinear()
    .domain([1950, 2017])
    .range([0, w - margins.right]);
  const xTicks = [1950, 1970, 1990, 2010, 2017];
  $: yScale = scaleLinear()
    .domain([0, 4000000])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 2000000, 4000000];
  $: areaGenerator = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveNatural);
  $: chinaAreaGenerator = area()
    .x((d) => xScale(d.year))
    .y0((d) => yScale(0))
    .y1((d) => yScale(d.vessels))
    .curve(curveNatural);
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h}>
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={yaxisunits}
        yDivisor={1000000}
      />
    </g>
    <g transform={`translate(${margins.left},${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />
      {#if stackedData && areaGenerator && xScale && yScale}
        {#each stackedData as series, i}
          <path d={areaGenerator(series)} stroke={'white'} stroke-width={1.5} fill={colorScale[i].colour} />
        {/each}
      {/if}
      <!--path d={chinaAreaGenerator(chinaData)} stroke={'white'} stroke-width={1.5} fill={'black'} /-->
    </g>
  </svg>
  <CategoricalLegend legendType={'regions'} />
</div>
