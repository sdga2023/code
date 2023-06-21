<script>
  import { scaleSequential, piecewise, interpolateLab, extent } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import Legend from '../general/Legend.svelte';

  export let data;
  export let type;
  export let legend_label;

  export let selectedCountry;

  $: countryVal = data?.find((d) => d.country_code === selectedCountry)?.gini;

  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseBlue200,
    colors.ColorBasePurple300,
    colors.ColorBasePink400,
    colors.ColorBasePink500,
    colors.ColorBasePink600
  ]);

  const ex = extent(data, (d) => d.gini);

  let legendScale = scaleSequential(ramp).domain(ex);
</script>

{#if type === 'legend'}
  <Legend title={legend_label} color={legendScale} digits="0" />
{:else if type === 'reference-value'}
  <Number value={countryVal} digits="0" fallback="-" />
{/if}
