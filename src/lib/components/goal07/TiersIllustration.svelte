<script>
    import variables from '$lib/variables.js';
  
    export let url;
  </script>
  
  <img src={`${variables.pathPrefix}/assets/images/${url}`} />
  
  <style lang="scss">
    img {
      line-height: var(--line-heights-175);
      font-weight: var(--font-weights-regular);
      font-family: var(--font-families-open-sans);
      font-size: var(--font-size-m);
      color: var(--color-theme-dark-bg);
    }
  </style>