<script>
  import { stack, stackOrderNone, stackOffsetNone, area, curveNatural } from 'd3-shape';
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import TopIncomeEmissionsMultiple from './TopIncomeEmissionsMultiple.svelte';
  import { _ } from 'svelte-i18n';

  export let data;
  export let toprest;
  export let income;
  export let topemitters;
  export let restofworld;
  export let units;
  export let projection;
  export let target;

  $: typesMap = {
    toprest: toprest,
    income: income
  };

  $: stackedToprestData = stack().keys(['rest', 'top']).order(stackOrderNone).offset(stackOffsetNone)(data);
  $: stackedIncomeData = stack().keys(['lic', 'lmc', 'umc', 'hic']).order(stackOrderNone).offset(stackOffsetNone)(data);

  let types = ['toprest', 'income'];
</script>

{#if data}
  <MultiplesContainer>
    {#each types as type}
      <MultipleCell cols="6">
        <p class="title">{typesMap[type]}</p>
        <TopIncomeEmissionsMultiple
          data={type == 'toprest' ? stackedToprestData : stackedIncomeData}
          {type}
          {topemitters}
          {units}
          {restofworld}
          {projection}
          {target}
        />
      </MultipleCell>
    {/each}
  </MultiplesContainer>
{/if}
