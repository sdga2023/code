<script>
  import { arc } from 'd3-shape';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { ScatterCircleRadius, ScatterCircleRadiusMob } from '$lib/styles/vis';
  import { isMobile } from '$lib/stores/isMobile';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let hover;
  export let useY2 = false;
  export let props;
  export let showLabel = false;
  export let isLabelScene = false;
  export let i;
  export let textAnchor = 'middle';
  export let isReferenceCountry = false;

  const incomeLevel2CSSVar = {
    HIC: '--color-vis-income-high',
    UMC: '--color-vis-income-upper-middle',
    LMC: '--color-vis-income-lower-middle',
    LIC: '--color-vis-income-low'
  };

  const country = tweened(props, { easing: cubicInOut });

  $: $country = props;
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<g
  transform="translate({$country.x}, {useY2 ? $country.y2 : $country.y})"
  on:mouseover={(e) =>
    (hover = {
      country: $country,
      pos: { x: e.clientX, y: e.clientY }
    })}
  on:mousemove={(e) =>
    (hover = {
      country: $country,
      pos: { x: e.clientX, y: e.clientY }
    })}
  on:mouseout={() => (hover = undefined)}
>
  {#if isReferenceCountry}
    <circle r={($isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius) + 3} fill="black" stroke-width={2} stroke="white" />
    <circle
      r={$isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius}
      fill="var(--color-reference-country)"
      stroke-width={2}
      stroke="white"
    />
    <text class="reference-label {textAnchor}" dy={-10} x={10}>
      {$country.data.country_name}
    </text>
  {:else if showLabel}
    <circle r={($isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius) + 3} fill="black" stroke-width={2} stroke="white" />
    <circle
      r={$isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius}
      fill="var({incomeLevel2CSSVar[props.data.incomeLevel]})"
      stroke-width={2}
      stroke="white"
    />
    <text class="label geo small {textAnchor}" dy={-10} x={10}>
      {$country.data.country_name}
    </text>
  {:else}
    <circle
      r={$isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius}
      fill="var({incomeLevel2CSSVar[props.data.incomeLevel]})"
      stroke="white"
    />
  {/if}
</g>

<style>
  g {
    pointer-events: all;
  }
</style>
