<script>
  import { base } from '$app/paths';

  export let minHeight = true;
</script>

<div class="loading" style:min-height={minHeight ? '60vh' : 'none'}>
  <img src={`${base}/assets/images/tail-spin.svg`} alt="Loading" />
  <div style="display: flex">
    <div style="width: 75%" />
    <div style="width: 25%">
      <slot name="scenes" activeScene="{{ id: '', index: 0 }}}" />
    </div>
  </div>
</div>

<style>
  .loading {
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    width: 50px;
    height: 50px;
  }
</style>
