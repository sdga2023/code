<script>
  import { scaleLinear } from 'd3-scale';
  import { stack } from 'd3-shape';
  import Number from '../general/Number.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let critically;
  export let endangered;
  export let vulnerable;
  export let near;
  export let least;
  export let nei;
  export let species;
  export let parentWidth;

  const colorScale = {
    critically: { color: Colors.ColorBasePink700, label: critically },
    endangered: { color: Colors.ColorBaseRed600, label: endangered },
    vulnerable: { color: Colors.ColorBaseRed500, label: vulnerable },
    near: { color: Colors.ColorBaseYellow300, label: near },
    least: { color: Colors.ColorBaseTeal300, label: least },
    nei: { color: Colors.ColorGrey200, label: nei }
  };

  $: stackedData = stack().keys(Object.keys(data[0]))(data);
  let margins = {
    top: 10,
    right: 0,
    bottom: 0,
    left: 0
  };

  let w;
  let h = 500;

  let barWidth = 250;

  $: yScale = scaleLinear()
    .domain([0, 1199])
    .range([h - margins.top - margins.bottom, 0]);

  $: xPosition = (parentWidth - barWidth) / 2;
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h}>
    <g transform={`translate(${xPosition},${margins.top})`}>
      {#if stackedData}
        {#each stackedData as driver}
          <rect
            x={0}
            y={yScale(driver[0][1])}
            height={yScale(driver[0][0]) - yScale(driver[0][1])}
            width={barWidth}
            fill={colorScale[driver.key].color}
            stroke={'white'}
            stroke-width={'1px'}
          />
          <text
            class="category middle white"
            x={barWidth / 2}
            y={yScale(driver[0][1]) + 16}
            dy={driver.key == 'critically' ? -2 : 0}
            style:stroke={colorScale[driver.key].color}>{colorScale[driver.key].label}</text
          >
          <text
            class={'number middle white'}
            x={barWidth / 2}
            y={yScale(driver[0][1]) + 36}
            dy={driver.key == 'critically' ? -2 : 0}
            style:stroke={colorScale[driver.key].color}
            ><Number value={driver[0].data[driver.key]} digits={0} />
            {' ' + species} (<Number value={(driver[0].data[driver.key] / 1199) * 100} digits={0} unit={'%'} />)</text
          >
        {/each}
      {/if}
    </g>
  </svg>
</div>

<style>
  text {
    text-align: center;
  }
</style>
