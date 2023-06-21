<script>
  import { max } from 'd3';
  import MortalityChart from './MortalityChart.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let parentWidth;

  let metric = 'Estimated malaria mortality rate (per 100 000 population)';
  let yearAccessor = (d) => d.Period;
</script>

<div class="malaria-mortality">
  <MortalityChart {data} {parentWidth} metrics={[metric]} {yearAccessor} fillColor={Colors.ColorVisRed} maxYear={max(data, yearAccessor)} />
</div>
