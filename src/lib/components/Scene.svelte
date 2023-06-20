<script>
  import { activeGoal } from '$lib/stores/activeGoal';
  import { isScreenshotting } from '$lib/stores/isScreenshotting';

  export let text = '';
  export let activeScene;
  export let hidden = false;
</script>

<div class="scene">
  {#if !hidden}
    <div class="content" class:invisible={$isScreenshotting} style="--goal-color : var(--color-un-sdg{$activeGoal.number})">
      {@html text}
      <slot {activeScene} />
    </div>
  {/if}
</div>

<style type="scss">
  .scene {
    padding-top: calc(50vh - 50%);
    padding-bottom: calc(50vh + 50%);
  }
  .scene:last-of-type {
    padding-bottom: 100vh;
  }

  .content {
    color: var(--color-theme-text);
    background-color: var(--color-theme-bg);
    padding: var(--space-s);
    /* border-left: 4px solid var(--goal-color);*/
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }
  .content.invisible {
    visibility: hidden;
  }

  @media screen and (max-width: 872px) {
    .scene {
      width: 100%;
      height: auto;
      margin: 0;
      margin-top: 60vh;

      z-index: 9999;

      &:last-of-type {
        padding-bottom: 100vh;
        margin-bottom: var(--space-xl);
      }
    }
    .content {
      color: var(--color-theme-text);
      background-color: var(--color-theme-bg);
      border-left: none;
      /*border-top: 4px solid var(--goal-color);*/
      padding: var(--space-s);
      box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
</style>
