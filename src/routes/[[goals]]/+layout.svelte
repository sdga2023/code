<script>
  import LoopHeader from '$lib/external/loop-header.svelte';
  import { _ } from 'svelte-i18n';
  import { isScreenshotting } from '$lib/stores/isScreenshotting';
  import { onDestroy, onMount } from 'svelte';

  let subscription;
  let screenshot = false;

  onMount(() => {
    try {
      // manual subscription to store is necessary since window access (required in isScreenshotting store) isn't supported in +layout files (apparently)
      subscription = isScreenshotting.subscribe((value) => (screenshot = value));
    } catch (e) {
      console.log(e);
    }
  });

  onDestroy(() => {
    if (subscription) {
      subscription();
    }
  });
</script>

<LoopHeader {screenshot} />
<slot />
