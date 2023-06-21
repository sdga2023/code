<script>
  import SmallMultipleContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import EVSalesMultiple from './EVSalesMultiple.svelte';
  export let data;
  export let outsidechina;

  const metrics = ['HIC', 'UMC', 'LMC', 'LIC']
</script>

<SmallMultipleContainer>
  {#each metrics as metric}
    <MultipleCell>
      <EVSalesMultiple {data} {metric} {outsidechina}/>
    </MultipleCell>
  {/each}
</SmallMultipleContainer>

