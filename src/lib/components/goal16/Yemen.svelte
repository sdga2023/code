<script>
  import { _ } from 'svelte-i18n';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';

  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, scaleSequential, extent, piecewise, interpolateLab } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Legend from '$lib/components/general/Legend.svelte';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import Number from '../general/Number.svelte';

  import yemenJSON from '../../../data/other/yemen_admin.json';

  export let data;
  export let legend;
  export let labels;

  export let parentWidth;
  export let parentHeight;

  let width = Math.min(600, parentWidth);
  let height = width / 1.4;

  const margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };

  const ramp = piecewise(interpolateLab, [Colors.ColorGrey100, Colors.ColorBaseOrange400, Colors.ColorBaseRed700]);

  let colorScale = scaleSequential(ramp).domain([0, 1]).clamp(true);

  $: if (data) {
    const [min, max] = extent(data.filter((c) => c.year === '2020-2021').map((c) => c['excess.mean']));

    const dmax = max;
    const dmin = Math.abs(min);
    const d = Math.max(dmax, dmin) / 2;
  }

  let yemen1 = null;

  const projection = geoEqualEarth().scale(1).translate([0, 0]);

  (async () => {
    yemen1 = topojson.feature(yemenJSON, yemenJSON.objects.foo1).features;
    yemen1 = yemen1.map((d) => ({
      ...d,
      properties: {
        ...d.properties,
        data: data.find((e) => d.properties.admin1Pcode === e.ADM1_PCODE)
      }
    }));

    const path = geoPath().projection(projection);

    const boundsExtent = yemen1.reduce((acc, cur, i) => {
      if (i === 0) {
        acc = path.bounds(cur);
      } else {
        const curBounds = path.bounds(cur);
        acc[0][0] = Math.min(acc[0][0], curBounds[0][0]);
        acc[0][1] = Math.min(acc[0][1], curBounds[0][1]);
        acc[1][0] = Math.max(acc[1][0], curBounds[1][0]);
        acc[1][1] = Math.max(acc[1][1], curBounds[1][1]);
      }

      return acc;
    }, []);

    const b = boundsExtent;
    const s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    const t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s).translate(t);
  })();

  const rotation = tweened([0, 0], { easing: cubicInOut, duration: 800 });
  $: $rotation = [0, 0];

  let mousePos = { x: 0, y: 0 };
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  let hover;
</script>

<div class="map">
  <svg {width} {height} on:mousemove={updateMouse} class="map">
    <g>
      {#if yemen1 && projection}
        <g class="yemen">
          {#each yemen1 as y1}
            <path
              on:mouseover={() => (hover = y1)}
              on:mouseout={() => (hover = undefined)}
              fill={colorScale(y1.properties.data['Inadequate Food Consumption']) || 'var(--color-vis-not-available)'}
              d={geoPath().projection(projection)(y1)}
            />
          {/each}
          {#each yemen1 as y1}
            {#if hover !== undefined && hover.properties.data.ADM1_PCODE === y1.properties.data.ADM1_PCODE}
              <path d={geoPath().projection(projection)(y1)} class="emphasisbg" />
              <path d={geoPath().projection(projection)(y1)} class="emphasis" />
            {/if}
          {/each}
        </g>
      {/if}
    </g>
  </svg>
</div>
<div class="legend-div">
  <Legend
    title={labels.legend_title}
    color={colorScale}
    units={'units: TODO'}
    tickLabels={[
      { label: '0%', value: 0 },
      { label: '50%', value: 0.5 },
      { label: '100%', value: 1 }
    ]}
  />
</div>
{#if hover !== undefined}
  <Tooltip visible={hover !== undefined} targetPos={mousePos}>
    <div class="label geo">{hover.properties.data.ADM1_EN}</div>
    <div class="label small">
      <span class="number normal" style="font-size: var(--font-size-m);">
        {#if hover.properties.data['Inadequate Food Consumption'] === null}
          {$_(labels.tooltip_na)}
        {:else}
          <Number value={100 * hover.properties.data['Inadequate Food Consumption']} unit="%" digits={0} />
        {/if}
      </span>
      {$_(labels.tooltip_label)}
    </div>
  </Tooltip>
{/if}

<style>
  .legend-div {
    margin: var(--space-xs) 0;
  }
  .map {
    display: flex;
    justify-content: center;
  }
</style>
