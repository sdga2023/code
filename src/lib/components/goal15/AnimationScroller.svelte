<script>
  import variables from '$lib/variables.js';
  import { GreenRamp, RedRamp } from '$lib/styles/colorscales';
  import Legend from '../general/Legend.svelte';
  import { scaleSequential } from 'd3';

  export let activeScene;
  export let id;
  export let scale;

  // restrict to 70% of scroller progress:
  $: activeFrame = activeScene.offset < 0 ? 0 : Math.floor((activeScene.offset * 100) / 3.1818);
  $: frameNumber = activeFrame < 10 ? '0' + activeFrame : activeFrame < 22 ? activeFrame : 21;
  $: colorScale = scaleSequential(GreenRamp).domain([0, 100]);
  $: colorScaleYears = scaleSequential(RedRamp).domain([2001, 2021]);
</script>

<div class="legends">
  <div class="legend-container">
    <Legend title={'Tree cover in 2000'} color={colorScale} units="%" digits="0" />
  </div>
  <div class="legend-container">
    <Legend
      title={'Year of tree cover loss'}
      color={colorScaleYears}
      digits="0"
      tickLabels={[
        { value: 2001, label: '2001' },
        { value: 2021, label: '2021' }
      ]}
    />
  </div>
</div>
<div class="image-container">
  <img src={`${variables.pathPrefix}/assets/images/goal15/${id}-tree-cover-loss${frameNumber}.jpg`} />
  <img class="scale-image" src={`${variables.pathPrefix}/assets/images/goal15/${id}-scale.png`} />
  <div class="year label large">{'20' + frameNumber}</div>
  <div class="scale-label">{scale}</div>
</div>

<style>
  .image-container {
    max-height: calc(100% - 40px);
    position: relative;
  }
  .image-container img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
  .legends {
    display: flex;
    padding-bottom: 4px;
  }
  .legend-container {
    flex-grow: 1;
  }
  .year {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    text-shadow: -1px -1px white, -1px 1px white, 1px 1px white, 1px -1px white, -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
  }
  .scale-image {
    position: absolute;
    left: 0px;
    bottom: 6px;
  }
  .scale-label {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    text-shadow: -1px -1px white, -1px 1px white, 1px 1px white, 1px -1px white, -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
  }
</style>
