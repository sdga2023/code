<script>
  import { scaleLinear, scalePoint, scaleOrdinal } from 'd3-scale';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import SlopeChartMultiple from './SlopeChartMultiple.svelte';

  export let data;
  export let beforecovid;
  export let apriljune;
  export let yaxistitle;
  export let allchildren;
  export let activeScene;
  export let parentWidth;
  export let bottom20;
  export let secondquintile;
  export let thirdquintile;
  export let fourthquintile;
  export let top20;

  $: averageDataNigeria = data.filter((d) => d.quintile == 'average' && d.iso3c == 'NGA');
  $: quintileDataNigeria = data.filter((d) => d.quintile != 'average' && d.iso3c == 'NGA');

  $: averageDataUganda = data.filter((d) => d.quintile == 'average' && d.iso3c == 'UGA');
  $: quintileDataUganda = data.filter((d) => d.quintile != 'average' && d.iso3c == 'UGA');

  $: averageDataEthiopia = data.filter((d) => d.quintile == 'average' && d.iso3c == 'ETH');
  $: quintileDataEthiopia = data.filter((d) => d.quintile != 'average' && d.iso3c == 'ETH');

  let margins = {
    top: 6,
    right: 50,
    bottom: 20,
    left: 50
  };

  $: w = parentWidth > 650 ? parentWidth / 3 : parentWidth;
  let h;
  // vertical space for legends
  $: chartHeight = h - 60;

  $: xScale = scalePoint()
    .domain(['learning_activities_precovid', 'learning_activities'])
    .range([0, w - margins.right - margins.left]);
  const xTicks = ['learning_activities_precovid', 'learning_activities'];
  $: yScale = scaleLinear()
    .domain([0, 100])
    .range([chartHeight - margins.top - margins.bottom, 0]);
  const yTicks = [];

  let colours = [
    Colors.ColorBasePink300,
    Colors.ColorBasePurple300,
    Colors.ColorBaseBlue300,
    Colors.ColorBaseTeal300,
    Colors.ColorBaseGreen300,
    Colors.ColorVisReference
  ];

  let colourScale = scaleOrdinal().domain([1, 2, 3, 4, 5, 'average']).range(colours);

  let legendItems = [
    { key: bottom20, colour: colours[0] },
    { key: secondquintile, colour: colours[1] },
    { key: thirdquintile, colour: colours[2] },
    { key: fourthquintile, colour: colours[3] },
    { key: top20, colour: colours[4] }
  ];
</script>

{#if w}
  <div class="legend-chart-container">
    <div class="multiple-container" bind:clientHeight={h}>
      <SlopeChartMultiple
        country={'nga'}
        averageData={averageDataNigeria}
        quintileData={quintileDataNigeria}
        {margins}
        {yScale}
        {yTicks}
        {yaxistitle}
        {xScale}
        {activeScene}
        {colourScale}
        {w}
        h={chartHeight}
        {beforecovid}
        {apriljune}
      />
      {#if parentWidth > 650}
      <SlopeChartMultiple
        country={'uga'}
        averageData={averageDataUganda}
        quintileData={quintileDataUganda}
        {margins}
        {yScale}
        {yTicks}
        {yaxistitle}
        {xScale}
        {activeScene}
        {colourScale}
        {w}
        h={chartHeight}
        {beforecovid}
        {apriljune}
      />
      <SlopeChartMultiple
        country={'eth'}
        averageData={averageDataEthiopia}
        quintileData={quintileDataEthiopia}
        {margins}
        {yScale}
        {yTicks}
        {yaxistitle}
        {xScale}
        {activeScene}
        {colourScale}
        {w}
        h={chartHeight}
        {beforecovid}
        {apriljune}
      />
      {/if}
    </div>
    <div class="legends-container">
      <CategoricalLegend legendType="custom" customItems={[{ key: allchildren, colour: colours[5] }]} />
      <CategoricalLegend legendType="custom" customItems={legendItems} hidden={activeScene.index < 2} />
    </div>
  </div>
{/if}

<style>
  .legend-chart-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .multiple-container {
    display: flex;
    flex: 1;
  }
</style>
