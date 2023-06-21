<script>
  import { _ } from 'svelte-i18n';
  import { base } from '$app/paths';
  import chapters from '../../data/chapters.js';

  import { activeGoal } from '$lib/stores/activeGoal';
  import { isScreenshotting } from '$lib/stores/isScreenshotting';
  import { highlightedGoals } from '$lib/stores/highlightedGoals';

  $: isActive = (g) => g === $activeGoal.number;
</script>

{#if !$isScreenshotting}
  <nav class="sdg-nav">
    <a class="home" href="{base}/">Home</a>
    <p class="explore-sdgs">{@html $_('base.explore.sdgs', { default: 'Explore<br/>17 SDGs' })}</p>
    <ul>
      {#each Object.values(chapters) as chapter, i}
        <li
          class:active={isActive(i + 1)}
          class:related={!isActive(i + 1) && $highlightedGoals.find((d) => d.goal === i + 1)}
          class:hovered={!isActive(i + 1) && $highlightedGoals.some((d) => d.goal === i + 1 && d.hovered)}
          style="--goal-color: var(--color-un-sdg{i + 1}); --text-color: var(--color-un-text-sdg{i + 1})"
          alt={$_(`goal${i + 1}.title`, { default: chapters?.[i + 1]?.title })}
        >
          <a
            href={base + '/' + chapter?.url}
            class="goal-number-static"
            aria-label={$_(`goal${i + 1}.title`, { default: chapters?.[i + 1]?.title })}>{i + 1}</a
          >

          <a href={base + '/' + chapter?.url} aria-hidden="true">
            <p class="pill" aria-hidden="true">
              <span class="goal-number">{i + 1}</span>
              {$_(`goal${i + 1}.title`, { default: chapters?.[i + 1]?.title })}
            </p>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style type="scss">
  nav.sdg-nav {
    background-color: var(--color-theme-bg-weaker);
    z-index: 100;
    position: sticky;
    top: var(--loop-header-height);
    height: 100vh;
    padding-top: var(--space-xs);
    display: flex;
    flex-direction: column;
  }
  a.home {
    font-size: var(--font-size-s);
    text-transform: uppercase;
    text-align: center;
  }

  .explore-sdgs {
    line-height: var(--line-heights-120);
    font-size: var(--font-size-s);
    margin: var(--space-xs) var(--space-2xs) var(--space-2xs) var(--space-2xs);
    color: var(--color-theme-text);
    text-align: center;
  }

  ul {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-height: 640px;
    height: calc(100vh - var(--loop-header-height) - 20px);
    width: 60px;
    align-items: center;
    padding: 0 0 var(--space-xs) 0;
  }

  li {
    position: relative;
  }

  li a.goal-number-static,
  li .pill .goal-number {
    font-size: var(--font-size-m);
    color: var(--goal-color);
    color: var(--color-theme-text);
    font-weight: var(--font-weights-regular);
    letter-spacing: var(--letter-spacing-5);
    text-transform: uppercase;

    border-radius: 100%;

    width: 30px;
    height: 30px;
    line-height: 1.5;
    text-align: center;

    user-select: none;

    display: block;
    border: 2px solid transparent;
  }
  li a.goal-number-static {
    transition: border-color 0.5s;
  }

  li a:hover {
    text-decoration: none;
  }

  li.related a.goal-number-static,
  li.active a.goal-number-static {
    border: 2px solid var(--goal-color);
    font-weight: var(--font-weights-bold);
  }

  li.related a.goal-number-static {
    background-color: var(--color-theme-bg);
  }

  li.active a.goal-number-static {
    color: var(--text-color);
    background-color: var(--goal-color);
  }

  li .pill {
    text-align: right;
    width: auto;

    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-5);

    position: absolute;
    top: 0;
    left: 0;
    height: 30px;
    line-height: 26px;
    white-space: nowrap;
    opacity: 0;

    background-color: var(--color-theme-bg-weakest);
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    border: 2px solid var(--goal-color);
    padding: 0 var(--space-s) 0 0;

    transition: opacity 0.5s;
    pointer-events: none;
  }
  li .pill .goal-number {
    display: inline-block;
    width: 26px;
    border: 0;
    font-weight: var(--font-weights-bold);
  }
  li.active .pill .goal-number {
    color: var(--text-color);
    background-color: var(--goal-color);
    height: 30px;
    width: 30px;
    border: 2px solid var(--goal-color);
    margin-top: -2px;
    margin-left: -2px;
  }

  li:hover .pill,
  li.hovered .pill {
    opacity: 1;
    pointer-events: all;
    cursor: pointer;
  }

  a .pill {
    color: var(--color-theme-text);
  }

  @media screen and (max-height: 750px) {
    .explore-sdgs {
      display: none;
    }
  }

  /* phone: */
  @media screen and (max-width: 872px), (max-height: 599px) {
    nav.sdg-nav {
      display: none;
    }
  }

  @media (hover: none) {
    nav.sdg-nav {
      display: none;
    }
  }
</style>
