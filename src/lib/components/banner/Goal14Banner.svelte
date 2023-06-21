<script>
  import { scaleSequential, piecewise, interpolateLab, scaleSequentialLog, scaleSequentialSqrt } from 'd3';
  import Number from '../general/Number.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import Legend from '../general/Legend.svelte';

  export let data;
  export let type;
  export let legend_label;
  export let legend_units;

  export let selectedCountry;

  $: countryVal =
    selectedCountry && data && data.find((d) => d.iso3c === selectedCountry)
      ? data.find((d) => d.iso3c === selectedCountry)?.percapita_catch
      : null;

  $: console.log(countryVal);

  //BlueRamp, reversed
  const ramp = piecewise(interpolateLab, [Colors.ColorThemeBgWeaker, Colors.ColorBaseYellow400]);

  const ramp2 = piecewise(interpolateLab, [
    Colors.ColorBaseBlue500,
    Colors.ColorBaseBlue500,
    Colors.ColorUnSdg14,
    Colors.ColorBaseTeal300,
    Colors.ColorBaseYellow200,
    Colors.ColorBaseYellow100
  ]);

  let legendScale = scaleSequentialSqrt(ramp).domain([0.1, 1000]).clamp(true);
  let legendScale2 = scaleSequentialLog(ramp2).domain([5, 300]).clamp(true);
</script>

{#if type === 'legend'}
  <Legend
    title="Apparent fishing hours"
    color={legendScale2}
    tickLabels={[
      { value: 0, label: '0' },
      { value: 15, label: '15' },
      { value: 50, label: '50' },
      { value: 300, label: '>300' }
    ]}
    digits="0"
  />
  <Legend
    title={legend_label}
    color={legendScale}
    unitLabel={legend_units}
    tickLabels={[
      { value: 0, label: '0' },
      { value: 100, label: '100' },
      { value: 500, label: '500' },
      { value: 1000, label: '>1000' }
    ]}
    digits="0"
  />
{:else if type === 'reference-value'}
  <Number value={countryVal} digits={1} units={legend_units} fallback={'-'} />
{/if}
