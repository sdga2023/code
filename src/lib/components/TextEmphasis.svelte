<script>
  import { activeGoal } from '$lib/stores/activeGoal';
  export let text;
</script>

<div class="text-emphasis layout-main" style="--goal-color : var(--color-un-sdg{$activeGoal.number})">
  <hr />
  <p>{@html text}</p>
  <hr />
</div>

<style type="scss">
  .text-emphasis {
    p {
      font-family: var(--font-families-andes);
      font-size: var(--font-size-l);
      line-height: var(--line-heights-145);
      text-align: center;
    }

    hr {
      width: var(--col-2);
      margin: 0 auto;
      border-top: 1px solid var(--color-grey-200);
    }

    hr:first-of-type {
      margin-top: var(--space-2xl);
      margin-bottom: var(--space-m);
    }

    hr:last-of-type {
      margin-top: var(--space-m);
      margin-bottom: var(--space-2xl);
    }
  }
</style>
