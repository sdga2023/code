<script>
  import { scaleLinear, scalePoint } from 'd3-scale';
  import { stack } from 'd3-shape';
  import Number from '../general/Number.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let transport;
  export let availability;
  export let physical;
  export let not;
  export let minor;
  export let main;
  export let most;

  const colorScale = {
    most: { color: Colors.ColorBasePink700, label: most },
    main: { color: Colors.ColorBaseRed500, label: main },
    minor: { color: Colors.ColorBaseRed300, label: minor },
    not: { color: Colors.ColorBaseBlue300, label: not }
  };
  const catMapper = {
    availability: availability,
    transport: transport,
    physical: physical
  };

  const cats = ['availability', 'transport', 'physical'];

  const stackedData = stack().keys(['not', 'minor', 'main', 'most']);

  let margins = {
    top: 24,
    right: 0,
    bottom: 50,
    left: 0
  };

  let w;
  let h = 250;

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([0, w - margins.left - margins.right]);

  $: yScale = scalePoint()
    .domain(cats)
    .range([0, h - margins.top - margins.bottom])
    .padding(0);
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h}>
    <g transform={`translate(${margins.left},${margins.top})`}>
      {#each cats as cat, i}
        {#each stackedData(data.filter((d) => d.category == cat)) as answer}
          <rect
            x={xScale(answer[0][0])}
            y={yScale(cat)}
            height={50}
            width={xScale(answer[0][1]) - xScale(answer[0][0])}
            fill={colorScale[answer.key].color}
            stroke={'white'}
            stroke-width={'1px'}
          />
          <text
            class="number white middle"
            x={xScale(answer[0][0]) + (xScale(answer[0][1]) - xScale(answer[0][0])) / 2}
            y={yScale(cat) + 22}><Number value={answer[0].data[answer.key]} unit="%" /></text
          >
        {/each}
        {#each stackedData(data.filter((d) => d.category == cat)) as answer, i}
          {#if cat == 'availability'}
            <text
              class={w < 630 && i % 2 == 1 ? "small" : "small white"}
              x={w < 630 && i == 3 ? xScale(answer[0][1]) : xScale(answer[0][0]) + 4}
              y={w < 630 && i % 2 == 1 ? yScale(cat) + 64 : yScale(cat) + 44}
              text-anchor={w < 630 && i == 3 ? 'end' : 'start'}>{colorScale[answer.key].label}</text
            >
          {/if}
        {/each}
        <text class="category" x={xScale(0)} y={yScale(cat) - 8}>{catMapper[cat]} </text>
      {/each}
    </g>
  </svg>
</div>
