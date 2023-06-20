<script>
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import Flag from './Flag.svelte';
</script>

<Flag selectedCountry={$referenceCountry} />
