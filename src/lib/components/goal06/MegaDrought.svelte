<script>
  import { _ } from 'svelte-i18n';
  import { range, scaleLinear } from 'd3';

  export let parentWidth;
  export let parentHeight;

  export let data = [];
  $: sortedData = data.sort((a, b) => a.MapDate - b.MapDate);
  $: console.log(data);

  const margins = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  $: width = parentWidth;
  const height = 3500;

  $: w = parentWidth - margins.left - margins.right;
  const h = height - margins.top - margins.bottom;

  $: x = scaleLinear().domain([0, 100]).range([0, 600]);
</script>

<div class="chart" bind:clientWidth={width}>
  <svg {width} {height}>
    <g transform="translate({margins.left}, {margins.top})">
      <g transform="translate({w / 2}, 0)">
        {#each sortedData as d, i}
          <g transform="translate(0, {i * 2.5})">
            <rect x={-x.range()[1] / 2} width={x.range()[1]} height={2} fill="var(--color-base-blue100)" />
            <rect x={-x(d.D0) / 2} width={x(d.D0)} height={2} fill="var(--color-base-orange200)" />
            <rect x={-x(d.D1) / 2} width={x(d.D1)} height={2} fill="var(--color-base-orange300)" />
            <rect x={-x(d.D2) / 2} width={x(d.D2)} height={2} fill="var(--color-base-orange400)" />
            <rect x={-x(d.D3) / 2} width={x(d.D3)} height={2} fill="var(--color-base-orange500)" />
            <rect x={-x(d.D4) / 2} width={x(d.D4)} height={2} fill="var(--color-base-orange600)" />
            {#if i === 0 || d.ValidStart.split('/')[2] !== sortedData[i - 1].ValidStart.split('/')[2]}
              <text x={x.range()[1] / 2} dx={5} class="label small central">{d.ValidStart.split('/')[2]}</text>
            {/if}
          </g>
        {/each}
      </g>
    </g>
  </svg>
</div>
