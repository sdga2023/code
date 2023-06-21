<script>
  import { _ } from 'svelte-i18n';
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { stack } from 'd3';
  import * as colors from '$lib/styles/tokens.es6.js';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let digestion;
  export let compost;
  export let landfill_controlled;
  export let incineration;
  export let landfill_unspecified;
  export let dump;
  export let recycling;
  export let landfill_sanitary;

  const legend = [
    { key: 'dump', label: dump, colour: colors.ColorBaseOrange700 },
    { key: 'landfill_unspecified', label: landfill_unspecified, colour: colors.ColorBasePurple700 },
    { key: 'landfill_controlled', label: landfill_controlled, colour: colors.ColorBasePurple500 },
    { key: 'landfill_sanitary', label: landfill_sanitary, colour: colors.ColorBasePurple300 },
    { key: 'incineration', label: incineration, colour: colors.ColorBaseYellow300 },
    { key: 'digestion', label: digestion, colour: colors.ColorBaseGreen400 },
    { key: 'compost', label: compost, colour: colors.ColorBaseGreen300 },
    { key: 'recycling', label: recycling, colour: colors.ColorBaseTeal400 }
  ];

  data.forEach((d) => {
    d.stack = stack().keys(legend.map((d) => d.key))([d]);
  });

  let margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  let w;
  let h = 450;

  $: xScale = scaleLinear()
    .domain([0, 1])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [0, 25, 50, 75, 100];
  $: yScale = scaleBand()
    .domain(['LIC', 'LMC', 'UMC', 'HIC'])
    .range([0, h - margins.bottom - margins.top])
    .padding(0.3);
</script>

<CategoricalLegend
  legendType="custom"
  top="true"
  customItems={legend.map((d) => {
    return { key: d.label, colour: d.colour };
  })}
/>
<div bind:clientWidth={w}>
  <svg width={w} height={h}>
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      {#each data as income}
        {#each income.stack as category}
          <rect
            x={xScale(category[0][0])}
            y={yScale(income.income)}
            width={xScale(category[0][1]) - xScale(category[0][0])}
            height={yScale.bandwidth()}
            stroke={'#ffffff'}
            stroke-width={1}
            fill={legend.find((d) => d.key == category.key).colour}
          />
        {/each}
        <text x={xScale(0)} y={yScale(income.income) - 6} class="category">{$_(`income.${income.income}`)}</text>
      {/each}
    </g>
  </svg>
</div>
