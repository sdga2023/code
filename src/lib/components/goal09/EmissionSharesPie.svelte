<script>
  import { pie, arc } from 'd3-shape';
  import Number from '../general/Number.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let road;
  export let rail;
  export let shipping;
  export let aviation;
  export let pipelines;

  const colorScale = {
    road: { color: Colors.ColorVisCat83, label: road },
    rail: { color: Colors.ColorVisCat81, label: rail },
    shipping: { color: Colors.ColorVisCat86, label: shipping },
    aviation: { color: Colors.ColorVisCat87, label: aviation },
    pipelines: { color: Colors.ColorVisCat82, label: pipelines }
  };

  $: arcs = pie().value((d) => d.share)(data);
  $: arcOutlines = pie()([76.6, 23.4]);

  let w;
  let h = 450;

  $: radius = w > 400 ? 200 : w / 2 - 2;
</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h}>
    <g transform={'translate(' + w / 2 + ',' + h / 2 + ')'}>
      {#each arcs as slice}
        <path
          d={arc().innerRadius(0).outerRadius(radius)(slice)}
          stroke={'#ffffff'}
          stroke-width={1}
          fill={colorScale[slice.data.category].color}
        />
      {/each}
      {#each arcOutlines as outline, i}
        <!--  <path d={arc().innerRadius(0).outerRadius(radius)(outline)} stroke={'#FFFFFF'} stroke-width={i == 0 ? 5 : 0} fill={'none'} />
        <path
          d={arc().innerRadius(0).outerRadius(radius)(outline)}
          stroke={Colors.ColorThemeText}
          stroke-width={i == 0 ? 2 : 0}
          fill={'none'}
        />-->
      {/each}
      {#each arcs as slice}
        {#if slice.data.share > 2}
          <text
            class="number no-stroke"
            class:white={slice.data.category != 'road'}
            x={arc()
              .innerRadius(slice.data.category == 'road' ? 0 : 80)
              .outerRadius(radius)
              .startAngle(slice.startAngle)
              .endAngle(slice.endAngle)
              .centroid()[0]}
            y={arc()
              .innerRadius(slice.data.category == 'road' ? 0 : 80)
              .outerRadius(radius)
              .startAngle(slice.startAngle)
              .endAngle(slice.endAngle)
              .centroid()[1] + 20}
            text-anchor={'middle'}>{slice.data.share}%</text
          >
        {/if}
        <text
          class={'category small no-stroke'}
          x={arc()
            .innerRadius(slice.data.category == 'road' ? 0 : 80)
            .outerRadius(radius)
            .startAngle(slice.startAngle)
            .endAngle(slice.endAngle)
            .centroid()[0]}
          y={arc()
            .innerRadius(slice.data.category == 'road' ? 0 : 80)
            .outerRadius(radius)
            .startAngle(slice.startAngle)
            .endAngle(slice.endAngle)
            .centroid()[1]}
          dx={slice.data.category == 'rail' ? -15 : slice.data.category == 'pipelines' ? -45 : 0}
          dy={slice.data.category == 'rail' ? -75 : slice.data.category == 'pipelines' ? -62 : 0}
          text-anchor={'middle'}
          style:fill={slice.data.category == 'road'
            ? Colors.ColorThemeText
            : slice.data.category == 'pipelines' || slice.data.category == 'rail'
            ? colorScale[slice.data.category].color
            : Colors.ColorThemeDarkText}>{colorScale[slice.data.category].label}</text
        >
      {/each}
    </g>
  </svg>
</div>
