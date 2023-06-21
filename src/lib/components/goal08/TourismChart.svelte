<script>
  import { scaleLinear, scalePoint } from 'd3-scale';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;

  let margins = {
    top: 20,
    right: 10,
    bottom: 40,
    left: 10
  };

  let w;
  let h = 450;

  $: chartData = data ? data : [];

  $: xScale = scalePoint()
    .range([0, w - margins.left - margins.right])
    .domain(['< 5% GDP', '5-10% GDP', '>= 10% GDP'])
    .padding(0.5);
  const xTicks = ['< 5% GDP', '5-10% GDP', '>= 10% GDP'];

  const yScale = scaleLinear()
    .range([h - margins.bottom, margins.top])
    .domain([-50, 25]);
  const yTicks = [-50, -25, 0, 25];
</script>

<div class="layout-main tourism" bind:clientWidth={w}>
  <svg width={w} height={h}>
    <rect x={0} y={0} width={w} height={h} class="background-rect" />
    <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={yScale}
        ticks={yTicks}
      />
      {#each chartData as country}
        <text
          x={xScale(country.tourism)}
          y={yScale(country.change_gdp)}
          text-anchor={'middle'}
          class={'texthalo'}
          fill={country.change_gdp < 0 ? Colors.ColorVisBinaryNeg : Colors.ColorVisBinaryPos}
          font-size={'0.8em'}
          >{country.iso3c}
        </text>
        <!--circle
            cx={xScale(country.tourism)}
            cy={yScale(country.change_gdp_pcap)}
            r={7}
            stroke={'white'}
            stroke-width={1}
            fill={country.change_gdp_pcap < 0 ? Colors.ColorVisBinaryNeg : Colors.ColorVisBinaryPos}
          /-->
      {/each}
    </g>
  </svg>
</div>

<style>
  .tourism {
    height: 450px;
  }
  .background-rect {
    fill: transparent;
  }
</style>
