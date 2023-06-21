<script>
  import { stack, stackOffsetNone, area, curveNatural, stackOrderDescending } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from '../ChartGrid.svelte';
  import { getIncomeLevel } from './../../../data/countryRegionIncomeDictionary';
  import { _ } from 'svelte-i18n';

  export let data;
  export let title;
  export let type;
  export let yaxisunits;

  let margins = {
    top: 16,
    right: 30,
    bottom: 24,
    left: 12
  };
  let w;
  let h = 450;

  $: countryKeys =
    type == 'hic'
      ? Object.keys(data[0])
          .filter((d) => getIncomeLevel(d) == 'HIC')
          .filter((d) => d != 'year')
          .filter((d) => d != 'VEN')
      : Object.keys(data[0])
          .filter((d) => getIncomeLevel(d) != 'HIC')
          .filter((d) => d != 'year')
          .filter((d) => d != 'VEN');
  const labels =
    type == 'hic'
      ? [
          { iso3c: 'usa', x: 2005, y: 1000 },
          { iso3c: 'jpn', x: 2005, y: 1920 },
          { iso3c: 'can', x: 2005, y: 2150 }
        ]
      : [
          { iso3c: 'chn', x: 2012, y: 250 },
          { iso3c: 'rus', x: 2000, y: 250 },
          { iso3c: 'bra', x: 2015, y: 1450 },
          { iso3c: 'ind', x: 2015, y: 1150 }
        ];

  $: stackedData = stack().keys(countryKeys).order(stackOrderDescending).offset(stackOffsetNone)(data);

  $: xScale = scaleLinear()
    .domain([1990, 2019])
    .range([0, w - margins.right]);
  const xTicks = [1990, 2000, 2010, 2019];
  $: yScale = scaleLinear()
    .domain([0, 4000])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 1000, 2000, 3000, 4000];
  $: areaGenerator = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveNatural);

  const colorScale = {
    HIC: { color: Colors.ColorVisIncomeHigh },
    UMC: { color: Colors.ColorVisIncomeUpperMiddle },
    LMC: { color: Colors.ColorVisIncomeLowerMiddle },
    LIC: { color: Colors.ColorVisIncomeLow }
  };
</script>

<div bind:clientWidth={w} class="stacked-area">
  <p class="title caps">{title}</p>
  <svg width={w} height={h}>
    <g transform={`translate(0,${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={yaxisunits}
        yDivisor={1000}
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
      {#each stackedData as series}
        <path
          d={areaGenerator(series)}
          style:fill={colorScale[getIncomeLevel(series.key)].color + 'bb'}
          style:stroke={colorScale[getIncomeLevel(series.key)].color}
        />
      {/each}
      {#each labels as label}
        <text class="small geo white stronger" x={xScale(label.x)} y={yScale(label.y)} text-anchor={'middle'}
          >{$_(`country.${label.iso3c}`)}</text
        >
      {/each}
    </g>
  </svg>
</div>
