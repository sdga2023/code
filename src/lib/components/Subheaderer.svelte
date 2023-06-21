<script>
  import { activeGoal } from '$lib/stores/activeGoal';
  export let text;
</script>

<h3 class="subhed2 layout-main">
  {#if text}
    {@html text}
  {/if}
  <slot />
</h3>

<style>
  h3 {
    margin-top: var(--space-xl);
    margin-bottom: var(--space-m);
    font-size: var(--font-size-l);
    color: var(--color-theme-text);
    font-family: var(--font-families-andes);
    font-weight: 400;
    letter-spacing: var(--letter-spacing-5);
    line-height: var(--line-heights-145);
    border-bottom: 1px solid var(--color-grey-300);
  }
</style>
