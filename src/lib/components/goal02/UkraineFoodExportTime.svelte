<script>
  import { treemap, hierarchy, treemapResquarify, scaleDiverging } from 'd3';
  import TreemapRect from './TreemapRect.svelte';
  import { sum } from 'd3';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import { ColorVisReference } from '$lib/styles/tokens.es6';
  import { DivergingNegPos } from '$lib/styles/colorscales';
  import Legend from '../general/Legend.svelte';
  import { _ } from 'svelte-i18n';

  export let data = [];
  export let activeScene;
  export let labels;

  $: selectedYear = activeScene && activeScene.index > 0 ? 2022 : 2021;

  $: width = 0;
  $: height = 600;

  const margin = {
    top: 0,
    right: 0,
    bottom: 10,
    left: 0
  };

  $: w = width - margin.left - margin.right;
  $: h = height - margin.top - margin.bottom;

  let leaves = [];

  $: diffRatio =
    sum(
      data.filter((d) => d.year === 2022),
      (d) => d.value
    ) /
    sum(
      data.filter((d) => d.year === 2021),
      (d) => d.value
    );

  $: {
    const com1Keys = Array.from(new Set(data.map((d) => d.commodity)));
    const com2Keys = Array.from(new Set(data.map((d) => d.commodity2)));

    const tmp = new Map();

    for (const c2 of com2Keys) {
      for (const c1 of com1Keys) {
        const found = data.filter((d) => d.commodity === c1 && d.commodity2 === c2);

        if (found.length > 0) {
          if (!tmp.has(c2)) {
            tmp.set(c2, new Map());
          }

          const existing = tmp.get(c2);

          if (found.length === 1) {
            existing.set(
              c1,
              found[0].year === 2021
                ? [
                    { year: 2021, value: found[0].value, diff: 0 },
                    { year: 2022, value: 0, diff: -1 }
                  ]
                : [
                    { year: 2021, value: 0, diff: 0 },
                    { year: 2022, value: found[0].value, diff: 1 }
                  ]
            );
          } else if (found.length === 2) {
            existing.set(
              c1,
              found
                .sort((a, b) => a.year - b.year)
                .map((d) => ({
                  year: d.year,
                  value: d.value,
                  // diff: d.year === 2021 ? 1 : found[0].value / d.value
                  diff: d.year === 2021 ? 0 : (d.value - found[0].value) / found[0].value
                }))
            );
          }
        }
      }
    }

    const root = hierarchy(tmp)
      .sum((d) => (!Array.isArray(d) && d.year === selectedYear ? d.value : 0))
      .sort((a, b) => b.value - a.value);

    treemap()
      .tile(treemapResquarify)
      .size([selectedYear === 2021 ? w : diffRatio * w, selectedYear === 2021 ? h : diffRatio * h])
      .padding((d) => (d.height === 1 ? 0.5 : 0))
      .round(true)(root);

    leaves = root.leaves();
  }

  let hover;

  const c = scaleDiverging().interpolator(DivergingNegPos).domain([-0.7, 0, 1.7]);
</script>

{#if data && data.length > 0}
  <p class="total-label">
    <span class="label stronger caps">Total exports in {selectedYear}:</span>

    <Number
      unit={'$'}
      value={sum(
        data.filter((d) => d.year === selectedYear),
        (d) => d.value
      )}
    />

    {#if selectedYear === 2022}<span class="label small">(only {Math.round(diffRatio * 100)}% of the total exports in 2021)</span>{/if}
  </p>
  <div class="svg-container" bind:clientHeight={height} bind:clientWidth={width}>
    <svg {width} {height}>
      <g transform="translate({margin.left}, {margin.right})">
        <rect width={w} height={h} class="annotated-area" />
        {#each leaves.filter((d) => d.data.year === selectedYear) as leaf, i}
          <TreemapRect
            bind:hover
            {leaf}
            {i}
            diffColor={selectedYear === 2022 ? c(leaf.data.diff) : ColorVisReference}
            xOffset={selectedYear === 2021 ? 0 : (w * diffRatio) / 2}
            yOffset={selectedYear === 2021 ? 0 : h - h * diffRatio}
            {selectedYear}
            isInactive={false}
          />
        {/each}
      </g>
    </svg>
  </div>

  {#if hover !== undefined}
    <Tooltip class="label" targetPos={hover.pos} visible={true}>
      <div>
        {#if selectedYear === 2022}
          <p>
            <span class="small stronger diff" style="background-color: {c(hover.leaf.data.diff)}">
              {hover.leaf.data.diff < 0 ? '' : '+'}<Number unit="%" value={hover.leaf.data.diff * 100} />
            </span>
            {$_(labels.compared_to_2021)}
          </p>
          <hr />
        {/if}
        <span class="label small no-wrap">{hover.leaf.parent.data[0]}</span>
      </div>
    </Tooltip>
  {/if}
  <Legend
    color={c}
    title="Change 2021 to 2022"
    tickLabels={[
      { value: -0.7, label: '-70%' },
      { value: 0, label: '0' },
      { value: 1.7, label: '+170%' }
    ]}
    hidden={selectedYear === 2021}
  />
{/if}

<style>
  .total-label {
    padding-bottom: var(--space-2xs);
  }
  .no-wrap {
    white-space: normal;
  }
  .diff {
    padding: 2px 4px;
    border-radius: 3px;
    color: white;
  }
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
