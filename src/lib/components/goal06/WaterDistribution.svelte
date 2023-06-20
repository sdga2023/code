<script>
  import WaterAnimation from './WaterAnimation.svelte';

  let elapsed = 0;

  function loop(e) {
    requestAnimationFrame(loop);
    elapsed = e;
  }

  loop();
</script>

<div class="archie_water_distribution">
  <svg width="100%" height={800}>
    <g transform="translate(5, 400)" />
  </svg>
</div>

<style>
  .archie_water_distribution {
    grid-column: full;
  }
</style>
