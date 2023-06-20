<script>
    import { scaleLinear } from 'd3-scale';
    import { stack } from 'd3-shape';
    import Number from '../general/Number.svelte';
    import * as Colors from '$lib/styles/tokens.es6.js';
  
    export let data;
    export let commodity
    export let wildfire
    export let forestry
    export let shiftingagriculture
    export let urbanization
    export let unknown

    const colorScale = {
        commodity: {color: Colors.ColorBaseYellow500, label: commodity},
        wildfire: {color: Colors.ColorBaseRed500, label: wildfire},
        forestry: {color: Colors.ColorBaseGreen500, label: forestry},
        shiftingagriculture: {color: Colors.ColorBaseBlue500, label: shiftingagriculture},
        urbanization: {color: Colors.ColorBasePurple500, label: urbanization},
        unknown: {color: Colors.ColorGrey500, label: unknown},
    }

    $: stackedData = stack().keys(Object.keys(data[0]))(data)
    let margins = {
      top: 50,
      right: 0,
      bottom: 0,
      left: 0
    };
  
    let w;
    let h = 450;
  
    $: yScale = scaleLinear()
      .domain([0, 100])
      .range([h - margins.top - margins.bottom, 0]);

  </script>
  
  <div bind:clientWidth={w}>
    <svg width={w} height={h}>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#if stackedData}
            {#each stackedData as driver}
                <rect
                    x={0}
                    y={yScale(driver[0][1])}
                    height={yScale(driver[0][0]) - yScale(driver[0][1])}
                    width={50}
                    fill={colorScale[driver.key].color}
                    stroke={'white'}
                    stroke-width={'1px'}
                ></rect>
                <text
                    class="caps"
                    x={60}
                    y={yScale(driver[0][1]) + (yScale(driver[0][0]) - yScale(driver[0][1]))/2 + 4}
                    dy={driver.key == "unknown" ? -40 : 0}
                    style:fill={colorScale[driver.key].color}
                >{colorScale[driver.key].label}</text>
                <text
                    class={'stronger'}
                    x={60}
                    y={yScale(driver[0][1]) + (yScale(driver[0][0]) - yScale(driver[0][1]))/2 + 24}
                    dy={driver.key == "unknown" ? -40 : 0}
                    style:fill={colorScale[driver.key].color}
                ><Number value={driver[0].data[driver.key]} digits={1} unit={'%'}></Number></text>
            {/each}
        {/if}
      </g>
    </svg>
  </div>
  
  <style>

  </style>
  