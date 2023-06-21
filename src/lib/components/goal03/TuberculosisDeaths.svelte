<script>
  import * as Colors from '$lib/styles/tokens.es6.js';
  import MortalityChart from './MortalityChart.svelte';

  export let data;
  export let parentWidth;

  export let millions_label;

  let metric1 = 'Estimated number of deaths due to tuberculosis (all forms, excluding HIV)';
</script>

<div class="tuberculosis-deaths">
  <MortalityChart
    {data}
    {parentWidth}
    maxYear={2021}
    yearAccessor={(d) => d.Year}
    metrics={[metric1]}
    numberLabel={millions_label}
    textLabelizer={(d) => d / 1000000}
    fillColor={Colors.ColorVisRed}
  />
</div>
