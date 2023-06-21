<script>
  import { scaleLog } from 'd3';
  import { onMount } from 'svelte';
  import Number from '../general/Number.svelte';

  export let pathString;
  export let regionData;
  export let i;
  export let hover;
  export let regionOrder;

  let path;

  const p = scaleLog().domain([1, 600000]).range([0, 1]);

  let data = [];
  let labels = [];

  onMount(() => {
    const totalLength = path.getTotalLength();

    if (i === 6) {
      labels = [
        [5, 3],
        [10, 3],
        [50, 3],
        [100, 3],
        [500, 2],
        [1000, 2],
        [5000, 5],
        [10000, 5],
        [50000, 3],
        [100000, 3],
        [500000, 3]
      ].map((d) => {
        const before = path.getPointAtLength(p(d[0] - 0.1) * totalLength);
        const after = path.getPointAtLength(p(d[0] + 0.1) * totalLength);
        const position = path.getPointAtLength(p(d[0]) * totalLength);

        const offsetIndex = d[1];

        const angle = Math.atan2(after.y - before.y, after.x - before.x);

        return {
          value: d[0],
          x: position.x + Math.cos(angle - Math.PI / 2) * offsetIndex * 12,
          y: position.y + Math.sin(angle - Math.PI / 2) * offsetIndex * 12
        };
      });
    }

    data = regionData.map((d) => {
      const before = path.getPointAtLength(p(d.total_renewable_water_resources_per_capita - 1) * totalLength);
      const after = path.getPointAtLength(p(d.total_renewable_water_resources_per_capita + 1) * totalLength);
      const position = path.getPointAtLength(p(d.total_renewable_water_resources_per_capita) * totalLength);

      const offsetIndex = regionOrder.indexOf(d.regionISO3);

      const angle = Math.atan2(after.y - before.y, after.x - before.x);

      return {
        x: position.x + Math.cos(angle - Math.PI / 2) * offsetIndex * 12,
        y: position.y + Math.sin(angle - Math.PI / 2) * offsetIndex * 12,
        regionISO3: d.regionISO3,
        country: d.iso3,
        value: d.total_renewable_water_resources_per_capita
      };
    });
  });
</script>

<path
  bind:this={path}
  d={pathString}
  fill="none"
  stroke="var(--color-vis-region-{regionOrder[regionOrder.length - 1 - i]})"
  stroke-width={1}
/>

{#each labels as label}
  <text class="label small" style="fill: var(--color-base-blue400); text-anchor: middle; dominant-baseline: middle;" x={label.x} y={label.y}
    ><Number value={label.value} /> m<tspan style="font-size: var(--font-size-xs); stroke-width: 2;">3</tspan>/year/capita</text
  >
{/each}

{#each data as d}
  <circle
    r={6}
    cx={d.x}
    cy={d.y}
    fill="var(--color-vis-region-{d.regionISO3})"
    stroke={hover !== null && hover.data.country === d.country ? 'var(--color-vis-selected)' : 'white'}
    stroke-width={hover !== null && hover.data.country === d.country ? 1 : 0.5}
    on:mousemove={(e) => (hover = { data: d, x: e.clientX, y: e.clientY })}
    on:mouseout={() => (hover = null)}
  />
{/each}
