<script>
  import { extent, scaleSequential, piecewise, interpolateLab } from 'd3';
  import Number from '../general/Number.svelte';
  import { _ } from 'svelte-i18n';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import Legend from '../general/Legend.svelte';

  export let data;
  export let type;

  export let legend_label;
  export let legend_units;
  export let selectedCountry;
  export let val_units;

  /*
  const ramp = piecewise(interpolateLab, [
    colors.ColorBasePurple500,
    colors.ColorBaseTeal400,
    colors.ColorBaseGreen300,
    colors.ColorBaseGreen200,
    colors.ColorBaseGreen100
  ]);*/

  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseYellow100,
    colors.ColorBaseYellow300,
    colors.ColorBaseOrange500,
    colors.ColorBaseOrange700
  ]);

  const scale = scaleSequential(ramp).domain([0, 1400]);

  $: countryVal = data?.find((d) => d.iso3c === selectedCountry)?.wastegen_pc * 1000;
</script>

{#if type === 'legend'}
  <Legend title={legend_label} color={scale} unitLabel={legend_units} digits="0" />
{:else if type === 'reference-value'}
  {#if selectedCountry === 'WLD'}
    <div><p class="additional reference-label">{$_(`average`)}</p></div>
  {/if}
  <Number value={countryVal} fallback="-" digits="0" /><span class="units">{val_units}</span>
{/if}
