<script>
  import Legend from '../general/Legend.svelte';
  import { scaleSequential, piecewise, interpolateLab } from 'd3';
  import Number from '../general/Number.svelte';

  import * as colors from '$lib/styles/tokens.es6.js';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let type;
  export let selectedCountry;
  export let legend_label;
  export let legend_units;
  export let card_unit;

  $: countryVal =
    selectedCountry && data && data.find((d) => d.iso3c === selectedCountry)
      ? data.find((d) => d.iso3c === selectedCountry).pcapemis
      : undefined;

  /*
  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseRed100,
        colors.ColorBaseRed300,
        colors.ColorBaseRed500,
        colors.ColorBaseRed700
  ]);
  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseTeal400,
    colors.ColorBaseGreen300,
    colors.ColorBaseGreen200,
    colors.ColorBaseYellow200,
    colors.ColorBaseYellow100
  ]);

  const ramp = piecewise(interpolateLab, [
    colors.ColorBaseGreen200,
    colors.ColorBaseGreen300,
    colors.ColorBaseYellow300,
    colors.ColorBaseOrange400
  ]);*/
  const ramp = piecewise(interpolateLab, [colors.ColorBaseGreen300, colors.ColorBaseDarkPurple500, colors.ColorBasePurple700]);

  let legendScale = scaleSequential(ramp).domain([0, 30]);
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
      { value: 15, label: 15 },
      { value: 30, label: '>30' }
    ]}
  />
  <!--  <CategoricalLegend legendType="custom" customItems={[{ key: 'Greenhouse gas emittors', colour: '#bbbbbbbb' }]} />-->
{:else if type === 'reference-value'}
  <Number value={countryVal} fallback="-" digits={1} /><span class="units">{card_unit}</span>
{/if}
