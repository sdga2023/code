<script>
    import MultiplesContainer from '../general/MultiplesContainer.svelte';
    import MultipleCell from '../general/MultipleCell.svelte';
    import RoadTrafficMultiple from './RoadTrafficMultiple.svelte';
    import { _ } from 'svelte-i18n';
  
    export let data;
    export let newyork;
    export let bogota;
    export let mumbai;
    export let manila;
  
    $: citiesMap = {
      'newyork': newyork,
      'bogota': bogota,
      'mumbai': mumbai,
      'manila': manila
    }
  </script>
  
  {#if data && citiesMap}
    <MultiplesContainer>
      {#each Object.keys(citiesMap) as city}
        <MultipleCell>
          <RoadTrafficMultiple {data} {citiesMap} {city} height={260}/>
        </MultipleCell>
      {/each}
    </MultiplesContainer>
  {/if}
  
  <style>
    .multiple-title {
      color: var(--color-theme-text);
      font-weight: var(--font-weights-regular);
      font-family: var(--font-families-andes);
      line-height: var(--line-heights-auto);
      font-size: var(--font-size-l);
      letter-spacing: var(--letter-spacing-5);
      padding-bottom: var(--space-xxs);
    }
  </style>
  