<script>
  import Image from '../Image.svelte';
  import Legend from '$lib/components/general/Legend.svelte';
  import { interpolateRgbBasis, scaleSequential } from 'd3';
  import { _ } from 'svelte-i18n';

  export let url;
  export let labels;

  const ramp = interpolateRgbBasis(['#ffe9a4', '#35b1e5', '#134257', '#0d2c3a', '#000000']);

  let colorScale = scaleSequential(ramp).domain([0, 10704.5]);
</script>

<Image {url} full={true} />
<Legend title={$_(labels.legend_title)} color={colorScale} unitLabel="mm" />
