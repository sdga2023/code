<script>
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import { groups, max, extent, median } from 'd3-array';
  import { scaleLinear, scaleLog, scaleSqrt } from 'd3-scale';
  import { getRegion } from './../../../data/countryRegionIncomeDictionary';
  import { format } from 'd3-format';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { fade } from 'svelte/transition';

  export let parentWidth;
  export let parentHeight;
  export let data;
  export let labels;
  export let activeScene;

  $: width = parentWidth;
  $: height = parentHeight;

  let until2019 = data.filter((d) => d.year <= 2020);

  const data2 = groups(
    until2019.filter((d) => d.per_capita > 0),
    (d) => d.iso3c
  )
    .sort((a, b) => b[1].find((d) => d.year === 2020)?.per_capita - a[1].find((d) => d.year === 2021)?.per_capita)
    .map((d) => [
      ...d,
      scaleLinear()
        .domain(d[1].map((d) => d.year))
        .range(d[1].map((d) => d.per_capita)),
      scaleLinear()
        .domain(d[1].map((d) => d.year))
        .range(d[1].map((d) => d.population))
    ]);

  const margin = {
    top: 20,
    right: 10,
    bottom: 50,
    left: 5
  };

  $: w = width - margin.left - margin.right;
  $: h = height - margin.top - margin.bottom;

  $: x = scaleLog()
    .domain(
      extent(
        until2019.filter((d) => d.per_capita > 0),
        (d) => d.per_capita
      )
    )
    .range([0, w]);

  $: y = scaleLinear().domain([0, data2.length]).range([0, h]);

  $: r = scaleSqrt()
    .domain([0, max(until2019, (d) => d.population)])
    .range([3, 20]);

  const year = scaleLinear()
    .domain([3, 5])
    .range(extent(until2019, (d) => d.year))
    .clamp(true);

  let mousePosition = { x: 0, y: 0 };
  let showTooltip = false;
  let tooltipLabel = '';

  $: chn = {
    iso: 'CHN',
    index: data2.indexOf(data2.find((d) => d[0] === 'CHN')),
    valueActive: data2.find((d) => d[0] === 'CHN')[2](year(activeScene.index + activeScene.offset)),
    value1960: data2.find((d) => d[0] === 'CHN')[2](1960)
  };

  $: pak = {
    iso: 'PAK',
    index: data2.indexOf(data2.find((d) => d[0] === 'PAK')),
    valueActive: data2.find((d) => d[0] === 'PAK')[2](year(activeScene.index + activeScene.offset)),
    value1960: data2.find((d) => d[0] === 'PAK')[2](1960)
  };

  $: refData =
    $referenceCountry && data2.find((d) => d[0] === $referenceCountry)
      ? {
          iso: $referenceCountry,
          index: data2.indexOf(data2.find((d) => d[0] === $referenceCountry)),
          valueActive: data2.find((d) => d[0] === $referenceCountry)[2](year(activeScene.index + activeScene.offset)),
          value1960: data2.find((d) => d[0] === $referenceCountry)[2](1960)
        }
      : {};

  $: getColor = (d) => {
    if (activeScene.index === 4) {
      if (d[0] === 'CHN') {
        return `var(--color-vis-region-${getRegion(d[0])}`;
      } else {
        return 'var(--color-grey-200)';
      }
    } else if (activeScene.index === 5) {
      if (d[0] === 'PAK') {
        return `var(--color-vis-region-${getRegion(d[0])}`;
      } else {
        return 'var(--color-grey-200)';
      }
    } else {
      return `var(--color-vis-region-${getRegion(d[0])}`;
    }
  };
</script>

