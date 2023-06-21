<script>
  import { _ } from 'svelte-i18n';

  import { max, scaleLinear } from 'd3';
  import ForegoneCareSlope from './ForegoneCareSlope.svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import { CategoricalLegend } from '$lib/components';

  export let parentWidth;
  export let parentHeight;

  export let label_pooled_sample = '';
  export let label_reason_financial = '';
  export let label_reason_covid = '';
  export let label_reason_supply = '';
  export let label_reason_other = '';

  export let data;
  export let activeScene;

  let h = parentHeight;

  $: tileWidth = parentWidth / 2 - 22;
  $: tileHeight = h / 2 - 5;

  const poolKey = 'Pooled sample';
  const order = ['Pooled sample', 'LIC', 'LMIC', 'UMIC'];

  const barColors = {
    'Pooled sample': 'var(--color-theme-dark-bg-weaker)',
    LIC: 'var(--color-vis-income-low)',
    LMIC: 'var(--color-vis-income-lower-middle)',
    UMIC: 'var(--color-vis-income-upper-middle)'
  };

  const reasonColors = {
    'Financial barriers': 'var(--color-base-teal400)',
    'COVID-19-related reasons': 'var(--color-base-red600)',
    'Health care supply constraints': 'var(--color-base-blue300)',
    'Other reasons': 'var(--color-grey-300)'
  };

  let maxVal = 0;

  let keyedData = [];
  $: if (data) {
    const keys = Array.from(new Set(data.map((d) => d['Country group'])));
    keys.forEach((key) => {
      keyedData[key] = data.filter((d) => d['Country group'] === key);
    });

    maxVal = max(data.filter((d) => d.Variable === 'Forgone care').map((d) => Math.max(d['2020'], d['2021'])));
  }

  $: reasons = Object.keys(reasonColors).map((key) => ({ key, colour: reasonColors[key] }));
</script>

<div class="foregone-care-grid" bind:clientHeight={h}>
  {#if keyedData}
    {#each order as key}
      <ForegoneCareSlope
        title={key === poolKey ? label_pooled_sample : $_(`income.${key.toLowerCase()}`)}
        data={keyedData[key]}
        w={tileWidth}
        h={tileHeight}
        {maxVal}
        {label_reason_financial}
        {label_reason_covid}
        {label_reason_supply}
        {label_reason_other}
        {reasonColors}
        showFull={activeScene.id !== 'overall'}
        barColor={barColors[key]}
      />
    {/each}
  {/if}
</div>
<CategoricalLegend hidden={activeScene?.index < 1} legendType="custom" customItems={reasons} />

<style>
  .foregone-care-grid {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    overflow: hidden;
    gap: 10px;
  }
</style>
