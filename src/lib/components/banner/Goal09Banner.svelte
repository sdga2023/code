<script>
  import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;
  export let type;
  export let selectedCountry;
  export let legend_label;
  export let legend_units;

  $: countryVal =
    selectedCountry && data && data.find((d) => d.iso3c === selectedCountry)
      ? data.find((d) => d.iso3c === selectedCountry).transport_road
      : undefined;

  //const ramp = piecewise(interpolateLab, [colors.ColorBaseRed100, colors.ColorBaseRed300, colors.ColorBaseRed500, colors.ColorBaseRed700]);

  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseBlue200,
    colors.ColorBaseOrange300,
    colors.ColorBaseOrange400,
    colors.ColorBaseRed500,
    colors.ColorBaseRed600
  ]);

  let legendScale = scaleSequential(ramp).domain([0, 5000]);
</script>

{#if type === 'legend'}
  <Legend
    title={legend_label}
    color={legendScale}
    units=""
    digits="0"
    unitLabel={legend_units}
    tickLabels={[
      { value: 0, label: 0 },
      { value: 2500, label: 2500 },
      { value: 5000, label: '>5000' }
    ]}
  />
{:else if type === 'reference-value'}
  <Number value={countryVal} fallback="-" digits={0} /><span class="units">{legend_units}</span>
{/if}
