<script>
  import { computePosition, flip, shift, offset } from '@floating-ui/dom';

  export let visible;
  export let targetPos;
  export let placement = 'right';
  export let showBackground = true;

  let component;
  let lastTargetPos = { x: 0, y: 0 };

  let x, y;

  $: x = targetPos.x;
  $: y = targetPos.y;

  $: if (component && targetPos && (targetPos.x !== lastTargetPos.x || targetPos.y !== lastTargetPos.y)) {
    lastTargetPos = { ...targetPos };

    const virtualTarget = {
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x,
          y,
          top: y,
          left: x,
          right: x,
          bottom: y
        };
      }
    };

    computePosition(virtualTarget, component, {
      placement,
      middleware: [offset(12), flip(), shift({ padding: 5 })]
    }).then(({ x, y }) => {
      component.style.left = x + 'px';
      component.style.top = y + 'px';
    });
  }
</script>

<div class="tooltip" class:visible class:background={showBackground === true} bind:this={component}>
  <slot />
</div>

<style type="text/scss">
  .tooltip {
    display: none;
    padding: var(--space-xs);
    position: absolute;
    z-index: 999999;
    max-width: 400px;
    pointer-events: none;

    :global(hr) {
      border-top: 0.5px solid var(--color-grey-200);
      margin: var(--space-xs) 0;
    }

    &.background {
      background-color: var(--color-theme-bg);
      box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
      border: 0.5px solid var(--color-grey-200);
    }

    &.visible {
      display: block;
    }

    .label {
      text-shadow: none;
    }
  }

  @media screen and (max-width: 872px) {
    .tooltip {
      max-width: calc((100vw / 2) - var(--space-m));
    }
  }
</style>
