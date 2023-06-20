<script>
  import { _ } from 'svelte-i18n';

  export let goal;
  export let target;

  $: objType = target ? 'target' : 'goal';
  $: fullLabel = objType === 'target' ? `${goal}.${target}` : goal;

  //  $: prefixLabel = objType === 'target' ? $_('base.sdg') + ' ' + $_('base.target') + ' ' : $_('base.sdg') + ' ';

  $: uniqueId = `${objType}_` + new Date().getTime() + fullLabel;
</script>

<div class="summary" style="--sdg-color: var(--color-un-sdg{goal})">
  <input type="checkbox" id={uniqueId} /><label class="unstyled" for={uniqueId}
    ><span class="goal-target">
      {#if target}
        <span class="goal">{goal}.</span><span class="target">{target}</span>
      {:else}
        <span class="goal">{goal}</span>
      {/if}
    </span></label
  >
  <p class="details goal-details">
    <span class="goal-target lead">{fullLabel}</span><span class="target">{$_('target.' + fullLabel)}</span>
  </p>
</div>
