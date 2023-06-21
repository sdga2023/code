<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import * as Colors from '$lib/styles/tokens.es6';
  import TreeCoverLossDriversMultiple from './TreeCoverLossDriversMultiple.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let commodity;
  export let wildfire;
  export let forestry;
  export let shiftingagriculture;
  export let urbanization;
  export let unknown;
  export let temporarydrivers;

  const colorScale = {
    wildfire: { color: Colors.ColorBaseRed500, label: wildfire },
    forestry: { color: Colors.ColorBaseRed700, label: forestry },
    shiftingagriculture: { color: Colors.ColorBaseRed400, label: shiftingagriculture },
    commodity: { color: Colors.ColorBaseYellow400, label: commodity },
    urbanization: { color: Colors.ColorBaseYellow200, label: urbanization },
    unknown: { color: Colors.ColorGrey400, label: unknown }
  };

  $: legendItems = Object.keys(colorScale).map((d) => {
    let obj = {};
    obj.key = colorScale[d].label;
    obj.colour = colorScale[d].color;
    return obj;
  });

  const regions = ['LCN', 'EAS', 'SAS', 'NAC', 'SSF', 'ECS'];
</script>

{#if data}
  <CategoricalLegend legendType="custom" customItems={legendItems} />
  <CategoricalLegend legendType="custom" itemSymbol="line" customItems={[{ colour: Colors.ColorGrey800, key: temporarydrivers }]} />
  <MultiplesContainer>
    {#each regions as region}
      <MultipleCell>
        <TreeCoverLossDriversMultiple
          {data}
          {region}
          height={250}
          {commodity}
          {wildfire}
          {forestry}
          {shiftingagriculture}
          {urbanization}
          {unknown}
          {colorScale}
        />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}
