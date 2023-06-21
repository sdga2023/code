<script>
  import { treemapSquarify, extent, treemap, stratify, hierarchy, max, forceSimulation, forceX, forceY, forceCollide } from 'd3';
  import { _ } from 'svelte-i18n';
  import { Tooltip, Number, CategoricalLegend } from '$lib/components';
  import SectorVisScrubber from './SectorVisScrubber.svelte';
  import { isMobile } from '$lib/stores/isMobile';

  export let parentHeight;
  export let unit_label = 'billion USD';

  export let data;
  export let activeScene;

  let w = 0;
  let h = 600;

  const margins = {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2
  };

  const scrubberHeight = parentHeight < 800 ? 100 : 200;

  const COLORMAP = {
    'Social Infrastructure & Services': 'var(--color-vis-cat8-5)',
    'Economic Infrastructure & Services': 'var(--color-vis-cat8-4)',
    'Production Sectors': 'var(--color-vis-cat8-3)',
    'Multi-Sector / Cross-Cutting': 'var(--color-vis-cat8-8)',
    'Commodity Aid / General Programme Assistance': 'var(--color-vis-cat8-7)',
    'Action Relating to Debt': 'var(--color-vis-cat8-6)',
    'Humanitarian Aid': 'var(--color-vis-cat8-1)',
    'Unallocated / Unspecified': 'var(--color-vis-filtered-out)'
  };

  let treemapPreparedFor = { w: null, h: null };

  const yearAccessor = (d) => d?.year;
  const topAccessor = (d) => d?.top;
  const secAccessor = (d) => d?.sec;
  const acc = (d) => d?.amount;
  const accMax = (d) => d?.maxAmount;

  $: years = extent(data, yearAccessor);
  $: sectors = Array.from(new Set(data.map(secAccessor)));

  let treemapPath;
  let richData = [];

  $: if (data && w && h) {
    richData = data.map((d) => {
      let maxAmount = max(
        data.filter((dd) => topAccessor(dd) === topAccessor(d) && secAccessor(dd) === secAccessor(d)),
        acc
      );
      let ratio = acc(d) / maxAmount;
      return {
        ...d,
        maxAmount,
        ratio
      };
    });

    if (w !== treemapPreparedFor.w || h !== treemapPreparedFor.h) {
      // calculate the treemaps for each year:
      const treeGen = treemap()
        .tile(treemapSquarify.ratio(0.5))
        .size([w - margins.left - margins.right, h - margins.top - margins.bottom])
        .paddingInner(5)
        .round(true);

      let myData = {
        id: 'root',
        children: []
      };
      richData
        .filter((d) => yearAccessor(d) === years[1])
        .forEach((d) => {
          const top = topAccessor(d);
          const sec = secAccessor(d);
          const maxVal = accMax(d);

          if (!myData.children.some((dd) => dd.id === sec)) {
            myData.children.push({ id: sec, children: [] });
          }
          const mySec = myData.children.find((dd) => dd.id === sec);
          if (!mySec.children.some((dd) => dd.id === top)) {
            mySec.children.push({ id: top, amount: 0 });
          }
          const myTop = mySec.children.find((dd) => dd.id === top);
          myTop.amount += maxVal;
        });

      //let root = stratify()(myData);
      let root = hierarchy(myData);

      root.sum(acc).sort((a, b) => acc(b) - acc(a));

      treemapPath = treeGen(root);

      treemapPreparedFor = { w, h };
    }
  }

  // label placement:
  $: labelData = treemapPath?.leaves();
  let labelSim = null;
  $: if (labelData) {
    labelSim = forceSimulation(labelData)
      .force(
        'x',
        forceX()
          .x((d) => d.x0 + (d.x1 - d.x0) / 2)
          .strength(1)
      )
      .force(
        'y',
        forceY()
          .y((d) => d.y0 + (d.y1 - d.y0) / 2)
          .strength(0.5)
      )
      .force('collide', forceCollide((d) => d.data.id.length).strength(0.5))
      .stop();

    for (let i = 0, n = Math.ceil(Math.log(labelSim.alphaMin()) / Math.log(1 - labelSim.alphaDecay())); i < n; ++i) {
      labelSim.tick();
    }
  }

  let highlightedTops = [];
  let prevSceneId = null;

  $: if (prevSceneId !== activeScene.id) {
    if (activeScene.id === 'intro') {
      highlightedTops = [];
    } else if (activeScene.id === 'social') {
      highlightedTops = [
        'Education',
        'Health',
        'Population Policies/Programmes & Reproductive Health',
        'Water Supply & Sanitation',
        'Government & Civil Society',
        'Other Social Infrastructure & Services'
      ];
    } else if (activeScene.id === 'emergency') {
      highlightedTops = ['Emergency Response'];
    } else if (activeScene.id === 'environment') {
      highlightedTops = ['General Environment Protection'];
    }
    tooltipVisible = false;
    hoveredSector = null;
    currentYear = 2021;
    prevSceneId = activeScene.id;
  }

  let currentYear = 2021;

  let hoveredSector = null;
  let tooltipVisible = false;
  let tooltipTargetPos = { x: 0, y: 0 };
  function showTooltip(e, c) {
    hoveredSector = c?.data;
    tooltipVisible = true;
    const x = e.clientX;
    const y = e.clientY;
    tooltipTargetPos = { ...tooltipTargetPos, x, y };
  }
  function hideTooltip() {
    tooltipVisible = false;
    hoveredSector = null;
  }

  $: currentYearScales = richData.filter((d) => yearAccessor(d) === currentYear);
