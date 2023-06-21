<script>
  import { scaleLinear, extent, scaleDiverging } from 'd3';
  import Number from './Number.svelte';

  export let title;
  export let scale;
  export let units;
  export let digits = 1;
  export let hidden;

  /* vertical space for legend

    65px 

  */

  let padding = 20;

  let w = 200;
  let legendElement;

  $: rectWidth = w ? w - padding * 2 : 0;

  let stops = [],
    labelStops = [];

  let labelScale;

  $: legendElement && legendElement.style.setProperty('--svg-width', `calc(${w}px)`);

  $: if (scale) {
    stops = [];
    labelStops = [];

    const domain = scale.domain();

    const ext = extent(domain);

    labelScale = scaleLinear()
      .domain(ext)
      .range([padding, w - padding]);

    if (domain.length === 2) {
      const exto = domain[1] - domain[0];

      for (let i = domain[0]; i <= domain[1]; i += exto / 10) {
        const offset = (100 * (i - domain[0])) / exto;
        stops.push({
          offset: offset + '%',
          value: i,
          color: scale(i)
        });
      }
      labelStops = [
        { value: domain[0], label: domain[0] },
        { value: domain[0] + (domain[1] - domain[0]) / 2, label: domain[0] + (domain[1] - domain[0]) / 2 },
        { value: domain[1], label: domain[1] }
      ];
    } else if (domain.length === 3) {
      stops = [
        { offset: '0%', value: domain[0], color: scale(domain[0]) },
        { offset: '50%', value: domain[1], color: scale(domain[1]) },
        { offset: '100%', value: domain[2], color: scale(domain[2]) }
      ];
      labelStops = [
        { value: 0, label: domain[0] },
        { value: 0.5, label: domain[1] },
        { value: 1, label: domain[2] }
      ];
      labelScale.domain([0, 1]);
    }
  }

  let legendId = `scale-grad-${new Date().getTime()}`;
</script>

<div class={hidden ? 'legend not-visible' : 'legend'} bind:this={legendElement}>
  <p><span class="dataset-label">{title}</span>&nbsp;<span class="unit-label">{units ? '(' + units + ')' : ''}</span></p>
  <svg>
    <defs>
      <linearGradient id={legendId}>
        {#each stops as stop}
          <stop offset={stop.offset} stop-color={stop.color} />
        {/each}
      </linearGradient>
    </defs>
    <rect x={padding} y="0" width={rectWidth} height="6px" fill={`url(#${legendId})`} />
    {#each labelStops as stop, i}
      <text class="value-label" x={!isNaN(labelScale(stop.value)) ? labelScale(stop.value) : 0} y="20px">
        <Number value={stop.label} {digits} />
      </text>
    {/each}
  </svg>
</div>

<style>
  .dataset-label {
    color: var(--color-theme-dark-text);
    font-size: var(--font-size-s);
    font-weight: var(--font-weights-semibold);
  }
  .unit-label {
    font-size: var(--font-size-s);
    color: var(--color-theme-dark-text-weaker);
  }
  .value-label {
    fill: var(--color-theme-dark-text-weaker);
    font-size: var(--font-size-s);
  }

  .legend {
    margin: 0 auto;
    transition: opacity 0.25s;
  }

  p {
    text-align: center;
    margin-bottom: var(--space-2xs);

    font-size: var(--font-size-s);
    line-height: var(--line-heights-145);

    white-space: nowrap;
  }

  svg {
    width: var(--svg-width);
    height: 24px;
    margin: 0 auto;
  }

  svg text {
    text-anchor: middle;
  }
  .legend.not-visible {
    opacity: 0;
  }
</style>
