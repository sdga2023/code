<script>
  import CountryPicker from '../general/CountryPicker.svelte';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import { scaleLinear, stack } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from '../general/Number.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let parentWidth;
  export let parentHeight;

  export let activeScene;
  export let data;

  $: w = parentWidth;
  $: h = parentHeight;

  const GENDERS = ['male', 'female'];
  const DATATYPES = ['unaffected', 'retraining', 'green'];
  const LABELS = ['Unaffected', 'Retraining', 'Green'];

  const colorMap = {
    unaffected: 'var(--color-vis-filtered-out)',
    change: 'var(--color-vis-purple)',
    retraining: 'var(--color-vis-blue)',
    brown: 'var(--color-base-orange600)',
    green: 'var(--color-vis-green)'
  };
  const genderColorMap = {
    male: 'var(--color-vis-gender-male)',
    female: 'var(--color-vis-gender-female)'
  };

  $: console.log(activeScene);
  $: console.log(data);

  $: countries = Array.from(new Set(data.map((d) => d.ISO3)));

  $: countriesToRemove = countriesISO.filter((iso) => !countries.includes(iso));
  $: remove = (iso) => countriesToRemove.includes(iso);

  $: countryData = data.filter((d) => d.ISO3 === selectedCountry);
  $: console.log(countryData);
  $: percCountryData = countryData.find((d) => d.type === 'percentage');

  $: slotData = stack().keys(DATATYPES.map((d) => 'total ' + d))(countryData);
  $: console.log(slotData);

  $: activeDatatypes =  DATATYPES;

  let selectedCountry = 'TUR';

  $: zoomIn = activeScene.index > 1;

  $: xScale = scaleLinear()
    .domain([0, 1.05])
    .range(!zoomIn ? [0, w] : [-w * 3, w]);

  $: xSizeScale = scaleLinear()
    .domain([0, 1.05])
    .range(!zoomIn ? [0, w] : [0, w * 4]);

  $: yScale = scaleLinear()
    .domain([0, 1])
    .range(!zoomIn ? [h - 50, 0] : [h - 50, -h]);

  $: BAR_WIDTH = zoomIn ? 50 : 20;
</script>

<CountryPicker bind:selectedCountry {remove} />
<div class="svg-container" bind:clientWidth={w} bind:clientHeight={h}>
  <svg width={w} height={h}>
    {#each DATATYPES as d, i}
      <rect
        x={xScale(slotData[i][0][0])}
        y={activeScene.index === 0 ? 0 : h - 50}
        width={xSizeScale(slotData[i][0][1] - slotData[i][0][0])}
        height={activeScene.index === 0 ? h : 6}
        style:fill={colorMap[d]}
        style:stroke="var(--color-theme-bg-weaker)"
      />
      <rect
        x={xScale(slotData[i][0][0]) + 2}
        y={-2}
        width={xSizeScale(slotData[i][0][1] - slotData[i][0][0]) - 4}
        height={h - 48}
        style:fill={colorMap[d]}
        style:opacity="0.1"
        style:stroke-width="2"
        style:stroke={colorMap[d]}
      />
      <text class="label small middle" x={xScale(slotData[i][0][0]) + xSizeScale(slotData[i][0][1] - slotData[i][0][0]) / 2} y={h - 5}
        ><Number value={countryData[0]['total ' + d] * 100} unit="%" digits="1" /></text
      >
    {/each}
    {#each ['brown', 'change'] as other,i}
      <rect x={i === 0 ? xScale(slotData[0][0][1]) : xScale(slotData[0][0][1]) + xSizeScale(percCountryData['total brown'])}
      y={0}
      height={50}
      width={xSizeScale(percCountryData['total ' + other])}
      style:fill={colorMap[other]} />
    {/each}

    {#each activeDatatypes as d, i}
      {#each GENDERS as g, j}
        <rect
          x={xScale(slotData[i][0][0]) + xSizeScale(slotData[i][0][1] - slotData[i][0][0]) / 2 - BAR_WIDTH + (j % 2) * BAR_WIDTH}
          width={BAR_WIDTH}
          y={yScale(countryData[0][g + ' ' + d])}
          height={h - 50 - yScale(countryData[0][g + ' ' + d])}
          style:fill={genderColorMap[g]}
        />
        <text
          class="label small middle"
          x={xScale(slotData[i][0][0]) +
            xSizeScale(slotData[i][0][1] - slotData[i][0][0]) / 2 -
            BAR_WIDTH +
            (j % 2) * BAR_WIDTH +
            BAR_WIDTH / 2}
          y={yScale(countryData[0][g + ' ' + d])}><Number value={countryData[0][g + ' ' + d] * 100} unit="%" digits="1" /></text
        >
      {/each}
    {/each}

    {#each LABELS as label, i}
      <text
        class="label small middle"
        class:vertical={activeScene.index === 0}
        x={xScale(slotData[i][0][0]) + xSizeScale(slotData[i][0][1] - slotData[i][0][0]) / 2}
        y={activeScene.index === 0 ? h / 2 : h - 20}>{label}</text
      >
    {/each}
  </svg>
</div>
<CategoricalLegend
  legendType="custom"
  customItems={[
    { key: 'Percentage of working women', colour: Colors.ColorVisGenderFemale },
    { key: 'Percentage of working men', colour: Colors.ColorVisGenderMale }
  ]}
/>

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }

  rect,
  text {
    transition: 1.5s all;
  }

  text.vertical {
    writing-mode: vertical-rl;
    text-orientation: upright;
  }
</style>
