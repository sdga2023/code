<script>
  import { _ } from 'svelte-i18n';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let legendType;
  export let customItems;
  export let itemSymbol = 'circle';
  export let hidden;
  export let top = false;

  const regions = [
    { key: 'MEA', colour: Colors.ColorVisRegionMEA },
    { key: 'ECS', colour: Colors.ColorVisRegionECS },
    { key: 'EAS', colour: Colors.ColorVisRegionEAS },
    { key: 'SSF', colour: Colors.ColorVisRegionSSF },
    { key: 'LCN', colour: Colors.ColorVisRegionLCN },
    { key: 'SAS', colour: Colors.ColorVisRegionSAS },
    { key: 'NAC', colour: Colors.ColorVisRegionNAC }
  ];
  const incomeLevels = [
    { key: 'LIC', colour: Colors.ColorVisIncomeLow },
    { key: 'LMC', colour: Colors.ColorVisIncomeLowerMiddle },
    { key: 'UMC', colour: Colors.ColorVisIncomeUpperMiddle },
    { key: 'HIC', colour: Colors.ColorVisIncomeHigh }
  ];

  const genders = [
    { key: 'women', colour: Colors.ColorVisGenderFemale },
    { key: 'men', colour: Colors.ColorVisGenderMale }
  ];

  let items = [];
  $: if (legendType == 'regions') {
    items = regions;
  } else if (legendType == 'income') {
    items = incomeLevels;
  } else if (legendType == 'gender') {
    items = genders;
  } else if (legendType == 'custom') {
    items = customItems;
  }
</script>

<div class:top class:hidden class="categorical-legend" aria-hidden="true">
  {#each items as item}
    <div class="pill-container">
      <div class={`pill ${itemSymbol}`} style:background-color={item.colour} style:border-color={item.border} />
      <div class={'label small'}>
        {legendType == 'regions'
          ? $_(`region.${item.key}`)
          : legendType == 'income'
          ? $_(`income.${item.key}`)
          : legendType == 'gender'
          ? $_(item.key).charAt(0).toUpperCase() + $_(item.key).slice(1)
          : item.key}
      </div>
    </div>
  {/each}
</div>

<style>
  .categorical-legend {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    margin: 0;
    margin: var(--space-s) 0 0 0;
  }

  .categorical-legend.top {
    margin: 0 0 var(--space-s) 0;
  }
  .categorical-legend .pill-container {
    display: flex;
    align-items: center;
    margin: 0 15px 5px 0;
  }
  .categorical-legend .pill-container .pill {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    margin-right: 5px;
    border: 1px solid transparent;
  }
  .categorical-legend .pill-container .pill.square {
    border-radius: 0px;
  }
  .categorical-legend .pill-container .pill.line {
    height: 2.5px;
    width: 20px;
    border-radius: 2px;
  }
  .hidden {
    visibility: hidden;
  }
  :global(.banner .categorical-legend .label) {
    color: var(--color-theme-dark-text);
  }
</style>
