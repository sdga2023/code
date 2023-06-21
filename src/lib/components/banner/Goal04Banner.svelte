<script>
  import { interpolateLab, piecewise, scaleSequential, mean } from 'd3';
  import { _ } from 'svelte-i18n';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import Legend from '../general/Legend.svelte';
  import * as colors from '$lib/styles/tokens.es6.js';
  import Number from '../general/Number.svelte';

  export let data;
  export let type;
  export let legend_label;
  export let legend_units;

  export let selectedCountry;

  $: countryVal =
    selectedCountry && data && data.find((d) => d.iso3c === selectedCountry)
      ? data.find((d) => d.iso3c === selectedCountry).unicef_total_closed
      : null;

  //$: meanVal = data ? mean(data, (d) => d.unicef_full_closed) : undefined;

  const ramp = piecewise(interpolateLab, [
    /*    colors.ColorBaseBlue100,
    colors.ColorBasePurple200,
    colors.ColorBasePink300,
    colors.ColorBaseRed400,
    colors.ColorBaseRed500,
    colors.ColorBaseRed600*/
    colors.ColorBaseBlue300,
    colors.ColorBaseRed500,
    colors.ColorBaseRed700
  ]);

  let legendScale = scaleSequential(ramp).domain([0, 392]);
</script>

{#if type === 'legend'}
  <Legend
    title={legend_label}
    color={legendScale}
    unitLabel={legend_units}
    digits="0"
    tickLabels={[
      { value: 0, label: 0 },
      { value: 199, label: '199 (avg)' },
      { value: 392, label: 392 }
    ]}
  />
{:else if type === 'reference-value'}
  {#if selectedCountry === 'WLD'}
    <div><p class="additional reference-label">{$_(`average`)}</p></div>
  {/if}
  <Number value={countryVal} fallback="-" digits="0" /><span class="units">{legend_units}</span>
{/if}
