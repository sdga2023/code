<script>
  import { scaleLinear, max } from 'd3';
  import { CategoricalLegend } from '$lib/components';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;

  export let label_composition = 'Composition';

  export let label_coastal;
  export let label_inland;
  export let label_fishing;
  export let label_aqua;
  export let label_shipping;

  const acc = (d) => d.Share;

  const LABELS = [
    { key: label_coastal, colour: Colors.ColorBaseBlue800 },
    { key: label_inland, colour: Colors.ColorBaseBlue600 },
    { key: label_fishing, colour: Colors.ColorBaseBlue400 },
    { key: label_aqua, colour: Colors.ColorBaseBlue200 },
    { key: label_shipping, colour: Colors.ColorBaseBlue100 }
  ];

  $: x = scaleLinear()
    .domain([0, max(data, (d) => acc(d))])
    .range([0, 100]);

  $: console.log(data);
</script>

<CategoricalLegend legendType="custom" customItems={LABELS} />
<div class="container">
  <div class="bar-container">
    {#each data as d, i}
      <div class="bar" style:width={acc(d) + '%'}>
        <div style:background-color={LABELS[i].colour} />
        {#if !$isMobile || i !== data.length - 2}
          <p class="label small">{acc(d)}%</p>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .container {
    display: flex;
    margin-top: var(--space-s);
  }

  p {
    margin-right: var(--space-s);
  }

  .bar-container {
    display: flex;
    flex: 1;
    flex-basis: 100%;
  }

  .bar div {
    width: 100%;
    height: var(--space-xl);
  }
  .bar p {
    width: 100%;
    text-align: center;
  }
  .bar:last-of-type p {
    text-align: end;
  }
</style>
