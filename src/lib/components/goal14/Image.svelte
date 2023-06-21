<script>
  import variables from '$lib/variables.js';
  export let url;
  export let alt;
  export let h;
</script>

<img src={`${variables.pathPrefix}/assets/images/${url}`} {alt} height={h} style="mix-blend-mode: multiply" />
