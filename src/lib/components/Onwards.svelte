<script>
  import { _ } from 'svelte-i18n';
  import vars from '$lib/variables.js';
  import { activeGoal } from '$lib/stores/activeGoal';
  import chapters from '../../data/chapters.js';

  import { base } from '$app/paths';

  $: goal = $activeGoal.number;

  let prevGoal;
  let nextGoal;

  $: if (goal) {
    if (goal > 1) {
      const prevGoalString = ('' + (goal - 1)).length === 1 ? '0' + (goal - 1) : goal - 1;
      const prevGoalId = 'goal' + prevGoalString;
      prevGoal = {
        n: goal - 1,
        href: base + '/' + chapters[goal - 1]?.url ?? '/',
        id: prevGoalId
      };
    } else {
      prevGoal = null;
    }
    if (goal < 17) {
      const nextGoalString = ('' + (goal + 1)).length === 1 ? '0' + (goal + 1) : goal + 1;
      const nextGoalId = 'goal' + nextGoalString;
      nextGoal = {
        n: goal + 1,
        href: base + '/' + chapters[goal + 1]?.url ?? '/',
        id: nextGoalId
      };
    } else {
      nextGoal = null;
    }
  }
</script>

<div
  class="onwards layout-full"
  style="--sdg-color-prev: var(--color-un-sdg{$activeGoal.number - 1}); 
  --sdg-color-next: var(--color-un-sdg{$activeGoal.number + 1}); 
  --dark-arrow-right: {`url(${vars.pathPrefix}/assets/icons/arrow-right.svg)`};
  --dark-arrow-left: {`url(${vars.pathPrefix}/assets/icons/arrow-left.svg)`};
  --light-arrow-right: {`url(${vars.pathPrefix}/assets/icons/arrow-right-white.svg)`};
  --light-arrow-left: {`url(${vars.pathPrefix}/assets/icons/arrow-left-white.svg)`}"
>
  <div class="back"><a href="#top"><p class="read">↑ Back to the top</p></a></div>
  <div class="links">
    {#if prevGoal}
      <a href={prevGoal.href} class="goal prev">
        <div class="icon" />
        <div class="text">
          <h2>{$_('base.sdg')} {prevGoal.n}</h2>
          <h1>{$_(prevGoal.id + '.title', { default: chapters?.[prevGoal.n + 1]?.title })}</h1>
        </div>
      </a>
    {:else}
      <div class="goal" />
    {/if}

    {#if nextGoal}
      <a href={nextGoal.href} class="goal next"
        ><div class="text">
          <h2>{$_('base.sdg')} {nextGoal.n}</h2>
          <h1>{$_(nextGoal.id + '.title', { default: chapters?.[nextGoal.n + 1]?.title })}</h1>
        </div>
        <div class="icon" />
      </a>
    {:else}
      <div class="goal" />
    {/if}
  </div>
</div>

<style type="scss">
  .onwards {
    background-color: var(--color-theme-dark-bg);
    padding: var(--space-xl) 0 var(--space-3xl) 0;
  }
  .back {
    padding-bottom: var(--space-2xl);
    width: 100%;
    text-align: center;
  }
  .read {
    color: var(--color-theme-dark-text-weaker);
  }
  .links {
    width: var(--col-12);
    max-width: var(--col-12);
    display: flex;
    justify-content: space-between;
    gap: var(--space-l);
    margin: 0 auto;
  }

  .icon {
    width: 30px;
    height: 30px;
    background-color: var(--color-theme-bg-weakest);
    border-radius: 15px;

    flex: 0 0 30px;

    background-repeat: no-repeat;
    background-position: center center;
  }

  .prev .icon {
    background-image: var(--dark-arrow-left);
  }
  .next .icon {
    background-image: var(--dark-arrow-right);
  }

  .goal:first-child {
    text-align: left;
    .icon {
      margin-right: var(--space-s);
    }
  }
  .goal:last-child {
    text-align: right;
    .icon {
      margin-left: var(--space-s);
    }
  }

  .goal {
    text-decoration: none;
    display: flex;

    .text {
      flex-grow: 1;
    }

    &:hover {
      &.next h1 {
        border-bottom: 3px solid var(--sdg-color-next);
      }

      &.next .icon {
        background-color: var(--sdg-color-next);
        background-image: var(--light-arrow-right);
      }

      &.prev h1 {
        border-bottom: 3px solid var(--sdg-color-prev);
      }
      &.prev .icon {
        background-color: var(--sdg-color-prev);
        background-image: var(--light-arrow-left);
      }
    }
  }

  h1,
  h2 {
    font-family: var(--font-families-andes);
    letter-spacing: var(--letter-spacing-5);
  }

  h1 {
    font-size: var(--font-size-l);
    text-transform: uppercase;
    line-height: var(--line-heights-120);
    color: var(--color-theme-dark-text);
    border-bottom: 3px solid #ffffff00;
  }

  h2 {
    padding-top: var(--space-2xs);
    font-weight: var(--font-weights-semibold);
  }

  .prev h2 {
    color: var(--color-theme-dark-text);
  }
  .next h2 {
    color: var(--color-theme-dark-text);
  }
  @media screen and (max-width: 872px) {
    .links {
      width: 100%;
      max-width: 100%;
    }

    .text {
      max-width: 100%;
      width: 100%;
    }
    .goal {
      flex-direction: column;
      max-width: var(--col-3);
    }

    .next {
      align-items: flex-end;
    }

    .next .icon {
      order: -1;
    }

    .onwards {
      padding: var(--space-3xl) var(--space-m);
    }
    h1 {
      overflow-wrap: break-word;
    }
    .icon {
      width: 22px;
      height: 22px;
      background-color: var(--color-theme-bg-weakest);
      border-radius: 11px;
      flex: 0 0 22px;
      background-repeat: no-repeat;
      background-position: center center;
      margin-bottom: var(--space-2xs);
    }
  }
</style>
