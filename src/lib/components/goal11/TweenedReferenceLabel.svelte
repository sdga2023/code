<script>
    import { tweened } from 'svelte/motion';
    import * as eases from 'svelte/easing';
    import Number from '../general/Number.svelte';
    import { fade } from 'svelte/transition';
    import * as Colors from '$lib/styles/tokens.es6.js';
    import { RefCountryOffset, RefOffset } from '$lib/styles/vis';
    import { _ } from 'svelte-i18n';
  
    export let activeScene;
    export let refCountryData;
    export let xScale
    export let mapX;
    export let mapY;
    export let yScale;
    export let unit;

    $: value = activeScene.index < 1
        ? refCountryData.properties.waste
        : refCountryData.properties.wastepercap
  
    $: tweenedX = tweened(mapX, {
      easing: eases.cubicOut,
      duration: 1000
    });
    $: tweenedY = tweened(mapY, {
      easing: eases.cubicOut,
      duration: 1000
    });
  
    $: if (activeScene.index == 2) {
      tweenedX.set(xScale(refCountryData.properties.sharepopurban));
      tweenedY.set(yScale(refCountryData.properties.wastepercap));
    }
    $: if (activeScene.index == 3) {
      tweenedX.set(xScale(refCountryData.properties.gdp));
      tweenedY.set(yScale(refCountryData.properties.wastepercap));
    }
    $: if (activeScene.index < 2) {
      tweenedX.set(mapX);
      tweenedY.set(mapY);
    }
  </script>
  
  <text
    x={$tweenedX}
    y={$tweenedY + RefCountryOffset}
    class={'reference-label-country middle'}
    fill={Colors.ColorReferenceCountry}
    transition:fade|local
  >
    {$_(`country.${refCountryData.properties.iso3c.toLowerCase()}`)}
  </text>
  <text x={$tweenedX} y={$tweenedY + RefOffset} class={'reference-label middle'} transition:fade|local fill={Colors.ColorReferenceCountry}
    ><Number value={value} digits={0}/> {unit}</text
  > 