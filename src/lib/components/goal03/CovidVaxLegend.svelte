<script>
  import { isMobile } from '$lib/stores/isMobile';

  export let circleRadius;
</script>

<div class="covidvax-legend">
  <div class="text-container" />
  <svg width={circleRadius * 4} height={($isMobile ? circleRadius * 3 : circleRadius * 2) + 2}>
    <mask id={`legend-leftmask`}><rect x={circleRadius - 2} y="0" width={circleRadius + 2} height={circleRadius * 4} fill="white" /></mask>
    <mask id={`legend-rightmask`}><rect x={circleRadius * 2} y="0" width={circleRadius + 2} height={circleRadius * 4} fill="white" /></mask>

    <g transform="translate(0,1)">
      {#if !$isMobile}
        <circle class="averted" cx={circleRadius * 2} cy={circleRadius} r={circleRadius * 0.95} mask="url(#legend-leftmask)" />
        <circle class="deaths" cx={circleRadius * 2} cy={circleRadius} r={circleRadius * 0.8} mask="url(#legend-rightmask)" />
        <line class="bg" x1={circleRadius * 2 + 10} x2={circleRadius * 4} y1={circleRadius + 0.5} y2={circleRadius + 0.5} />
        <line x1={circleRadius * 2 + 10} x2={circleRadius * 4} y1={circleRadius + 0.5} y2={circleRadius + 0.5} />
        <line class="bg" x1={0} x2={circleRadius * 2 - 10} y1={circleRadius + 0.5} y2={circleRadius + 0.5} />
        <line x1={0} x2={circleRadius * 2 - 10} y1={circleRadius + 0.5} y2={circleRadius + 0.5} />
      {:else}
        <circle class="averted" cx={circleRadius * 2} cy={circleRadius * 1.5} r={circleRadius * 0.95} mask="url(#legend-leftmask)" />
        <circle class="deaths" cx={circleRadius * 2} cy={circleRadius * 1.5} r={circleRadius * 0.8} mask="url(#legend-rightmask)" />
        <line class="bg" x1={circleRadius * 2 + 10} x2={circleRadius * 2 + 10} y1={circleRadius * 3} y2={circleRadius * 1.5 + 0.5} />
        <line x1={circleRadius * 2 + 10} x2={circleRadius * 2 + 10} y1={circleRadius * 3} y2={circleRadius * 1.5 + 0.5} />

        <line class="bg" x1={circleRadius * 2 - 10} x2={circleRadius * 2 - 10} y1={0} y2={circleRadius * 1.5 + 0.5} />
        <line x1={circleRadius * 2 - 10} x2={circleRadius * 2 - 10} y1={0} y2={circleRadius * 1.5 + 0.5} />
      {/if}
    </g>
  </svg>
</div>

<style>
  .covidvax-legend {
    display: flex;
    justify-content: center;
  }

  circle {
    fill: var(--color-base-red200);
    stroke: var(--color-base-red500);
  }
  circle.averted {
    fill: var(--color-base-teal300);
    stroke: var(--color-base-teal500);
  }

  line {
    stroke-linecap: round;
    stroke: var(--color-theme-dark-bg);
    stroke-width: 1px;
  }
  line.bg {
    stroke: white;
    stroke-width: 3px;
  }
</style>
