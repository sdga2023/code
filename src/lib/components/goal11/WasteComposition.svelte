<script>
  import { _ } from 'svelte-i18n';
  import { scaleLinear } from 'd3-scale';
  import { stack } from 'd3';
  import * as colors from '$lib/styles/tokens.es6.js';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let foodgreen;
  export let glass;
  export let metal;
  export let other;
  export let paper;
  export let plastic;
  export let rubber;
  export let wood;

  const legend = [
    { key: 'foodgreen', label: foodgreen, colour: colors.ColorBaseGreen600 },
    { key: 'paper', label: paper, colour: colors.ColorBaseTeal400 },
    { key: 'wood', label: wood, colour: colors.ColorBaseYellow700 },
    { key: 'glass', label: glass, colour: colors.ColorBaseBlue200 },
    { key: 'metal', label: metal, colour: colors.ColorBasePurple500 },
    { key: 'plastic', label: plastic, colour: colors.ColorBaseYellow300 },
    { key: 'rubber', label: rubber, colour: colors.ColorBasePurple700 },
    { key: 'other', label: other, colour: colors.ColorVisFilteredOut }
  ];

  /*
    const legend = [
    { key: 'foodgreen', label: foodgreen, colour: colors.ColorVisCat85 },
    { key: 'paper', label: paper, colour: colors.ColorVisCat82 },
    { key: 'wood', label: wood, colour: colors.ColorVisCat83 },
    { key: 'glass', label: glass, colour: colors.ColorVisCat87 },
    { key: 'metal', label: metal, colour: colors.ColorVisCat88 },
    { key: 'plastic', label: plastic, colour: colors.ColorVisCat84 },
    { key: 'rubber', label: rubber, colour: colors.ColorVisCat81 },
    { key: 'other', label: other, colour: colors.ColorVisFilteredOut }
  ];

      { key: 'dump', label: dump, colour: colors.ColorBaseOrange700 },
    { key: 'landfill_unspecified', label: landfill_unspecified, colour: colors.ColorBasePurple700 },
    { key: 'landfill_controlled', label: landfill_controlled, colour: colors.ColorBasePurple500 },
    { key: 'landfill_sanitary', label: landfill_sanitary, colour: colors.ColorBasePurple300 },
    { key: 'incineration', label: incineration, colour: colors.ColorBaseYellow300 },
    { key: 'digestion', label: digestion, colour: colors.ColorBaseGreen400 },
    { key: 'compost', label: compost, colour: colors.ColorBaseGreen300 },
    { key: 'recycling', label: recycling, colour: colors.ColorBaseTeal400 }

    */

  data.forEach((d) => {
    d.stack = stack().keys(['foodgreen', 'paper', 'wood', 'glass', 'metal', 'plastic', 'rubber', 'other'])([d]);
  });

  let margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  let w;
  let h = 600;

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([0, w - margins.right - margins.left]);
  const xTicks = [0, 25, 50, 75, 100];
  $: yScale = scaleLinear()
    .domain([0, 100])
    .range([0, h - margins.bottom - margins.top]);
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
            y={yScale(income.cumshare)}
            width={xScale(category[0][1]) - xScale(category[0][0])}
            height={yScale(income.share)}
            stroke={'#ffffff'}
            stroke-width={1}
            fill={legend.find((d) => d.key == category.key).colour}
          />
        {/each}
        <text x={xScale(0) + 6} y={yScale(income.cumshare) + 16} class="category white">{$_(`income.${income.income}`)}</text>
      {/each}
    </g>
  </svg>
</div>
