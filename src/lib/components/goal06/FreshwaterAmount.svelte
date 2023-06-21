<script>
  import { _ } from 'svelte-i18n';
  import { range } from 'd3';
  import { fade } from 'svelte/transition';

  export let parentWidth;
  export let parentHeight;
  export let labels;
  export let activeScene;

  export let data = [];

  const margins = {
    top: 18,
    right: 2,
    bottom: 0,
    left: 2
  };

  $: width = parentWidth;
  $: height = parentHeight;

  $: w = parentWidth - margins.left - margins.right;
  $: h = height - margins.top - margins.bottom;

  $: blockWidth = w / 100;
  $: blockHeight = h / 100;

  $: getColor = (i) => {
    if (activeScene.index === 1) {
      if (i < 250) {
        return 'var(--color-base-blue200)';
      }
    } else if (activeScene.index === 2) {
      if (i < 250 - 173) {
        return 'var(--color-base-blue200)';
      } else if (i < 250) {
        return 'var(--color-base-blue300)';
      }
    } else if (activeScene.index >= 3) {
      if (i < 2) {
        return 'var(--color-base-blue200)';
      } else if (i < 250 - 173) {
        return 'var(--color-base-blue500)';
      } else if (i < 250) {
        return 'var(--color-base-blue300)';
      }
    }
    return 'var(--color-base-blue100)';
  };
</script>

<div class="chart svg-container" bind:clientHeight={height} bind:clientWidth={width}>
  <svg {width} {height}>
    <g transform="translate({margins.left}, {margins.top})">
      <g transform="translate({w / 2 - (100 * blockWidth) / 2}, 0)">
        <g>
          {#each range(10000) as i}
            {#if activeScene.index >= 4 && i == 0}
              <rect
                y={Math.floor(i / 100) * blockHeight}
                x={(i % 100) * blockWidth}
                width={blockWidth - 0.5}
                height={blockHeight - 0.5}
                style="fill: var(--color-base-blue200)"
              />
            {:else if i < 250}
              <rect
                y={Math.floor(i / 100) * blockHeight}
                x={(i % 100) * blockWidth}
                width={blockWidth - 0.5}
                height={blockHeight - 0.5}
                style="fill: {getColor(i)}"
              />
            {:else}
              <rect
                y={Math.floor(i / 100) * blockHeight}
                x={(i % 100) * blockWidth}
                width={blockWidth - 0.5}
                height={blockHeight - 0.5}
                style="fill: var(--color-base-blue100)"
              />
            {/if}
          {/each}
          {#if activeScene.index >= 4}
            <rect y={0} x={0} width={blockWidth * 0.75} height={blockHeight} style="stroke: white; stroke-width: 4px; fill:none" />
            <rect y={0} x={0} width={blockWidth * 0.75} height={blockHeight} style="stroke: black; stroke-width: 1.5px; fill:none" />
            <text x={0} class="small" y={-4}
              ><tspan class="label category">{$_(labels['accessible'])}: </tspan><tspan class="number"
                >{$_(labels['accessible_number'])}
              </tspan>
              {$_(labels['prop'])}</text
            >
          {/if}
        </g>
        {#if activeScene.index >= 1}
          <g transition:fade|local>
            <text x={50 * blockWidth} class="label category middle" y={(97 / 2) * blockHeight}
              >{$_(labels['non_freshwater'])}: <tspan class="label number">{$_(labels['non_freshwater_number'])}</tspan></text
            >
            <text x={50 * blockWidth} class="label category middle" y={blockHeight * 3 + 15}
              >{$_(labels['freshwater'])}: <tspan class="label number">{$_(labels['freshwater_number'])}</tspan></text
            >
          </g>
        {:else}
          <g transition:fade|local>
            <text x={w / 2} class="label category middle" y={h / 2}>{$_(labels['all_water'])}</text>
          </g>
        {/if}
      </g>
    </g>
  </svg>
</div>

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
