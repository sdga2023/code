<script>
  import variables from '$lib/variables.js';
  import { GreenRamp, RedRamp } from '$lib/styles/colorscales';
  import Legend from '../general/Legend.svelte';
  import { scaleSequential } from 'd3';

  export let url;

  $: colorScale = scaleSequential(GreenRamp).domain([0, 100]);
  $: colorScaleYears = scaleSequential(RedRamp).domain([2000, 2021]);

</script>

<div class="legends">
    <div class="legend-container">
      <Legend title={'Tree cover in 2000'} color={colorScale} units="%" digits="0" />
    </div>
    <div class="legend-container">
      <Legend title={'Year of tree cover loss'} color={colorScaleYears} digits="0" tickLabels={[
        { value: 2000, label: '2000' },
        { value: 2021, label: '2021' }
      ]}/>
    </div>
    </div>

<video controls>
  <source src={`${variables.pathPrefix}/assets/images/${url}`} type="video/mp4" />
</video>


<style lang="scss">
  video {
    line-height: var(--line-heights-175);
    font-weight: var(--font-weights-regular);
    font-family: var(--font-families-open-sans);
    font-size: var(--font-size-m);
    color: var(--color-theme-dark-bg);

    /*width: 100%;*/
  }
  .legends {
    display: flex;
    padding-bottom: 4px;
  }
  .legend-container {
    flex-grow: 1;
  }
</style>
