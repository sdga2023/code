<script>
  import GHGSectorsTreemap from '$lib/components/goal13/GHGSectorsTreemap.svelte';
  import GHGGasSectorsTreemap from '$lib/components/goal13/GHGGasSectorsTreemap.svelte';

  export let data;
  export let activeScene;
  export let parentHeight;
  export let parentWidth;

  export let nonenergy;
  export let industrial;
  export let agriculture;
  export let waste;
  export let landuse;
  export let energy;
  export let building;
  export let electricityheat;
  export let fugitive;
  export let manufacturing;
  export let other;
  export let transportation;
  export let bunker;
  export let CH4;
  export let CO2;
  export let othergas;
  export let share;
  export let units;
</script>

{#if activeScene.index < 2}
  <GHGSectorsTreemap
    data={data.filter((d) => d.gas == 'Total')}
    {activeScene}
    {parentHeight}
    {parentWidth}
    {nonenergy}
    {industrial}
    {agriculture}
    {waste}
    {landuse}
    {energy}
    {building}
    {electricityheat}
    {fugitive}
    {manufacturing}
    {other}
    {transportation}
    {share}
    {units}
  />
{/if}

{#if activeScene.index > 1}
  <GHGGasSectorsTreemap
    data={data.filter((d) => d.gas != 'Total')}
    {activeScene}
    {parentHeight}
    {parentWidth}
    {nonenergy}
    {industrial}
    {agriculture}
    {waste}
    {landuse}
    {energy}
    {building}
    {electricityheat}
    {fugitive}
    {manufacturing}
    {other}
    {transportation}
    {bunker}
    {CH4}
    {CO2}
    {othergas}
    {share}
    {units}
  />
{/if}
