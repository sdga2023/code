<script>
  import { groups, scaleSqrt, scaleLog, scaleLinear, sum, max, scaleQuantize, range } from 'd3';
  import { stack } from 'd3-shape';
  import UkraineImportBar from './UkraineImportBar.svelte';
  import UkraineImportSmall from './UkraineImportSmall.svelte';
  import Number from '../general/Number.svelte';
  import Date from '../general/Date.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import * as Colors from '$lib/styles/tokens.es6';
  import { _ } from 'svelte-i18n';

  export let parentWidth;
  export let parentHeight;

  export let activeScene;
  export let legend_label;
  export let labels;

  export let data = [];

  $: width = parentWidth;
  $: height = parentHeight;

  const periods = Array.from(new Set(data.map((d) => d.period))).sort((a, b) => a - b);

  const commodities = ['Cereals', 'Oils and fats', 'Dairy'];

  let periodIndex = 0;
  let commodityIndex = 0;

  $: p = scaleQuantize().domain([0, 0.75]).range(range(periods?.length));
  $: commodityIndex = activeScene?.index;

  $: periodIndex = p(activeScene?.offset);

  $: test = groups(
    data
      .filter((d) => d.commodity_group === commodities[commodityIndex] && d.period === periods[periodIndex])
      .map((d) => ({
        ...d,
        ukraine: d.ukraine === 'NA' ? 0 : d.ukraine,
        month: d.period
      })),
    (d) => d.reporter
  ).map((d) => {
    const totalUkraine = sum(d[1], (d) => d.ukraine);
    const totalWorld = sum(d[1], (d) => d.world);

    return {
      key: d[0],
      values: d[1],
      totalUkraine,
      totalWorld,
      percentUkraine: totalUkraine / totalWorld
    };
  });

  $: countries = periodIndex === 0 ? test.sort((a, b) => b.percentUkraine - a.percentUkraine).map((d) => d.key) : countries;
</script>

<div class="label title centered">
  {commodities[commodityIndex]}
</div>
<div class="svg-container" bind:clientHeight={height} bind:clientWidth={width}>
  <UkraineImportSmall
    {labels}
    data={data.filter((d) => d.commodity_group === commodities[commodityIndex])}
    period={periods[periodIndex]}
    {periodIndex}
    {width}
    {height}
  />
</div>
<CategoricalLegend
  legendType="custom"
  customItems={[
    { key: $_('country.tur'), colour: Colors.ColorVisCat81 },
    { key: $_('country.pak'), colour: Colors.ColorVisCat82 },
    { key: $_('country.idn'), colour: Colors.ColorVisCat83 },
    { key: $_('country.tun'), colour: Colors.ColorVisCat84 },
    { key: 'EU', colour: Colors.ColorVisCat85 },
    { key: $_(labels.rest_of_world), colour: Colors.ColorVisCat86 }
  ]}
/>

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
