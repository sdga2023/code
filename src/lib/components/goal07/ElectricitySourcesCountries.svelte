<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import ElectricitySourcesMultiple from './ElectricitySourcesMultiple.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let id;

  export let coal;
  export let gas;
  export let oil;
  export let nuclear;
  export let otherrenewables;
  export let hydro;
  export let bioenergy;
  export let solar;
  export let wind;
  export let yaxistitle;
  export let yaxisunits;

  const sources = [
    { key: 'coal', label: coal, colour: Colors.ColorGrey700 },
    { key: 'oil', label: oil, colour: Colors.ColorBaseLightBeige500 },
    { key: 'gas', label: gas, colour: Colors.ColorBaseDarkPurple300 },
    { key: 'nuclear', label: nuclear, colour: Colors.ColorBasePurple200 },
    { key: 'bioenergy', label: bioenergy, colour: Colors.ColorBaseGreen300 },
    { key: 'hydro', label: hydro, colour: Colors.ColorBaseTeal300 },
    { key: 'wind', label: wind, colour: Colors.ColorBaseBlue300 },
    { key: 'solar', label: solar, colour: Colors.ColorBaseYellow200 },
    { key: 'otherrenewable', label: otherrenewables, colour: Colors.ColorBaseGreen100 }
  ];

  $: countries =
    id == 'developed'
      ? ['USA', 'DEU', 'JPN']
      : id == 'transitioning'
      ? ['BRA', 'IND', 'CHN']
      : id == 'developing'
      ? ['ETH', 'RWA', 'UGA']
      : [];
  $: yMax =
    id == 'developed'
      ? 5000000
      : id == 'transitioning'
      ? 8000000
      : id == 'developing'
      ? 20000
      : 0;
</script>

<MultiplesContainer>
  {#each countries as country, i}
    <MultipleCell>
      <ElectricitySourcesMultiple {data} {country} height={250} {yaxistitle} {yaxisunits} displayAxisTitle={i == 0} {yMax}/>
    </MultipleCell>
  {/each}
</MultiplesContainer>

<CategoricalLegend
legendType="custom"
customItems={sources.slice(4, 9).map((d) => {
  return { key: d.label, colour: d.colour };
})}
/>
<CategoricalLegend
  legendType="custom"
  customItems={sources.slice(0, 4).map((d) => {
    return { key: d.label, colour: d.colour };
  })}
/>
