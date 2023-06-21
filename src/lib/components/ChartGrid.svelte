<script>
  import { fade } from 'svelte/transition';
  export let gridType;
  export let scale;
  export let innerHeight;
  export let innerWidth;
  export let ticks;
  export let oppositeTickPosition = false;
  export let yAxisUnits;
  export let yAxisUnitsBottom;
  export let xAxisUnits;
  export let yAxisTitle;
  export let xAxisTitle;
  export let reverse;
  export let hideLines = false;
  export let hideLabels = false;
  export let xLabelTranslations;
  export let yLabelTranslations;
  export let xDivisor;
  export let yDivisor;
  export let formatter;

  const addUnits = function (tick, units) {
    return tick + ' ' + units;
  };
  const translateTick = function (tick, translations) {
    return translations[tick];
  };
  const divideTick = function (tick, divisor) {
    return tick / divisor;
  };

  $: formattedTicks = ticks.map((d, i) => {
    let formattedTick = { value: d, label: d };
    if (formatter) {
      formattedTick.label = formatter(formattedTick.label);
    }
    if (gridType == 'xGrid') {
      if (xLabelTranslations) {
        formattedTick.label = translateTick(formattedTick.label, xLabelTranslations);
      }
      if (xDivisor) {
        formattedTick.label = divideTick(formattedTick.label, xDivisor);
      }
      if (xAxisUnits && i == ticks.length - 1) {
        formattedTick.label = addUnits(formattedTick.label, xAxisUnits);
      }
    }
    if (gridType == 'yGrid') {
      if (yLabelTranslations) {
        formattedTick.label = translateTick(formattedTick.label, yLabelTranslations);
      }
      if (yDivisor) {
        formattedTick.label = divideTick(formattedTick.label, yDivisor);
      }
      if (yAxisUnits && i == ticks.length - 1) {
        formattedTick.label = addUnits(formattedTick.label, yAxisUnits);
      }
      if (yAxisUnitsBottom && i == 0) {
        formattedTick.label = addUnits(formattedTick.label, yAxisUnitsBottom);
      }
    }

    return formattedTick;
  });

  /* space for labels 

    top: 35px with y-axis label, 
    top: 15px with only tick labels

    left: 10px

    bottom: 35px with x-axis label
    bottom: 15px with only tick labels

    right: 0px
*/
</script>

{#if gridType == 'xGrid'}
  {#each formattedTicks as tick}
    <line
      x1={scale(tick.value)}
      x2={isNaN(scale(tick.value)) ? 0 : scale(tick.value)}
      y1={0}
      y2={innerHeight}
      class="gridline"
      style={hideLines ? 'stroke:none' : ''}
      transition:fade|local
    />
    {#if !hideLabels}
      <text x={scale(tick.value)} y={oppositeTickPosition ? -10 : innerHeight + 16} class="ticklabel x" transition:fade|local
        >{tick.label}</text
      >
    {/if}
  {/each}
  {#if xAxisTitle}
    <text x={innerWidth} y={innerHeight + 30} class="ticklabel x-title" transition:fade|local
      >{reverse ? '← ' + xAxisTitle : xAxisTitle + ' →'}</text
    >
  {/if}
{/if}

{#if gridType == 'yGrid'}
  {#each formattedTicks as tick, i}
    <line
      x1={0}
      x2={innerWidth}
      y1={scale(tick.value)}
      y2={scale(tick.value)}
      class="gridline"
      style={hideLines ? 'stroke:none' : ''}
      transition:fade|local
    />
    {#if !hideLabels}
      <text
        x={oppositeTickPosition ? innerWidth : 0}
        class:end={oppositeTickPosition}
        y={scale(tick.value) - 4}
        class="ticklabel y"
        transition:fade|local>{tick.label}</text
      >
    {/if}
    {#if i === ticks.length - 1 && yAxisTitle}
      <text x={oppositeTickPosition ? innerWidth : 0} y={scale(tick.value) - 18} class="ticklabel y" transition:fade|local
        >{@html reverse ? '↓ ' + yAxisTitle : '↑ ' + yAxisTitle}</text
      >
    {/if}
  {/each}
{/if}

<style>
  line.gridline {
    stroke-width: 1px;
    stroke: var(--color-grey-200);
    opacity: 0.5;
  }
  text {
    stroke-width: 0px;
  }

  text.ticklabel {
    font-size: 12px;
    fill: var(--color-theme-text-weaker);
  }
  text.ticklabel.x {
    text-anchor: middle;
  }
  text.ticklabel.x-title {
    text-anchor: end;
  }
  text.ticklabel.y {
    text-anchor: start;
  }
  text::selection {
    background: #fff;
  }
</style>
