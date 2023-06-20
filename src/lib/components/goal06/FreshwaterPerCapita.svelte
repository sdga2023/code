<script>
  import Swirl from './Swirl.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import { getRegion, getIncomeLevel } from '../../../data/countryRegionIncomeDictionary';
  import { _ } from 'svelte-i18n';

  export let parentWidth;
  export let parentHeight;

  export let data = [];
  $: data = data.map((d) => ({
    ...d,
    regionISO3: getRegion(d.iso3)
  }));

  const regionOrder = ['MEA', 'ECS', 'EAS', 'SSF', 'LCN', 'SAS', 'NAC'];

  let hover = null;

  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  $: width = parentWidth;
  const height = 800;

  $: w = parentWidth - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  function generateSwirl(steps, _extent, padding, lineCount = 1, lineOffset = 0) {
    const w = _extent[2] - _extent[0] - 2 * padding;
    const h = _extent[3] - _extent[1] - 2 * padding;

    let x0, x1;
    const y0 = _extent[1] + padding;

    const cellHeight = h / steps;

    let radius = cellHeight / 2;

    let pathStrings = [];

    if (steps === 1) {
      x0 = _extent[0] + padding;
      x1 = _extent[2] - padding;
    } else if (steps === 2) {
      x0 = _extent[0] + padding;
      x1 = _extent[2] - padding - radius;
    } else {
      x0 = _extent[0] + padding + radius;
      x1 = _extent[2] - padding - radius;
    }

    for (let j = 0; j < lineCount; j++) {
      pathStrings[j] = '';

      for (let i = 0; i < steps; i++) {
        let isEven = i % 2 === 0;

        const halfTotalOffset = 0.5 * lineCount * lineOffset;
        const y = y0 + j * lineOffset - halfTotalOffset;
        const r = radius;

        if (i === 0) {
          pathStrings[j] += `M ${x0} ${y + i * cellHeight + cellHeight / 2} `;
          pathStrings[j] += `L ${x1 - halfTotalOffset} ${y + i * cellHeight + cellHeight / 2} `;
        } else {
          if (isEven) {
            pathStrings[j] += `A ${r - (lineCount - j) * lineOffset} ${r - (lineCount - j) * lineOffset} 0 0 0 ${x0 + halfTotalOffset} ${
              y + i * cellHeight + cellHeight / 2
            } `;
            pathStrings[j] += `L ${x1 - halfTotalOffset} ${y + i * cellHeight + cellHeight / 2} `;
          } else {
            pathStrings[j] += `A ${r - j * lineOffset} ${r - j * lineOffset} 0 0 1 ${x1 - halfTotalOffset} ${
              y + (lineCount - j - 1) * lineOffset - j * lineOffset + i * cellHeight + cellHeight / 2
            } `;
            pathStrings[j] += `L ${x0 + halfTotalOffset} ${
              y + (lineCount - j - 1) * lineOffset - j * lineOffset + i * cellHeight + cellHeight / 2
            } `;
          }
        }
      }
    }

    return pathStrings;
  }

  $: swirls = generateSwirl(5, [0, 0, w, h], 50, 7, 12);
</script>

{#if data && data.length > 0}
  <div class="chart" bind:clientWidth={width}>
    <svg {width} {height}>
      <g transform="translate({margin.left}, {margin.top})">
        <!-- <rect width={w} height={h} fill="none" stroke="black" /> -->
        <!-- <rect x={50} y={50} width={w - 2 * 50} height={h - 2 * 50} fill="none" stroke="black" /> -->
        {#each swirls as pathString, i}
          <Swirl {pathString} regionData={i === swirls.length - 1 ? data : []} {i} bind:hover {regionOrder} />
          <text
            x={2 * 50}
            y={1.5 * 50}
            dy={i * 12 - 2}
            class="label small central"
            style="fill: var(--color-vis-region-{regionOrder[regionOrder.length - 1 - i]});">{$_(`region.${regionOrder[i]}`)}</text
          >
        {/each}
      </g>
    </svg>
    <CategoricalLegend legendType="regions" />
  </div>
  {#if hover !== null}
    <Tooltip targetPos={{ x: hover.x, y: hover.y }} visible={true}>
      <div class="label caps">{hover.data.country}</div>
      <div class="label stronger"><Number value={hover.data.value} /></div>
      <div class="label small weaker">m<sup>3</sup> per capita per year</div>
    </Tooltip>
  {/if}
{/if}
