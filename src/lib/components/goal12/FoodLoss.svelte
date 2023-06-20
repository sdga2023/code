<script>
  import { scaleLinear, max } from 'd3';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';

  export let data;

  export let label_nao;
  export let label_eur;
  export let label_ias;
  export let label_nas;
  export let label_lat;
  export let label_sas;
  export let label_ssa;

  const regionLabelKey = {
    'North America and Oceania': label_nao,
    Europe: label_eur,
    'Industrialized Asia': label_ias,
    'North Africa, West and Central Asia': label_nas,
    'Latin America': label_lat,
    'South and Southeast Asia': label_sas,
    'Sub-Saharan Africa': label_ssa
  };

  let w;

  $: barScale = scaleLinear()
    .domain([0, max(data, (d) => d.share)])
    .range([0, 100]);
</script>

<div class="barchart" bind:clientWidth={w}>
  <ul>
    {#each data as d}
      <li>
        <div>
          <p class="label geo region small">{regionLabelKey[d.region]}</p>
          <div class="loss-bar" style={`width: ${barScale(d.share)}%`}>
            <p class="number white"><Number value={d.share} digits="1" unit="%" /></p>
          </div>
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .barchart {
    width: 100%;
  }

  li {
    margin-top: var(--space-xs);
  }

  div.loss-bar {
    display: flex;
    justify-content: left;
    align-items: center;
  }

  div.loss-bar p {
    margin-left: var(--space-2xs);
  }

  div.loss-bar {
    height: 2rem;
  }

  div.loss-bar {
    background-color: var(--color-vis-binary-neg);
  }
</style>
