<script>
  import { pie, groups, arc } from 'd3';
  import { format } from 'd3-format';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Fa from 'svelte-fa/src/fa.svelte';
  import { faCircle } from '@fortawesome/free-solid-svg-icons';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { _ } from 'svelte-i18n';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let labels;

  const f = format('.1%');
  const f2 = format('.0%');

  $: byCountry = groups(
    data.sort((a, b) => a.pct - b.pct),
    (d) => d.Iso3_code
  );

  let cellHeight = 60;
  let cellWidth = 125;

  const a = arc()
    .innerRadius(0)
    .outerRadius((d) => 25)
    .startAngle((d) => d.startAngle)
    .endAngle((d) => d.endAngle)
    .padAngle(0.01);
</script>

<CategoricalLegend legendType="gender" title={labels.legend_title} top="true" />
<div class="container">
  {#each byCountry.sort((a, b) => b[1][0].Female - a[1][0].Female) as country, i}
    {@const p = pie().value((d) => d.pct)(country[1])}
    <div class="cell">
      <svg height={cellHeight} width={cellWidth}>
        <g transform="translate({cellWidth / 2}, {cellHeight / 2})">
          <path d={a(p[1])} fill="var(--color-vis-gender-male)" />
          <path d={a(p[0])} fill="var(--color-vis-gender-female" />
        </g>
      </svg>
      <p
        class="{$referenceCountry !== undefined && $referenceCountry === country[0]
          ? 'reference-'
          : ''}label-CUSTOM middle geo stronger small central "
      >
        {$_(`country.${country[0].toLowerCase()}`)}
      </p>
      <p class="num label small">
        <Fa icon={faCircle} size="8" primaryColor="var(--color-vis-gender-female)" />
        {f(country[1][0].pct)}
        &nbsp;
        <Fa icon={faCircle} size="8" primaryColor="var(--color-vis-gender-male)" />
        {f(country[1][1].pct)}
      </p>
    </div>
  {/each}
</div>

<style>
  .reference-label-CUSTOM {
    pointer-events: none;
    text-transform: uppercase;
    color: var(--color-reference-country);
    stroke: var(--color-theme-dark-text);
    font-weight: var(--font-weights-semibold);
    letter-spacing: var(--letter-spacing-5);
  }
  .container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    row-gap: var(--space-m);
    column-gap: var(--space-s);
  }
  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .num {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-2xs);
  }
</style>
