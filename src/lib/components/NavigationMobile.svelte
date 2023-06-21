<script>
  import vars from '$lib/variables.js';
  import { base } from '$app/paths';
  import { _, isLoading, locale, locales } from 'svelte-i18n';
  import { activeGoal } from '$lib/stores/activeGoal';
  import chapters from '../../data/chapters.js';

  $: isActive = (g) => g === $activeGoal.number;

  let isNavigationVisible = false;

  const toggleNavigation = () => {
    isNavigationVisible = !isNavigationVisible;
  };
</script>

<div class="overlay" aria-hidden class:visible={isNavigationVisible} on:click={() => (isNavigationVisible = false)} />

<nav class="mobile-nav">
  <p
    class="hamburger-icon"
    class:open={isNavigationVisible}
    on:click={toggleNavigation}
    on:keypress={toggleNavigation}
    aria-label={$_('alt.navigation')}
  />
  <ul class="dropdown" class:visible={isNavigationVisible}>
    {#each Object.values(chapters) as chapter, i}
      <!-- svelte-ignore empty-block -->
      {#if $isLoading}{:else}
        <li
          class="goal-link"
          class:active={isActive(i + 1)}
          alt={$_(`goal${i + 1}.title`, { default: chapters?.[i + 1]?.title })}
          style={'--goal-color: var(--color-un-sdg' + (i + 1) + '); --goal-text-color: var(--color-un-text-sdg' + (i + 1) + ')'}
        >
          <a href={base + '/' + chapter.url} on:click={() => (isNavigationVisible = false)} class="goal-text"
            ><span class="goal-num">{i + 1}</span><span class="goal-name"
              >{$_(`goal${i + 1}.title`, { default: chapters?.[i + 1]?.title })}</span
            ></a
          >
        </li>
      {/if}
    {/each}
  </ul>
</nav>

<style>
  .overlay {
    width: 100vw;
    height: 100vh;

    background-color: pink;
    opacity: 0;

    position: fixed;
    top: 0;
    left: 0;

    display: none;
  }
  .overlay.visible {
    display: block;
  }

  .mobile-nav {
    font-size: var(--font-size-s);
    color: var(--color-theme-primary);
    font-weight: 600;
    padding: 0;
  }
  .goal-link {
    padding-bottom: var(--space-xs);
  }

  .goal-link a {
    text-decoration: none;
    font-size: var(--font-size-m);
    color: var(--color-theme-text);
    font-weight: normal;
    letter-spacing: var(--letter-spacing-5);
  }

  .goal-text {
    display: flex;
    align-items: center;
  }

  .goal-num {
    color: var(--color-theme-text);
    margin-right: var(--space-xs);
    line-height: 1.75;
    display: block;
    width: 30px;
    height: 30px;
    text-align: center;
    border-radius: 50%;
  }

  .active .goal-num {
    color: var(--goal-text-color);
    background-color: var(--goal-color);
    font-weight: var(--font-weights-bold);
  }
  .goal-name {
    display: block;
    flex: 1;
    border-bottom: 2px solid transparent;
  }

  .active .goal-name {
    font-weight: var(--font-weights-semibold);
    border-bottom: 2px solid var(--goal-color);
  }

  .goal-link a:hover .goal-name {
    border-bottom: 2px solid var(--goal-color);
  }

  .dropdown {
    background-color: var(--color-theme-bg);
    padding: var(--space-s);

    overflow-y: scroll;
    max-height: calc(100vh - var(--loop-header-height));
  }

  .hamburger-icon::before {
    width: 20px;
    height: 20px;
    display: inline-block;
    font-family: 'loopicon';
    content: '\e709';
    font-size: 16px;
    color: var(--color-theme-primary);
  }
  .hamburger-icon.open::before {
    content: '\e718';
    font-size: 14px;
  }

  li:hover {
    cursor: pointer;
  }

  @keyframes slideIn {
    0% {
      right: -100%;
    }
    100% {
      right: 0;
    }
  }

  ul {
    width: 300px;
    position: absolute;
    top: var(--loop-header-height);
    right: -100%;
    transition: all 0.5s;
  }

  ul.visible {
    right: 0;
  }
</style>
