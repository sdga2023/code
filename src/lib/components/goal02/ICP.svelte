<script>
  import { getRegion, getIncomeLevel } from './../../../data/countryRegionIncomeDictionary';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
  import ICPChart from './ICPChart.svelte';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let activeScene;
  export let data;
  export let parentWidth;
  export let parentHeight;

  $: w = parentWidth;
  $: h = parentHeight;

  export let labels;

  let normalized = [];

  $: if (data) {
    normalized = data
      .reduce((acc, cur) => {
        if (cur.gdp !== null && cur.CoCA !== null && cur.CoNA !== null && cur.CoRD !== null) {
          acc.push({
            ...cur,
            region: getRegion(cur.country_code).endsWith('is missing') ? undefined : getRegion(cur.country_code),
            incomeLevel: getIncomeLevel(cur.country_code).endsWith('is missing') ? undefined : getIncomeLevel(cur.country_code)
          });
        }

        return acc;
      }, [])
      .sort((a, b) => a.region?.localeCompare(b.region) || a.country_code?.localeCompare(b.country_code))
      .map((d, i) => ({
        ...d,
        regionIndex: i
      }))
      .map((d, i) => ({
        ...d,
        gdpIndex: i
      }))
      .sort((a, b) => a.gdp - b.gdp);
  }

  const hoverStore = writable(undefined);
  setContext('icp', { hoverStore, w });
</script>

{#if data}
  <h2 class="label title">
    {activeScene.index === 0
      ? $_(labels.ranking)
      : activeScene.index < 4
      ? $_(labels.CoCA)
      : activeScene.index < 8
      ? $_(labels.CoNA)
      : $_(labels.CoRD)}
  </h2>
  <div class="svg-container" bind:clientHeight={h} bind:clientWidth={w}>
    <ICPChart
      bind:hover={$hoverStore}
      yLabel={$_(labels.cost)}
      {activeScene}
      data={normalized}
      {labels}
      parentWidth={w / 2}
      parentHeight={h}
      props={['CoCA', 'CoNA', 'CoRD']}
      chartIndex={0}
    />
    <ICPChart
      yLabel={$_(labels.affordability, {
        values: { meal: $_(activeScene.index < 4 ? labels.meal_1 : activeScene.index < 8 ? labels.meal_2 : labels.meal_3) }
      })}
      {activeScene}
      data={normalized}
      {labels}
      parentWidth={w / 2}
      parentHeight={h}
      bind:hover={$hoverStore}
      props={['CoCA_headcount', 'CoNA_headcount', 'CoRD_headcount']}
      chartIndex={1}
    />
  </div>
  <div class="legend">
    <CategoricalLegend legendType="income" />
  </div>
  {#if $hoverStore !== undefined}
    <Tooltip visible={true} targetPos={$hoverStore.pos}>
      <div>{$_(`country.${$hoverStore.country.data.country_code.toLowerCase()}`)}</div>
      {#if activeScene.index >= 1}
        {@const headcount = activeScene.index < 4 ? 'CoCA_headcount' : activeScene.index < 8 ? 'CoNA_headcount' : 'CoRD_headcount'}
        <hr />
        <div class="details small label">
          {@html $_(labels.popup_text_1, {
            values: {
              country: $_(`country.${$hoverStore.country.data.country_code.toLowerCase()}`),
              meal: activeScene.index < 4 ? $_(labels.meal_1) : activeScene.index < 8 ? $_(labels.meal_2) : $_(labels.meal_3),
              amount: `$${$hoverStore.country.data.CoCA}`
            }
          })}
          {#if [2, 3, 6, 7, 10].includes(activeScene.index)}
            {#if Math.round(100 - $hoverStore.country.data[headcount]) === 100}
              {@html $_(labels.popup_text_2, { values: { country: $_(`country.${$hoverStore.country.data.country_code.toLowerCase()}`) } })}
            {:else}
              {@html $_(labels.popup_text_3, {
                values: {
                  country: $_(`country.${$hoverStore.country.data.country_code.toLowerCase()}`),
                  percent: Math.round($hoverStore.country.data[headcount])
                }
              })}
            {/if}
          {/if}
        </div>
      {/if}
    </Tooltip>
  {/if}
{/if}

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    gap: 14px;
  }

  h2 {
    width: 100%;
    margin: 0 auto;
    text-align: center;
  }
</style>
