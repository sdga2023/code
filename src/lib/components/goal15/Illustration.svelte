<script>
    import variables from '$lib/variables.js';
  
    export let url;
  </script>
  
  <img src={`${variables.pathPrefix}/${url}`} />
  
  <style lang="scss">
    img {
      width: 100%;
    }
  </style>