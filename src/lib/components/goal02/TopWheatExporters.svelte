<script>
  import { pack, hierarchy, scaleSqrt, max } from 'd3';
  import { locale } from 'svelte-i18n';

  export let data = [];

  let width = 0;
  const height = 600;

  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  $: w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  $: nest = hierarchy({
    name: 'root',
    children: data
  });

  $: r = scaleSqrt()
    .domain([0, max(data, (d) => d.share_of_wheat_exports)])
    .range([0, Math.min(w, h) / 7]);

  $: p = pack()
    .padding(4)
    .size([w, h])
    .radius((d) => r(d.data.share_of_wheat_exports))(nest);

  const suffixes = new Map([
    ['one', 'st'],
    ['two', 'nd'],
    ['few', 'rd'],
    ['other', 'th']
  ]);

  $: pr = new Intl.PluralRules($locale, { type: 'ordinal' });

  const formatOrdinals = (n) => {
    const rule = pr.select(n);
    const suffix = suffixes.get(rule);
    return `${n}${suffix}`;
  };
</script>

{#if data && data.length > 0}
  <div bind:clientWidth={width} class="container">
    <svg {width} {height}>
      <defs>
        <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="var(--color-base-orange400)" flood-opacity="1" />
        </filter>
      </defs>
      <g transform="translate({margin.left}, {margin.right})">
        {#each p.children as child}
          <g transform={`translate(${child.x}, ${child.y})`}>
            {#if child.data.country_name === 'Ukraine'}
              <circle r={child.r} fill="var(--color-base-orange400)" filter="url(#shadow)" />
              <text dy={-8} class="ukraine-rank small">{formatOrdinals(child.data.rank)}</text>
              <text dy={8} class="ukraine stronger">{child.data.country_name}</text>
            {:else}
              <circle r={child.r} fill="var(--color-base-orange200)" filter="url(#f1)" />
              {#if child.data.rank <= 10}
                <text dy={-8} class="label rank-label small">{formatOrdinals(child.data.rank)}</text>
                <text dy={8} class="label country-label small stronger">{child.data.country_name}</text>
              {/if}
            {/if}
          </g>
        {/each}
      </g>
    </svg>
  </div>
{/if}

<style>
  .ukraine {
    text-anchor: middle;
    dominant-baseline: middle;
  }
  .ukraine-rank {
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .rank-label,
  .country-label {
    text-anchor: middle;
    dominant-baseline: central;
  }
</style>
