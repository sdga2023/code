<script>
    import MultiplesContainer from '../general/MultiplesContainer.svelte';
    import MultipleCell from '../general/MultipleCell.svelte';
    import ElectricityStackedAreaMultiple from './ElectricityStackedAreaMultiple.svelte';
    
    export let data;
    export let urban;
    export let rural;
  
    const regions = ['SSF', 'SAS', 'EAS', 'LCN', 'MEA',  'RESTOFWORLD'];
  </script>
  
  {#if data}
    <MultiplesContainer>
      {#each regions as region}
        <MultipleCell>
          <ElectricityStackedAreaMultiple {data} {region} height={250} showLabels={region == 'SSF'} {urban} {rural}/>
        </MultipleCell>
      {/each}
    </MultiplesContainer>
  {/if}