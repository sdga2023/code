<script>
  import { pie, arc } from 'd3-shape';

  export let data;
  export let title;
  export let subtitle;
  export let source;

  let pies = [];

  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };

  let width;
  const height = 800;

  let w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  $: if (data) {
    pies = pie()
      .value((d) => d.total_renewable_water_resources)
      .sort((a, b) => b.total_renewable_water_resources - a.total_renewable_water_resources)(data);
  }

  const a = arc().innerRadius(0).outerRadius(200);
  const a2 = arc()
    .innerRadius((d) => 200 - (d.data.total_water_withdrawal / d.data.total_renewable_water_resources) * 200)
    .outerRadius(200);
</script>

<div bind:clientWidth={width}>
  <svg width={500} height={h}>
    <g transform="translate({margin.left}, {margin.top})">
      <g transform="translate({500 / 2}, {h / 2})">
        {#each pies as slice, i}
          <path d={a(slice)} fill="skyblue" stroke="white" stroke-width={0.5} />
          <path d={a2(slice)} fill="black" stroke="white" stroke-width={0.5} />
          <text x={Math.cos(slice.startAngle) * 100} y={Math.sin(slice.startAngle) * 100} style="font-size: 10px; text-anchor: middle;"
            >{slice.data.country_code}</text
          >
        {/each}
      </g>
    </g>
  </svg>
</div>
