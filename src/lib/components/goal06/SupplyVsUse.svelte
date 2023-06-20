<script>
  import { _ } from 'svelte-i18n';
  import { range, scaleLinear, line, area, extent, min, max } from 'd3';
  import ChartGrid from '../ChartGrid.svelte';
  import { onMount } from 'svelte';

  export let parentWidth;
  export let parentHeight;
  export let labels;
  export let activeScene;

  export let data = [];

  let element1;
  let element2;

  $: element1TotalLength = element1?.getTotalLength();
  $: element2TotalLength = element2?.getTotalLength();

  const margins = {
    top: 50,
    right: 100,
    bottom: 20,
    left: 20
  };

  $: width = parentWidth;
  const height = 600;

  $: w = parentWidth - margins.left - margins.right;
  const h = height - margins.top - margins.bottom;

  $: x = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, w]);

  $: y = scaleLinear()
    // .domain([min(data, (d) => Math.min(d.supply, d.use)), max(data, (d) => Math.max(d.supply, d.use))])
    .domain([0, max(data, (d) => Math.max(d.supply, d.use))])
    .range([h, 0]);

  $: t = scaleLinear()
    .domain([0, 1])
    .range(extent(data, (d) => d.year))
    .clamp(true);

  $: l1 = line()
    .x((d) => x(d.year))
    .y((d) => y(d.supply));

  $: l2 = line()
    .x((d) => x(d.year))
    .y((d) => y(d.use));

  $: activeData = data.filter((d) => d.year < t(activeScene.progress));

  $: l1Path = l1(activeData);
  $: l2Path = l2(activeData);

  let mounted = false;

  onMount(() => (mounted = true));

  //   element1?.getPointAtLength(activeScene.progress).y - element1?.getPointAtLength(activeScene.progress - 0.01).y,
  // element1?.getPointAtLength(activeScene.progress).x - element1?.getPointAtLength(activeScene.progress - 0.01).x;
  //   ) || 0}
</script>

<div class="chart" bind:clientWidth={width}>
  <svg {width} {height}>
    <g transform="translate({margins.left}, {margins.top})">
      <ChartGrid gridType="xGrid" scale={x} ticks={x.nice().ticks()} xAxisTitle="years" innerHeight={h} innerWidth={w} />
      <ChartGrid
        gridType="yGrid"
        scale={y}
        ticks={y.nice().ticks()}
        yAxisTitle={$_(labels['running_avg'])}
        yAxisUnits="km3"
        innerHeight={h}
        innerWidth={w}
      />

      <path d={l1Path} fill="none" stroke="var(--color-base-green500)" stroke-width={3} stroke-linecap="round" bind:this={element1} />
      <path
        d={l2(activeData)}
        fill="none"
        stroke="var(--color-base-yellow400)"
        stroke-width={3}
        stroke-linecap="round"
        bind:this={element2}
      />
      {#if l1Path}
        <text
          dx={5}
          style="fill: var(--color-base-green500);"
          transform="translate({x(Math.floor(t(activeScene.progress)))}, {y(
            data.find((d) => d.year === Math.floor(t(activeScene.progress))).supply
          )})"
        >
          {$_(labels['supply'])}
        </text>
      {/if}
      {#if l2Path}
        <text
          dx={5}
          style="fill: var(--color-base-yellow400);"
          transform="translate({x(Math.floor(t(activeScene.progress)))}, {y(
            data.find((d) => d.year === Math.floor(t(activeScene.progress))).use
          )})"
        >
          {$_(labels['use'])}
        </text>
      {/if}
    </g>
  </svg>
</div>
