<script>
  import variables from '$lib/variables.js';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let url;
  export let fires;
  export let other;

  const legendItems = [
    { key: fires, colour: Colors.ColorBaseRed500 },
    { key: other, colour: Colors.ColorBasePurple400 }
  ];
</script>

<CategoricalLegend top={true} legendType={'custom'} customItems={legendItems} />
<img src={`${variables.pathPrefix}/assets/images/${url}`} />

<style>
</style>
