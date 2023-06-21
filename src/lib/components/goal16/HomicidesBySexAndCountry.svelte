<script>
  import ChartGrid from '../ChartGrid.svelte';
  import { max, scaleLinear, pie, groups, arc, range } from 'd3';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let activeScene;
  export let labels;

  const margin = {
    top: 70,
    right: 20,
    bottom: 70,
    left: 20
  };

  const legendHeight = 60;

  const sort = (a, b) => a.region_iso3c.localeCompare(b.region_iso3c) || b.Male - a.Male;

  let width;
  let height = parentHeight - legendHeight;

  $: w = parentWidth - margin.left - margin.right;
  $: h = parentHeight - margin.top - margin.bottom - legendHeight;

  $: r = scaleLinear()
    .domain([0, max(data, (d) => Math.max(d.Female, d.Male))])
    .range([0, Math.min(w, h) / 3]);

  $: arcs = pie()
    .value((d) => d[1].length)
    .sort((a, b) => a[0].localeCompare(b[0]))(groups(data, (d) => d.region_iso3c));

  $: a = arc()
    .innerRadius(Math.min(w, h) / 4 + 10)
    .outerRadius(Math.min(w, h) / 4 - 10)
    .startAngle((d) => d.startAngle)
    .endAngle((d) => d.endAngle)
    .padAngle(0.015);

  const getOpacity = (d, i, index) => {
    if (index === 0 && d.Male > d.Female) {
      return 1;
    } else if (index === 1 && d.Female > d.Male) {
      return 1;
    } else if (index === 2 && d.region_iso3c === 'LCN') {
      return 1;
    } else if (index === 3 && d.Iso3_code === 'BRB') {
      return 1;
    } else {
      return 0.1;
    }
  };

  let hover;

  let mousePosition = { x: 0, y: 0 };
  function updateMouse(evt) {
    mousePosition = { x: evt.clientX, y: evt.clientY };
  }

  const chartRotationAngle = -60;
  const regionRotationAngle = 88;
</script>

