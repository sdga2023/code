<script>
  import { fade } from 'svelte/transition';
  import { tweened } from 'svelte/motion';
  import variables from '$lib/variables.js';

  export let parentWidth;
  export let parentHeight;

  let year = 2000;

  const opacity = tweened(0, { duration: 500 });
  const t = tweened(0, { duration: 1900, delay: 0 });

  setInterval(() => {
    year = year === 2000 ? 2021 : 2000;
    $opacity = $opacity === 1 ? 0 : 1;

    $t = $t === 1 ? 0 : 1;
  }, 2000);
</script>

<div class="container">
  <div class="inner">
    <img src={`${variables.pathPrefix}/assets/images/goal06/lakemead_etm_2000220_lrg.jpg`} alt="Lake Mead Satellite" />
    <img
      style="position: absolute; top: 0; left: 0; opacity: {$opacity};"
      src={`${variables.pathPrefix}/assets/images/goal06/lakemead_oli_2021221_lrg.jpg`}
      alt="Lake Mead Satellite"
    />
    <p class="year label large">{year}</p>
    <div class="progress-bar" style="width: {130 - (year === 2021 ? 1 - $t : $t) * 130}px;" />
  </div>
</div>

<style>
  img {
    transition: opacity 0.5;
  }
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .inner {
    position: relative;
    text-align: center;
  }

  .year {
    position: absolute;
    top: 5px;
    left: 0px;
    width: 100%;
    font-weight: var(--font-weights-semibold);
    color: var(--color-theme-dark-text);
    font-size: 60px;
    text-align: center;
  }

  .progress-bar {
    position: absolute;
    top: 80px;
    left: calc(50% - 65px);
    height: 4px;
    background: var(--color-theme-bg);
  }
</style>
