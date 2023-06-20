<script>
    import MultiplesContainer from '../general/MultiplesContainer.svelte';
    import MultipleCell from '../general/MultipleCell.svelte';
    import ClimateDisasterDamageMultiple from './ClimateDisasterDamageMultiple.svelte';
  
    export let data;
    export let victims;
    export let damage;
    export let deaths;
    export let unitsvictims;
    export let unitsdamage;
    export let unitsdeaths;
  
  </script>
  
  {#if data}
    <MultiplesContainer>
        <MultipleCell>
          <ClimateDisasterDamageMultiple data={data} type={'victims'} units={unitsvictims} title={victims} height={260} />
        </MultipleCell>
        <MultipleCell>
            <ClimateDisasterDamageMultiple data={data} type={'damage'} units={unitsdamage} title={damage} height={260} />
          </MultipleCell>
          
    </MultiplesContainer>
  {/if}