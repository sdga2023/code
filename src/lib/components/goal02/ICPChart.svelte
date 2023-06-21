<script>
  import { _ } from 'svelte-i18n';
  import ChartGrid from '../ChartGrid.svelte';
  import ICPCountry from './ICPCountry.svelte';
  import Number from '../general/Number.svelte';
  import { format } from 'd3-format';
  import { scaleLinear, scaleSqrt, scaleLog, max, extent } from 'd3';
  import { getContext } from 'svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import { fade } from 'svelte/transition';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { ScatterCircleRadius, ScatterCircleRadiusMob } from '$lib/styles/vis';

  export let activeScene;
  export let data;
  export let labels;
  export let hover;
  export let parentHeight;
  export let parentWidth;
  export let yLabel;
  export let props;
  export let chartIndex = 0;

  const f = format('$.2s');

  const margin = {
    top: 20,
    right: 20,
    bottom: 45,
    left: 30
  };

  // const margin = {
  //   top: 50,
  //   right: 50,
  //   bottom: 80,
  //   left: 50
  // };

  const { hoverStore } = getContext('icp');

  $: w = parentWidth - margin.left - margin.right;
  $: h = parentHeight - margin.top - margin.bottom;

  $: xgdp = scaleLog()
    .domain([700, 200000])
    // .domain(extent(data, (d) => d.gdp))
    .range([20, w]);

  $: yi = scaleLinear().domain([0, data.length]).range([h, 0]);
  $: y = scaleLinear()
    .domain([0, max(data, (d) => max([d[props[0]], d[props[1]], d[props[2]]]))])
    .range([h, 0]);

  $: countryProps = (index) => {
    if (data.length === 0 || index === undefined) {
      return [];
    }

    if (index === 0) {
      return data.map((d, i) => ({
        x: xgdp(d.gdp),
        y: yi(i),
        index,
        data: d
      }));
    } else if (index <= 3) {
      return data.map((d, i) => ({
        x: xgdp(d.gdp),
        y: y(d[props[0]]),
        index,
        data: d
      }));
    } else if (index <= 7) {
      return data.map((d, i) => ({
        x: xgdp(d.gdp),
        y: y(d[props[1]]),
        index,
        data: d
      }));
    } else if (index <= 10) {
      return data.map((d, i) => ({
        x: xgdp(d.gdp),
        y: y(d[props[2]]),
        index,
        data: d
      }));
    }
  };
</script>

<svg width={parentWidth} height={parentHeight}>
  <g transform="translate({margin.left}, {margin.top})">
    <ChartGrid gridType="xGrid" scale={xgdp} ticks={xgdp.ticks()} hideLabels={true} innerWidth={w - margin.left} innerHeight={h} />

    {#if activeScene.index >= 1}
      <g transition:fade|local>
        <ChartGrid gridType="yGrid" scale={y} ticks={y.ticks()} hideLines={true} innerWidth={w - margin.left} innerHeight={h} />
      </g>
    {/if}
    <!-- <text>{activeScene.index}</text> -->

    <text transform="translate({xgdp.range()[0]}, {h / 2}) rotate(-90)" dy={-30} class="label small weaker middle">
      {activeScene.index > 0 ? yLabel : $_(labels.ranking)}
    </text>
    <line x1={xgdp.range()[0]} y1={h} x2={xgdp.range()[1]} y2={h} stroke="var(--color-grey-200)" />
    {#each xgdp.ticks(2) as tick}
      <text dy={20} class="label middle small weaker" x={xgdp(tick)} y={h}>{f(tick)}</text>
    {/each}
    <text class="label small middle" y={h} x={(xgdp.range()[1] - xgdp.range()[0]) / 2} dy={40}>{$_(labels.gdp_per_capita)}</text>

    {#if countryProps(activeScene.index)}
      {#each countryProps(activeScene.index).filter((d) => !['TZA', 'USA'].includes(d.data.country_code)) as props, i}
        <ICPCountry {i} {props} bind:hover isLabelScene={activeScene.index === 6} />
      {/each}
      {#each countryProps(activeScene.index).filter((d) => ['TZA', 'USA'].includes(d.data.country_code)) as props, i}
        <ICPCountry
          {i}
          {props}
          bind:hover
          showLabel={true}
          textAnchor={$isMobile && props.data.country_code === 'USA' ? 'end' : 'middle'}
          isLabelScene={activeScene.index === 6}
        />
      {/each}
      {#if $referenceCountry !== undefined}
        {#each countryProps(activeScene.index).filter((d) => $referenceCountry === d.data.country_code) as props, i}
          <ICPCountry
            {i}
            {props}
            bind:hover
            showLabel={true}
            isReferenceCountry={true}
            textAnchor={$isMobile && props.data.country_code === 'USA' ? 'end' : 'middle'}
            isLabelScene={activeScene.index === 6}
          />
        {/each}
      {/if}
    {/if}

    {#if $hoverStore !== undefined && activeScene.index > 0}
      <g style="pointer-events: none;" transform="translate({xgdp($hoverStore.country.data.gdp)}, 0)">
        <line y1={y($hoverStore.country.data[props[0]])} y2={y($hoverStore.country.data[props[2]])} stroke="black" stroke-dasharray="1 3" />
        <g transform="translate(0, {y($hoverStore.country.data[props[0]])})">
          <circle r={7} stroke="black" fill="none" />
          <circle r={3} fill="black" />
          <text class="label end central small" dx={-10}>{$_(labels.CoCA)}</text>
        </g>
        <g transform="translate(0, {y($hoverStore.country.data[props[1]])})">
          <circle r={7} stroke="black" fill="none" />
          <circle r={3} fill="black" />
          <text class="label end central small" dx={-10}>{$_(labels.CoNA)}</text>
        </g>
        <g transform="translate(0, {y($hoverStore.country.data[props[2]])})">
          <circle r={7} stroke="black" fill="none" />
          <circle r={3} fill="black" />
          <text class="label end central small" dx={-10}>{$_(labels.CoRD)}</text>
        </g>
      </g>
    {/if}
  </g>
</svg>