{#if data && data.length > 0}
  <p class="label title centered" style:font-size="var(--font-size-xl)">{Math.ceil(year(activeScene.index + activeScene.offset))}</p>
  <p class="label small weaker">↓ {$_(labels['ranking'])}</p>
  <div class="chart scatterplot svg-container" bind:clientHeight={height} bind:clientWidth={width}>
    <svg {width} {height} on:mousemove={(e) => (mousePosition = { x: e.clientX, y: e.clientY })}>
      <g transform="translate({margin.left}, {margin.top})">
        {#each x.ticks() as tick}
          <line x1={x(tick)} y1={0} x2={x(tick)} y2={h} stroke="var(--color-grey-200)" opacity={0.5} />
        {/each}
        {#each x.ticks(5) as tick}
          <text x={x(tick)} y={h} dy={20} class="label small middle weaker"><Number value={tick} /></text>
        {/each}
        <text class="label small end weaker" x={w} y={h} dy={40}
          >m<tspan class="label small weaker" dy={-6} style="font-size: var(--font-size-xs); stroke: none;">3</tspan>
          <tspan class="label small weaker" dy={6}>{$_(labels['per_capita'])} →</tspan>
        </text>

        {#if activeScene.index >= 1}
          <g transition:fade|local>
            <rect x={x(18.25)} y={0} width={x(36.5) - x(18.25)} height={h} style:fill="var(--color-base-blue100)" opacity="0.8" />
            <rect x={x(18.25)} y={0} width={x(36.5) - x(18.25)} height={h} class="annotated-area" />
            <text dx={-20} transform="translate({x(18.25)}, 0) rotate(-90)" class="end category">{$_(labels['drinking'])}</text>
          </g>
        {/if}

        {#if activeScene.index >= 2}
          <g transition:fade|local>
            <rect x={x(730)} y={0} width={x(1825) - x(730)} height={h} style:fill="var(--color-base-blue100)" opacity="0.8" />
            <rect x={x(730)} y={0} width={x(1825) - x(730)} height={h} class="annotated-area" />
            <text dx={-20} transform="translate({x(730)}, 0) rotate(-90)" class="end category">{$_(labels['daily_food'])}</text>
          </g>
        {/if}

        <line
          x1={x(chn.valueActive)}
          y1={y(chn.index)}
          x2={x(chn.value1960)}
          y2={y(chn.index)}
          stroke="var(--color-grey-200)"
          stroke-width={2}
          stroke-dasharray="2 2"
        />
        <circle cx={x(chn.value1960)} cy={y(chn.index)} r={3} fill="var(--color-grey-200)" />

        <line
          x1={x(pak.valueActive)}
          y1={y(pak.index)}
          x2={x(pak.value1960)}
          y2={y(pak.index)}
          stroke="var(--color-grey-200)"
          stroke-width={2}
          stroke-dasharray="2 2"
        />
        <circle cx={x(pak.value1960)} cy={y(pak.index)} r={3} fill="var(--color-grey-200)" />

        {#if activeScene.index === 4}
          <line
            x1={x(chn.valueActive)}
            y1={y(chn.index)}
            x2={x(chn.value1960)}
            y2={y(chn.index)}
            stroke="var(--color-vis-region-{getRegion(chn.iso)}"
            stroke-width={2}
            stroke-dasharray="2 2"
          />
          <circle cx={x(chn.value1960)} cy={y(chn.index)} r={3} fill="var(--color-vis-region-{getRegion(chn.iso)}" />
        {/if}

        {#if activeScene.index === 5}
          <line
            x1={x(chn.valueActive)}
            y1={y(chn.index)}
            x2={x(chn.value1960)}
            y2={y(chn.index)}
            stroke="var(--color-grey-200)"
            stroke-width={2}
            stroke-dasharray="2 2"
          />
          <circle cx={x(chn.value1960)} cy={y(chn.index)} r={3} fill="var(--color-grey-200)" />

          <line
            x1={x(pak.valueActive)}
            y1={y(pak.index)}
            x2={x(pak.value1960)}
            y2={y(pak.index)}
            stroke="var(--color-vis-region-{getRegion(pak.iso)}"
            stroke-width={2}
            stroke-dasharray="2 2"
          />
          <circle cx={x(pak.value1960)} cy={y(pak.index)} r={3} fill="var(--color-vis-region-{getRegion(pak.iso)}" />
        {/if}

        {#if $referenceCountry}
          <line
            x1={x(refData.valueActive)}
            y1={y(refData.index)}
            x2={x(refData.value1960)}
            y2={y(refData.index)}
            stroke="var(--color-reference-country)"
            stroke-width={2}
            stroke-dasharray="2 2"
          />
          <circle cx={x(refData.value1960)} cy={y(refData.index)} r={3} style:fill="var(--color-reference-country)" />
        {/if}

        {#each data2.sort((a, b) => b[1][0].per_capita - a[1][0].per_capita) as d, i}
          {#if d[1].find((k) => k.year === Math.ceil(year(activeScene.index + activeScene.offset))) !== undefined}
            <g
              transform="translate({x(d[2](year(activeScene.index + activeScene.offset)))}, {y(i)})"
              on:mouseover={(e) => {
                showTooltip = true;
                tooltipLabel = {
                  iso3c: d[0],
                  realVal: d[1].find((k) => k.year === Math.ceil(year(activeScene.index + activeScene.offset)))?.per_capita,
                  year: year(activeScene.index + activeScene.offset)
                };
              }}
              on:mouseout={() => {
                showTooltip = false;
              }}
            >
              {#if $referenceCountry === d[0]}
                <circle r={Math.max(0, r(d[3](year(activeScene.index + activeScene.offset)))) + 2} class="reference" />
              {/if}

              <circle r={Math.max(0, r(d[3](year(activeScene.index + activeScene.offset))))} fill={getColor(d)} />
              {#if d[0] === $referenceCountry}
                <text
                  dx={Math.min(0, -r(d[3](year(activeScene.index + activeScene.offset)))) - 10}
                  style="dominant-baseline: central;"
                  class="reference-label central end"
                >
                  {$_(`country.${d[0].toLowerCase()}`)}</text
                >
              {/if}

              {#if activeScene.index === 4 && d[0] === 'CHN'}
                <text dx={Math.min(0, -r(d[3](year(activeScene.index + activeScene.offset)))) - 10} class="geo central end">
                  {$_(`country.${d[0].toLowerCase()}`)}
                </text>
              {/if}

              {#if activeScene.index === 5 && d[0] === 'PAK'}
                <text dx={Math.min(0, -r(d[3](year(activeScene.index + activeScene.offset)))) - 10} class="geo central end">
                  {$_(`country.${d[0].toLowerCase()}`)}
                </text>
              {/if}
            </g>
          {/if}
        {/each}
      </g>
    </svg>
    <Tooltip targetPos={mousePosition} visible={showTooltip}>
      <p class="label geo">{$_(`country.${tooltipLabel.iso3c?.toLowerCase()}`)}</p>
      <hr />
      <p class="label number"><Number value={tooltipLabel.realVal} digits="0" fallback="-" /></p>
      <p class="label small weaker">{@html $_(labels.tooltip_unit)}</p>
    </Tooltip>
  </div>
  <CategoricalLegend legendType="regions" />
  <style>
    .svg-container {
      flex: 1;
      overflow: hidden;
    }
  </style>
{/if}
