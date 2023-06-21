<script>
  export let data;
  export let activeScene;
</script>

<svg class="simple-vis">
  {#if data}
    <text x="10" y="30">{data.length}</text>
  {/if}
  <text x="10" y="60">scene: #{activeScene.index} {activeScene.id}</text>
</svg>

<style>
  .simple-vis {
    width: 100px;
    height: 100px;
    background-color: purple;
  }
</style>
