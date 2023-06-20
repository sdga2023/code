<script>
  import ChartGrid from '../ChartGrid.svelte';
  import { extent, scaleLinear, scaleBand } from 'd3';
  import { area, stack } from 'd3-shape';
  import { format } from 'd3-format';
  import * as colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let parentWidth;
  export let parentHeight;

  const f = format('.2%');

  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  let width;
  let height = parentHeight;
  $: w = parentWidth - margin.left - margin.right;
  $: h = parentHeight - margin.top - margin.bottom;

  $: stacked = stack().keys(['homicide', 'organized_violence'])(data);

  $: x = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, w]);

  $: y = scaleLinear().domain([0, stacked[1][2][1]]).range([h, 0]).nice();

  const a = area()
    .x((d) => x(d.data.year))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));
</script>

<div bind:clientWidth={width}>
  <svg {width} {height}>
    <g transform="translate({margin.left}, {margin.top})">
      {#each stacked as d}
        <path d={a(d)} fill={d.key === 'organized_violence' ? 'var(--color-base-red700)' : 'var(--color-base-red500)'} />
      {/each}

      {#each data as d}
        <text class="label small middle" dy={20} x={x(d.year)} y={h}>{d.year}</text>
      {/each}
    </g>
  </svg>
</div>
