<script>
    import { _ } from 'svelte-i18n';
    import { scaleLinear, scaleBand } from 'd3-scale';
    import * as Colors from '$lib/styles/tokens.es6.js';
    import ChartGrid from './../ChartGrid.svelte';
    import Number from './../general/Number.svelte';
    import CategoricalLegend from '$lib/components/general/CategoricalLegend.svelte';
  
    export let data;
    export let xaxisunits;
    export let xaxistitle;
    export let production;
    export let lulucf;

    const regions =  [
    { key: 'SSF'},
    { key: 'LCN'},
    { key: 'MEA'},
    { key: 'SAS'},
    { key: 'NAC'},
    { key: 'ECS'},
    { key: 'EAS'},
  ]
  
    let margins = {
      top: 20,
      right: 35,
      bottom: 30,
      left: 24
    };
    let w;
    let h = 500;
  
    $: xScale = scaleLinear()
      .domain([-1000, 15000])
      .range([0, w - margins.right - margins.left]);
    const xTicks = [-1000, 0, 5000, 10000, 15000];
    $: yScale = scaleBand()
      .domain(regions.map(d => d.key))
      .range([h - margins.bottom, margins.top]);
  </script>
  
  <CategoricalLegend legendType="custom" customItems={[{key: lulucf, colour: Colors.ColorBaseOrange500}, {key: production, colour: Colors.ColorBaseBlue500}]}></CategoricalLegend>
  <div bind:clientWidth={w}>
    <svg width={w} height={h}>
      <g transform={`translate(${margins.left},${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
          xAxisUnits={xaxisunits}
          xAxisTitle={xaxistitle}
        />
  
        {#each data as region}
          <rect
            x={xScale(0)}
            y={yScale(region.region_iso3c) - 10}
            height={20}
            width={xScale(region.production) - xScale(0)}
            fill={Colors.ColorBaseBlue500}
            stroke={"#ffffff"}
            stroke-width={1}
          />
          <text
            class="small"
            x={xScale(region.production) +2}
            y={yScale(region.region_iso3c) + 3}
          ><Number value={region.production} digits={0}></Number></text>
          <rect
            x={region.lulucf < 0 ? xScale(region.lulucf) : xScale(0)}
            y={yScale(region.region_iso3c) + 10}
            height={20}
            width={Math.abs(xScale(region.lulucf) - xScale(0))}
            fill={Colors.ColorBaseOrange500}
            stroke={"#ffffff"}
            stroke-width={1}
          />
          <text
            class="small"
            x={region.lulucf < 0 ? xScale(region.lulucf) - 2 : xScale(region.lulucf) + 2}
            y={yScale(region.region_iso3c) + 25}
            text-anchor={region.lulucf < 0 ? 'end' : 'start'}
          ><Number value={region.lulucf} digits={0}></Number></text>

          <text
            x={xScale(0)}
            y={yScale(region.region_iso3c) - 14}
          >{$_(`country.${region.region_iso3c.toLowerCase()}`)}</text>
        {/each}
      </g>
    </svg>
  </div>
  