<script>
  import { getContext } from 'svelte';
  import { scaleCanvas } from 'layercake';
  import { geoPath } from 'd3-geo';
  import oceanJSON from '../../../data/other/ocean.json';
  import { ColorThemeBgWeaker } from '$lib/styles/tokens.es6';

  export let gridToShow;

  const { data, width, height } = getContext('LayerCake');

  const { ctx } = getContext('canvas');
  export let projection;
  export let stroke = '#ffffff';
  export let strokeWidth = 0.001;

  $: geoPathFn = geoPath(projection);

  $: featuresToDraw = $data;

  $: {
    if ($ctx && geoPathFn) {
      scaleCanvas($ctx, $width, $height);
      $ctx.clearRect(0, 0, $width, $height);

      featuresToDraw.forEach((feature) => {
        $ctx.beginPath();
        geoPathFn.context($ctx);
        geoPathFn(feature);

        $ctx.fillStyle = feature.properties.site.properties['color' + gridToShow];
        $ctx.fill();

        $ctx.lineWidth = strokeWidth;
        $ctx.strokeStyle = stroke;
        $ctx.stroke();
      });

      $ctx.beginPath();
      geoPathFn.context($ctx);
      geoPathFn(oceanJSON);
      $ctx.fillStyle = ColorThemeBgWeaker;
      $ctx.fill();
    }
  }
</script>
