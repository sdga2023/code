<script>
  import { groups, max } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { scaleLinear } from 'd3-scale';
  import Number from '../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import * as colors from '$lib/styles/tokens.es6.js';

  export let parentWidth;
  export let parentHeight;
  export let labels;
  export let data = [];
  export let regions = []; // these are income group regions

  $: byIncomeGroup = data
    ? data
        ?.filter((d) => regions.map((d) => d.region).includes(d.region))
        .sort((a, b) => a.agriculture - b.agriculture)
        .reduce((acc, cur, i) => {
          if (i === 0) {
            cur.stack = [0, cur.total];
          } else {
            const prev = acc[i - 1];
            cur.stack = [prev.stack[1], prev.stack[1] + cur.total];
          }

          cur.sectorStack = [
            [0, cur.agriculture],
            [cur.agriculture, cur.agriculture + cur.industry],
            [cur.agriculture + cur.industry, 100]
          ];

          acc.push(cur);

          return acc;
        }, [])
    : [];

  const margin = {
    top: 20,
    right: 82,
    bottom: 20,
    left: 0
  };

  $: width = parentWidth;
  const height = 800;

  $: w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  $: y = scaleLinear()
    .domain([0, max(byIncomeGroup, (d) => d.stack[1])])
    .range([0, h]);

  $: x = scaleLinear().domain([0, 100]).range([0, w]);
</script>

<CategoricalLegend
  legendType="custom"
  top={true}
  customItems={[
    { key: labels['agriculture'], colour: colors.ColorBaseBlue400 },
    { key: labels['industry'], colour: colors.ColorBaseBlue500 },
    { key: labels['domestic'], colour: colors.ColorBaseBlue600 }
  ]}
/>
<div class="svg-container" bind:clientWidth={parentWidth} bind:clientHeight={parentHeight}>
  <svg {width} {height}>
    <g transform="translate({margin.left}, {margin.top})">
      {#if byIncomeGroup?.length > 0}
        <text class="label small stronger start" dy={-5} dx={0} x={w}>{$_(labels['total_usage'])}</text>
        {#each byIncomeGroup as incomeGroup}
          <g transform="translate(0, {y(incomeGroup.stack[0])})">
            {#each incomeGroup.sectorStack as sector, i}
              <g transform="translate({x(sector[0])}, 0)">
                <rect
                  width={x(sector[1]) - x(sector[0])}
                  height={y(incomeGroup.stack[1]) - y(incomeGroup.stack[0])}
                  fill={i === 0 ? Colors.ColorBaseBlue400 : i === 1 ? Colors.ColorBaseBlue500 : Colors.ColorBaseBlue600}
                  stroke="white"
                  rx={3}
                  ry={3}
                />
                <text
                  y={(y(incomeGroup.stack[1]) - y(incomeGroup.stack[0])) / 2}
                  x={(x(sector[1]) - x(sector[0])) / 2}
                  style:stroke={i === 0 ? Colors.ColorBaseBlue400 : i === 1 ? Colors.ColorBaseBlue500 : Colors.ColorBaseBlue600}
                  class="label value-label number {Math.round(
                    i === 0 ? incomeGroup.agriculture : i === 1 ? incomeGroup.industry : incomeGroup.domestic
                  ).toLocaleString() <= 4
                    ? 'small'
                    : ''}"
                >
                  <Number
                    value={Math.round(
                      i === 0 ? incomeGroup.agriculture : i === 1 ? incomeGroup.industry : incomeGroup.domestic
                    ).toLocaleString()}
                    unit="%"
                  />
                </text>
              </g>
            {/each}
            <text dx={5} dy={10} x={0} class="label category white" stroke="none" style="dominant-baseline: central;"
              >{$_(`income.${incomeGroup.region}`)}</text
            >
            <line x1={w + 3} x2={w + 3} y1={2} y2={y(incomeGroup.stack[1]) - y(incomeGroup.stack[0]) - 2} stroke="black" />
            <text
              dx={6}
              x={w}
              y={(y(incomeGroup.stack[1]) - y(incomeGroup.stack[0])) / 2}
              style="dominant-baseline: central; font-size: var(--font-size-s); stroke: none;"
            >
              {Math.round(incomeGroup.total)}
              {$_(labels['billion_m3'])} m<tspan style="stroke: none; font-size: var(--font-size-xs);" dy={-5}>3</tspan>
            </text>
          </g>
        {/each}
      {/if}
    </g>
  </svg>
</div>

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }

  .value-label {
    dominant-baseline: central;
    text-anchor: middle;
    fill: white;
  }
</style>
