<script>
  import { groups, area, sum, scaleLinear, max, curveCatmullRom, stack } from 'd3';
  import Number from '../general/Number.svelte';
  import Date from '../general/Date.svelte';
  import { _ } from 'svelte-i18n';
  import { ColorBaseYellow300, ColorThemeTextWeaker, ColorVisBinaryNeg, ColorVisBinaryPos } from '$lib/styles/tokens.es6';

  export let data;
  export let period;
  export let periodIndex;
  export let width;
  export let height;
  export let labels;

  $: byPeriod = groups(
    data.map((d) => ({ ...d, ukraine: d.ukraine === 'NA' ? 0 : d.ukraine, month: d.period })),
    (d) => d.period
  ).map((d) => {
    const turkey = d[1].find((d) => d.reporter_iso3c === 'TUR')?.ukraine || 0;
    const pakistan = d[1].find((d) => d.reporter_iso3c === 'PAK')?.ukraine || 0;
    const indonesia = d[1].find((d) => d.reporter_iso3c === 'IDN')?.ukraine || 0;
    const tunisia = d[1].find((d) => d.reporter_iso3c === 'TUN')?.ukraine || 0;
    const eu = d[1].find((d) => d.reporter_iso3c === 'EUR')?.ukraine || 0;

    return {
      month: d[0],
      turkey,
      pakistan,
      indonesia,
      tunisia,
      eu,
      rest: sum(d[1], (d) => d.ukraine) - turkey - pakistan - indonesia - tunisia - eu,
      totalUkraine: sum(d[1], (d) => d.ukraine),
      totalWorld: sum(d[1], (d) => d.world),
      total: sum(d[1], (d) => d.ukraine) + sum(d[1], (d) => d.world),
      d
    };
  });

  $: stackedCountries = stack().keys(['turkey', 'pakistan', 'indonesia', 'tunisia', 'eu', 'rest'])(byPeriod);

  const margins = {
    top: 20,
    right: 50,
    bottom: 50,
    left: 40
  };

  $: w = width - margins.left - margins.right;
  $: h = height - margins.top - margins.bottom;

  $: x = scaleLinear()
    .domain([0, byPeriod.length - 1])
    .range([0, w]);

  $: y = scaleLinear()
    .domain([0, max(byPeriod, (d) => d.totalUkraine)])
    .range([h, 0]);

  const a2 = area()
    .x((d, i) => x(i))
    .y1((d) => y(d[1]))
    .y0((d) => y(d[0] || 0))
    .curve(curveCatmullRom);

  $: diff =
    periodIndex >= 12
      ? ((byPeriod[periodIndex].totalUkraine - byPeriod[periodIndex - 12].totalUkraine) / byPeriod[periodIndex - 12].totalUkraine) * 100
      : 0;
</script>

<svg {width} {height}>
  <g transform="translate({margins.left}, {margins.top})">
    <rect x={x(12)} width={x(byPeriod.length - 1) - x(12)} height={h} fill="url(#diagonalHatch)" />
    <text x={x(12) + (x(byPeriod.length - 1) - x(12)) / 2} y={20} class="label caps middle">{$_(labels.ukraine_war)}</text>
    <line x1={x(0)} x2={x(0)} y1={0} y2={h} style="stroke: var(--color-grey-200);" />
    {#each y.ticks(5) as tick}
      <text y={y(tick)} dx={-5} class="label small weaker end" style="dominant-baseline: middle;"><Number value={tick / 1000000} /></text>
    {/each}
    <line x1={x(0)} x2={x(byPeriod.length - 1)} y1={h} y2={h} style="stroke: var(--color-grey-200);" />

    {#each stackedCountries as s, i}
      <path d={a2(s.filter((d) => d.data.month <= period))} fill="var(--color-vis-cat8-{1 + i})" stroke="white" />
    {/each}

    <text dy={20} style="text-anchor: middle;" class="label stronger" x={x(periodIndex)} y={h}>
      <Date year={Math.floor(period / 100)} month={period - Math.floor(period / 100) * 100 - 1} />
    </text>
    {#if periodIndex >= 12}
      <line
        x1={x(periodIndex) + 10}
        y1={y(byPeriod[periodIndex - 12].totalUkraine)}
        x2={x(periodIndex - 12)}
        y2={y(byPeriod[periodIndex - 12].totalUkraine)}
        stroke={ColorThemeTextWeaker}
        stroke-width={1}
        stroke-dasharray="4 4"
      />
      <line
        x1={x(periodIndex) + 10}
        y1={y(byPeriod[periodIndex].totalUkraine)}
        x2={x(periodIndex)}
        y2={y(byPeriod[periodIndex].totalUkraine)}
        stroke={ColorThemeTextWeaker}
        stroke-width={1}
        stroke-dasharray="4 4"
      />
      <text class="label small middle weaker no-stroke" x={x(periodIndex - 12)} y={h + 40}>{$_(labels.one_year_before)}</text>
      <text dy={20} style="text-anchor: middle;" class="label stronger" x={x(periodIndex - 12)} y={h}>
        <Date year={Math.floor(period / 100) - 1} month={period - Math.floor(period / 100) * 100 - 1} />
      </text>
      <text
        dx={5}
        class="label small"
        style="stroke-width: 2; dominant-baseline: middle"
        x={x(periodIndex) + 7}
        y={(y(byPeriod[periodIndex].totalUkraine) + y(byPeriod[periodIndex - 12].totalUkraine)) / 2}
      >
        <tspan class="label stronger" class:negative={diff < 0} class:positive={diff > 0}>
          {diff > 0 ? '+' : ''}<Number value={diff} unit="%" />
        </tspan>
      </text>
      <circle
        cx={x(periodIndex - 12)}
        cy={y(byPeriod[periodIndex - 12].totalUkraine)}
        r={4}
        fill={ColorBaseYellow300}
        stroke="var(--color-theme-bg-weaker)"
        stroke-width={2}
      />
      <line
        marker-end={diff < 0 ? 'url(#arrowhead_neg)' : 'url(#arrowhead_pos)'}
        marker-start={diff < 0 ? 'url(#arrowhead_neg)' : 'url(#arrowhead_pos)'}
        x1={x(periodIndex) + 10}
        y2={y(byPeriod[periodIndex - 12].totalUkraine)}
        x2={x(periodIndex) + 10}
        y1={y(byPeriod[periodIndex].totalUkraine)}
        stroke={diff < 0 ? ColorVisBinaryNeg : ColorVisBinaryPos}
      />
    {/if}
  </g>
</svg>

<style>
  .negative {
    fill: var(--color-vis-binary-neg);
  }
  .positive {
    fill: var(--color-vis-binary-pos);
  }
</style>
