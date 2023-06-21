<script>
  import AirTrafficMultiple from './AirTrafficMultiple.svelte';
  export let data;
</script>

<div class="layout-main">
  <AirTrafficMultiple {data} metric={'containers'} />
</div>
