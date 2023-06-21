<script>
  import { scaleLinear } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';

  export let data;
  export let policy;
  export let pledge;
  export let law;
  export let notsubmitted;
  export let countries;
  export let ghgshare;

  let margins = {
    top: 30,
    right: 0,
    bottom: 0,
    left: 0
  };
  let w;
  let h = 450;

  const colorScale = [
    { key: 'policy', color: Colors.ColorBaseRed400, label: policy },
    { key: 'law', color: Colors.ColorBaseGreen400, label: law },
    { key: 'pledge', color: Colors.ColorBaseBlue400, label: pledge },
    { key: 'nodocument', color: Colors.ColorGrey400, label: notsubmitted }
  ];

  $: yScale = scaleLinear()
    .domain([0, 100])
    .range([h - margins.top - margins.bottom, 0]);
  const barWidth = 60;
  const barOffset = 160;
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h}>
    <text x={w / 2 - barOffset - barWidth / 2} y={20} text-anchor={'middle'}>{ghgshare}</text>
    <text x={w / 2 + barOffset + barWidth / 2} y={20} text-anchor={'middle'}>{countries}</text>
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      {#each data as status}
        <polygon
          points={`
      ${w / 2 - barOffset},${yScale(status.stacked)}
      ${w / 2 + barOffset},${yScale(status.stacked_countries)}
      ${w / 2 + barOffset},${yScale(status.stacked_countries - status.share_countries)}
      ${w / 2 - barOffset},${yScale(status.stacked - status.share)}
      ${w / 2 - barOffset},${yScale(status.stacked)}
      `}
          fill={colorScale.find((d) => d.key == status.status).color}
          fill-opacity={0.4}
          stroke={'#FFFFFF'}
          stroke-width={1.5}
        />
        <rect
          x={w / 2 - barOffset - barWidth}
          y={yScale(status.stacked)}
          width={barWidth}
          height={yScale(status.stacked - status.share) - yScale(status.stacked)}
          fill={colorScale.find((d) => d.key == status.status).color}
          stroke={'white'}
          stroke-width={1}
        />
        <rect
          x={w / 2 + barOffset}
          y={yScale(status.stacked_countries)}
          width={barWidth}
          height={yScale(status.stacked_countries - status.share_countries) - yScale(status.stacked_countries)}
          fill={colorScale.find((d) => d.key == status.status).color}
          stroke={'white'}
          stroke-width={1}
        />
      {/each}
      {#each data as status}
        <text
          class="caps"
          x={w / 2}
          y={(yScale(status.stacked) + yScale(status.stacked_countries)) / 2 + 36}
          dy={status.status == 'nodocument' ? 32 : 0}
          text-anchor={'middle'}
          style:fill={colorScale.find((d) => d.key == status.status).color}>{colorScale.find((d) => d.key == status.status).label}</text
        >
        <text
          class={'stronger'}
          x={w / 2 - barOffset - barWidth / 2}
          y={yScale(status.stacked) + (yScale(status.stacked - status.share) - yScale(status.stacked)) / 2 + 6}
          text-anchor={'middle'}
          style:fill={colorScale.find((d) => d.key == status.status).color}
        >
          <Number value={status.share} digits={1} unit={'%'} />
        </text>
        <text
          class={'stronger'}
          x={w / 2 + barOffset + barWidth / 2}
          y={yScale(status.stacked_countries) +
            (yScale(status.stacked_countries - status.share_countries) - yScale(status.stacked_countries)) / 2 +
            6}
          style:fill={colorScale.find((d) => d.key == status.status).color}
          text-anchor={'middle'}
        >
          <Number value={status.countries} digits={0} />
        </text>
      {/each}
    </g>
  </svg>
</div>
