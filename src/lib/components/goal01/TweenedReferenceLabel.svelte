<script>
  import { tweened } from 'svelte/motion';
  import * as eases from 'svelte/easing';
  import Number from '../general/Number.svelte';
  import { fade } from 'svelte/transition';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { RefCountryOffset, RefOffset } from '$lib/styles/vis';

  export let activeScene;
  export let mapX;
  export let mapY;
  export let scatterX;
  export let scatterY;
  export let country;
  export let value;
  export let unit;
  export let unitSuffix;
  export let trigger;

  $: tweenedX = tweened(mapX, {
    easing: eases.cubicInOut,
    duration: trigger == 'scroll' ? 1500 : 0
  });
  $: tweenedY = tweened(mapY, {
    easing: eases.cubicInOut,
    duration: trigger == 'scroll' ? 1500 : 0
  });

  $: if (activeScene.index > 2) {
    tweenedX.set(scatterX);
    tweenedY.set(scatterY);
  }
  $: if (activeScene.index < 3) {
    tweenedX.set(mapX);
    tweenedY.set(mapY);
  }
</script>

<text
  x={$tweenedX}
  y={$tweenedY + RefCountryOffset}
  class={'reference-label-country middle'}
  transition:fade|local
  fill={Colors.ColorReferenceCountry}
>
  {country}
</text>
<text x={$tweenedX} y={$tweenedY + RefOffset} class={'reference-label middle'} transition:fade|local fill={Colors.ColorReferenceCountry}
  ><Number {value} {unit} />{unitSuffix}</text
>