<div bind:clientWidth={width}>
  <svg {width} {height} on:mousemove={updateMouse}>
    <g transform="translate({margin.left}, {margin.top})">
      <!-- <ChartGrid gridType="yGrid" innerWidth={w} innerHeight={h} scale={y} ticks={y.ticks()} yAxisTitle="population in 100,000" /> -->
      <g transform="translate({(1.6 * w) / 3}, {h / 2})">
        <g transform="rotate({regionRotationAngle})">
          {#each arcs as sector}
            <path d={a(sector)} fill="var(--color-vis-region-{sector.data[0]})" opacity={0.2} />
          {/each}
        </g>
        <!-- <path
          d={arc()
            .startAngle(0)
            .endAngle(Math.PI * 2)
            .innerRadius(0)
            .outerRadius(Math.min(w, h) / 3)([1])}
          fill="var(--color-vis-gender-female)"
          opacity={0.1}
        />
        <path
          d={arc()
            .startAngle(0)
            .endAngle(Math.PI * 2)
            .innerRadius(Math.min(w, h) / 3)
            .outerRadius((2 * Math.min(w, h)) / 3)([1])}
          fill="var(--color-vis-gender-male)"
          opacity={0.1}
        /> -->
        {#each range(25, 100, 25) as i}
          <circle r={Math.min(w, h) / 4 + r(i)} stroke="var(--color-grey-200)" fill="none" stroke-dasharray="2 2" />
          <text
            class="label small weaker middle"
            transform="rotate({chartRotationAngle}) translate({Math.min(w, h) / 4 + r(i)}, 0) rotate(90)"
            dy={-3}
          >
            {i}
          </text>
        {/each}
        {#each range(25, 75, 25) as i}
          <circle r={Math.min(w, h) / 4 - r(i)} stroke="var(--color-grey-200)" fill="none" stroke-dasharray="2 2" />
          <text
            class="label small weaker middle"
            transform="rotate({chartRotationAngle}) translate({Math.min(w, h) / 4 - r(i)}, 0) rotate(90)"
            dy={-3}
          >
            {i}
          </text>
        {/each}
        {#each data.sort(sort) as d, i}
          {@const halfCenter = Math.min(w, h) / 4}
          {@const opacity = getOpacity(d, i, activeScene.index)}

          <g
            transform="rotate({(i / data.length) * 360}) translate({halfCenter}, 0)"
            {opacity}
            on:mouseover={() => (hover = d)}
            on:mouseout={() => (hover = undefined)}
          >
            <!-- <line x2={-r(d.Female)} stroke="var(--color-vis-region-{d.region_iso3c}" stroke-width={4} stroke-linecap="round" /> -->
            <!-- <line x2={r(d.Male)} stroke="var(--color-vis-region-{d.region_iso3c}" stroke-width={4} stroke-linecap="round" /> -->
            <line x2={-r(d.Female)} stroke="transparent" stroke-width={12} stroke-linecap="round" />
            <line x2={r(d.Male)} stroke="transparent" stroke-width={12} stroke-linecap="round" />
            <line x2={-r(d.Female)} stroke="var(--color-vis-gender-female)" stroke-width={2} />
            <line x2={r(d.Male)} stroke="var(--color-vis-gender-male)" stroke-width={2} />
          </g>
        {/each}

        <circle r={Math.min(w, h) / 4} fill="none" stroke="black" stroke-width={2} />

        <!-- <clipPath id="female-clip">
          <path
            d={arc()
              .innerRadius(Math.min(w, h) / 4)
              .outerRadius(Math.min(w, h) / 3)
              .startAngle(0)
              .endAngle(Math.PI * 2)()}
            fill="steelblue"
            opacity={0.3}
          />
        </clipPath> -->
        <!-- 
        <clipPath id="maleClippingPath">
          <path
            d={arc()
              .innerRadius(0)
              .outerRadius(200)
              .startAngle(0)
              .endAngle(Math.PI * 2)()}
            fill="green"
            opacity={0.3}
          />
          <circle r={200} fill="red" />
        </clipPath> -->

        {#each data.sort(sort) as d, i}
          {@const halfCenter = Math.min(w, h) / 4}
          {@const angle = (i / data.length) * 360}
          {@const flipped = angle > 90 && angle < 270}
          {@const opacity = getOpacity(d, i, activeScene.index)}

          <g
            transform="rotate({angle}) translate({halfCenter}, 0)"
            {opacity}
            on:mouseover={() => (hover = d)}
            on:mouseout={() => (hover = undefined)}
          >
            <circle cx={-r(d.Female)} r={4} fill="var(--color-vis-gender-female)" stroke="white" clip-path="url(#female-clip)" />
            <circle cx={r(d.Male)} r={4} fill="var(--color-vis-gender-male)" stroke="white" clip-path="url(#maleClippingPath)" />

            {#if parentHeight > 640}
              {#if !$isMobile || d.Iso3_code === 'WORLD'}
                <text
                  x={+r(d.Male) * (flipped ? -1 : 1)}
                  transform="rotate({flipped ? 180 : 0})"
                  class:world={d.region === 'NA'}
                  class="{$referenceCountry !== undefined && $referenceCountry === d.Iso3_code ? 'reference-' : ''}label small central"
                  class:end={flipped}
                  dx={flipped ? -5 : 5}
                >
                  {d.Iso3_code === 'WORLD' ? $_(`region.WLD`) : $_(`country.${d.Iso3_code.toLowerCase()}`)}
                </text>
              {/if}
            {/if}
          </g>
        {/each}
      </g>
    </g>
  </svg>
  <CategoricalLegend legendType="gender" title={labels.legend_title} />
</div>
{#if hover}
  <Tooltip visible={hover !== undefined} targetPos={mousePosition}>
    <div class="label geo">{$_(`country.${hover.Iso3_code.toLowerCase()}`)}</div>
    <hr />
    <div class="label small">
      <span class="label number"><Number value={hover.Male} digits={2} /></span>
      {$_(labels.male_rate)}
    </div>
    <div class="label small ">
      <span class="label number"><Number value={hover.Female} digits={2} /></span>
      {$_(labels.female_rate)}
    </div>
  </Tooltip>
{/if}

<style>
  .world {
    font-weight: bold;
  }
</style>
