<script>
  import { piecewise, interpolateLab, scaleSequentialLog } from 'd3';
  import variables from '$lib/variables.js';
  import Image from './Image.svelte';
  import { _ } from 'svelte-i18n';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Legend from '../general/Legend.svelte';

  export let activeScene;

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

<div class="map-container">
  <img
    src={`${variables.pathPrefix}/assets/images/goal14/fishinghours_${activeScene.id}.png`}
    alt="Map of apparent fishing hours"
    style="mix-blend-mode: multiply"
  />
</div>

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

<style>
  .map-container {
    width: 100%;
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: var(--space-m);
  }
  img {
    max-height: 100%;
    max-width: 100%;
  }

  @media (orientation: portrait) {
    .map-container {
      flex-grow: 0;
    }
  }
</style>
