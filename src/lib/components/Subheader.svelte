<script>
  import { activeGoal } from '$lib/stores/activeGoal';
  export let text;
</script>

<div class="subhed layout-main" style="--goal-color : var(--color-un-sdg{$activeGoal.number})">
  <h2>
    {#if text}
      {@html text}
    {/if}
    <slot />
  </h2>
</div>

<style>
  div {
    margin-top: var(--space-3xl);
    margin-bottom: var(--space-l);
  }

  h2 {
    font-size: var(--font-size-xl);
    color: var(--color-theme-text);
    font-family: var(--font-families-andes);
    font-weight: bold;
    letter-spacing: var(--letter-spacing-0);
    line-height: var(--line-heights-145);
    /* margin: var(--space-m) 0 var(--space-s) 0;
     border-left: 8px solid var(--goal-color);
    padding-left: var(--space-s);*/
    padding-top: var(--space-xs);
    border-top: 4px solid var(--color-theme-text);
  }
</style>
