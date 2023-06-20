<script>
  import { _ } from 'svelte-i18n';
  import TextBlock from './TextBlock.svelte';

  export let title;
  export let number;
  export let label;
  export let text;
  export let units = null;
</script>

<div class="factoid layout-main">
  <div class="fact">
    {#if title}
      <h2 class="title">{title}</h2>
    {/if}
    <h1 class="number">
      {number}{#if units}<span class="units">{units}</span>{/if}
    </h1>
    <p class="label">{label}</p>
  </div>
  {#if text}
    <div class="text"><TextBlock {text} /></div>
  {/if}
</div>

<style type="scss">
  .factoid {
    display: flex;
    align-items: center;
    margin: var(--space-l) auto;
    gap: var(--space-s-m);

    & > * {
      display: inline-block;
      width: var(--col-4);
    }

    .fact {
      .title {
        font-family: var(--font-families-andes);
        font-size: var(--font-size-l);
        /* letter-spacing: var(--letter-spacing-5); */
        margin-bottom: var(--space-s);
      }

      .number {
        font-family: var(--font-families-andes);
        font-size: var(--font-size-5xl);
        font-weight: var(--font-weights-bold);
        line-height: 100%;
        margin-top: var(--space-m);

        .units {
          font-size: var(--font-size-xl);
          padding-left: var(--space-xs);
        }
      }

      .label {
        font-family: var(--font-families-open-sans);
        font-size: var(--font-size-m);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-5);
      }
    }

    .text {
      > :global(.text-block) {
        width: 100%;
        margin: 0;
      }
    }
  }

  /* phone: */
  @media screen and (max-width: 872px) {
    .factoid {
      flex-direction: column;

      .fact {
        margin: var(--space-s) auto;
        text-align: center;
        .number {
          font-size: 5rem;
        }

        .title {
          width: 100%;
        }
      }
      .text {
        margin-top: var(--space-xs);
        width: 100%;
        margin: 0 auto var(--space-l) auto;
      }
    }
  }
</style>
