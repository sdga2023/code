<script>
  import { piecewise, interpolateLab, scaleSequentialLog } from 'd3';
  import Image from './Image.svelte';
  import { _ } from 'svelte-i18n';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Legend from '../general/Legend.svelte';

  const incomes = ['HIC', 'UMC', 'LMC', 'LIC'];

  const ramp2 = piecewise(interpolateLab, [
    Colors.ColorBaseBlue700,
    Colors.ColorBaseBlue600,
    Colors.ColorBaseBlue500,
    Colors.ColorBaseTeal400,
    Colors.ColorBaseTeal300,
    Colors.ColorBaseYellow200,
    Colors.ColorBaseYellow100
  ]);

  let legendScale2 = scaleSequentialLog(ramp2).domain([0.1, 100]).clamp(true);
</script>

<div class={'container'}>
  <Legend
    title="Apparent fishing hours"
    color={legendScale2}
    tickLabels={[
      { value: 0, label: '0' },
      { value: 1, label: '1' },
      { value: 5, label: '5' },
      { value: 25, label: '25' },
      { value: 100, label: '>100' }
    ]}
    digits="0"
  />
  {#each incomes as income}
    <div class="map-container">
      <Image url={`goal14/fishinghours_${income}.png`} />
    </div>
  {/each}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    row-gap: var(--space-xl);
  }
  .map-container {
    width: 100%;
  }
</style>
