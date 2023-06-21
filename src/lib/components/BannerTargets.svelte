<script>
  import { activeGoal } from '$lib/stores/activeGoal';
  import { _ } from 'svelte-i18n';

  export let targets;

  $: displayTargets = targets.map((t) => t.target);

  let targetOpen = null;
  function openTarget(t) {
    if (targetOpen === t) {
      targetOpen = null;
    } else {
      targetOpen = t;
    }
  }

  $: {
    // close open target when changing chapters:
    $activeGoal;

    targetOpen = null;
  }
</script>

<div class="container intro" style="--sdg-color: var(--goal-color); --sdg-text-color : var(--color-un-text-sdg{$activeGoal.number}">
  <span class="sdg-target">{$_(`base.sdg.targets`)}</span>
  {$_(`target.covered`)}
  {#if targets}
    {#each displayTargets as t}
      <div class="summary" class:active={targetOpen === t} on:click={() => openTarget(t)}>
        <span class="goal-target">
          <span class="goal">{$activeGoal.number}.</span><span class="target">{t}</span>
        </span>
      </div>
    {/each}
  {/if}
  {#if targetOpen}
    <p class="details goal-details">
      <span class="target">{$_('target.' + `${$activeGoal.number}.${targetOpen}`)}</span>
    </p>
  {/if}
</div>

<style>
  .intro {
    font-family: var(--font-families-andes);
    font-size: var(--font-size-m);
    line-height: var(--line-heights-175);
    color: var(--color-theme-dark-text);
    font-weight: var(--font-weights-regular);
  }
  .sdg-target {
    font-weight: var(--font-weights-semibold);
  }

  .container {
    margin-top: var(--space-s);
  }

  .summary {
    cursor: pointer;
  }

  .summary .goal-target {
    background-color: var(--color-theme-dark-bg-weaker);
  }

  .summary.active .goal-target,
  .summary .goal-target:hover {
    background-color: var(--sdg-color);
    color: var(--sdg-text-color);
  }

  .goal-details {
    border-top: 2px solid var(--sdg-color);
    border-bottom: 2px solid var(--sdg-color);

    font-style: italic;
    font-size: unset;
    padding: var(--space-s) 0;
    margin: var(--space-m) 0;
  }
  .goal-details .target {
    font-weight: var(--font-weights-regular);
  }
</style>
