<script>
  import variables from '$lib/variables.js';
  export let activeScene;
  export let parentHeight;
  export let parentWidth;

  $: highLayout = parentWidth / parentHeight < 1.3 || parentHeight > 1200;

  $: illustrationMapper = {
    tropical: highLayout
      ? 'assets/illustrations/forests/6-4TropicalForest.png'
      : 'assets/illustrations/forests/6-4TropicalForest_square.png',
    subtropical: highLayout
      ? 'assets/illustrations/forests/6-4SubtropicalForest.png'
      : 'assets/illustrations/forests/6-4SubtropicalForest_square.png',
    temperate: highLayout
      ? 'assets/illustrations/forests/6-4TemperateForest.png'
      : 'assets/illustrations/forests/6-4TemperateForest_square.png',
    boreal: highLayout ? 'assets/illustrations/forests/6-4BorealForest.png' : 'assets/illustrations/forests/6-4BorealForest_square.png'
  };
  const mapMapper = {
    tropical: 'assets/images/goal15/tropical-forests-equal-earth-bg.png',
    subtropical: 'assets/images/goal15/subtropical-forests-equal-earth-bg.png',
    temperate: 'assets/images/goal15/temperate-forests-equal-earth-bg.png',
    boreal: 'assets/images/goal15/boreal-forests-equal-earth-bg.png'
  };
</script>

<div class={highLayout ? 'map-container high-layout' : 'map-container'}>
  <img src={`${variables.pathPrefix}/${mapMapper[activeScene.id]}`} />
</div>

<div class={highLayout ? 'illustration-container high-layout' : 'illustration-container'}>
  <img class="illustration" src={`${variables.pathPrefix}/${illustrationMapper[activeScene.id]}`} />
</div>

<style>
  .illustration-container {
    position: absolute;
    bottom: 20px;
    left: 10px;
    width: 100%;
  }
  img.illustration {
    border-radius: 50%;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
    border: 4px solid white;
    max-width: 25vw;
  }
  /*.illustration-container.high-layout {
        position: absolute;
        bottom: 4px;
        left: 50%;
        width: 100%;
        height: 50%;
    }*/

  .illustration-container.high-layout {
    position: static;
    width: 100%;
    height: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: var(--space-l);
    max-height: 500px;
  }
  .illustration-container.high-layout img.illustration {
    border-radius: 0px;
    box-shadow: none;
    border: none;
    height: 100%;
    max-width: 100%;
  }
  .map-container {
    max-height: 100%;
  }
  .map-container.high-layout {
    position: static;
  }
  .map-container img {
    max-height: 100%;
    margin: auto;
  }
</style>