</script>

<CategoricalLegend legendType="custom" customItems={sectors.map((sector) => ({ key: sector, colour: COLORMAP[sector] }))} />
<div class="svg-container-container">
  <div class="svg-container" bind:clientHeight={h} bind:clientWidth={w}>
    <svg width={w} height={h} on:mouseout={() => hideTooltip()}>
      <g transform="translate({margins.left}, {margins.top})">
        {#if treemapPath}
          {#each treemapPath?.leaves() ?? [] as box}
            <rect
              class="interactive"
              class:highlighted={highlightedTops.length === 0 || highlightedTops.includes(box.data.id) || hoveredSector?.id === box.data.id}
              x={box.x0}
              y={box.y0}
              width={box.x1 - box.x0}
              height={box.y1 - box.y0}
              stroke="white"
              style:opacity={0.2}
              fill={COLORMAP[box.parent.data.id]}
              on:mouseover={(e) => showTooltip(e, box)}
              on:mousemove={(e) => showTooltip(e, box)}
            />

            <rect
              class:highlighted={highlightedTops.length === 0 || highlightedTops.includes(box.data.id) || hoveredSector?.id === box.data.id}
              x={box.x0 + (0 * (box.x1 - box.x0) * (1 - currentYearScales.find((d) => topAccessor(d) === box.data.id).ratio ** 0.5)) / 2}
              y={box.y1 - (box.y1 - box.y0) * currentYearScales.find((d) => topAccessor(d) === box.data.id).ratio}
              width={(box.x1 - box.x0) * 1 + 0 * currentYearScales.find((d) => topAccessor(d) === box.data.id).ratio ** 0.5}
              height={(box.y1 - box.y0) * currentYearScales.find((d) => topAccessor(d) === box.data.id).ratio}
              fill={COLORMAP[box.parent.data.id]}
            />
          {/each}
        {/if}
      </g>
    </svg>
    <div class="label-container" style:width={w + 'px'} style:height={h + 'px'}>
      {#if treemapPath && !$isMobile}
        {#each labelSim.nodes().filter((d) => highlightedTops.includes(d.data.id) || hoveredSector?.id === d.data.id) ?? [] as box}
          <p
            style:left={box.x0 + (box.x1 - box.x0) / 2 + 'px'}
            style:top={box.y0 + (box.y1 - box.y0) / 2 + 'px'}
            style:width={box.x1 - box.x0 + 'px'}
            class="label small"
          >
            {box.data.id}
          </p>
        {/each}
      {/if}
    </div>
  </div>
</div>

<Tooltip visible={tooltipVisible} targetPos={tooltipTargetPos}>
  <p class="label">{currentYear}</p>
  <p class="label">{hoveredSector?.id}</p>
  <p class="number">
    <Number
      value={acc(data.find((d) => topAccessor(d) === hoveredSector?.id && yearAccessor(d) === currentYear))}
      digits={0}
    />{` ${unit_label}`}
  </p>
</Tooltip>
{#if treemapPath}
  <SectorVisScrubber
    w={$isMobile ? w : w * 0.7}
    h={scrubberHeight}
    data={richData}
    {years}
    {COLORMAP}
    {highlightedTops}
    {unit_label}
    bind:currentYear
  />
{/if}

<style>
  .svg-container-container {
    position: relative;
    flex: 1;
    overflow: hidden;

    display: flex;
    justify-content: stretch;
  }

  .svg-container {
    flex: 1;
    margin: var(--space-l) 0 var(--space-l) 0;
  }

  .label-container {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    overflow: visible;
  }
  .label-container > p {
    position: absolute;
    text-align: center;
    transform: translate(-50%, -50%);
    text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
  }

  rect {
    transition: 0.5s all;
    opacity: 0.2;
  }
  rect.highlighted {
    opacity: 1;
    stroke-width: 1px;
    stroke: black;
  }

  rect {
    pointer-events: none;
  }
  rect.interactive {
    pointer-events: all;
  }
</style>
