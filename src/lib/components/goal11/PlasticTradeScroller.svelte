<script>
  import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
  import { _ } from 'svelte-i18n';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { fade } from 'svelte/transition';

  export let data;
  export let activeScene;
  export let parentWidth;
  export let parentHeight;
  export let import_label;
  export let export_label;

  const margin = {
    top: 24,
    right: 0,
    bottom: 20,
    left: 0
  };
  $: w = parentWidth;
  $: h = parentHeight;

  $: highLayout = h > w;

  let heightRatio = 1926751636 / 6297003717;

  const colorScale = {
    LIC: Colors.ColorVisIncomeLow,
    LMC: Colors.ColorVisIncomeLowerMiddle,
    UMC: Colors.ColorVisIncomeUpperMiddle,
    HIC: Colors.ColorVisIncomeHigh
  };

  let nodes17 = [
    { id: 'HIC_source' },
    { id: 'UMC_source' },
    { id: 'LMC_source' },
    { id: 'LIC_source' },
    { id: 'HIC_target' },
    { id: 'UMC_target' },
    { id: 'LMC_target' },
    { id: 'LIC_target' }
  ];
  let nodes22 = [
    { id: 'HIC_source' },
    { id: 'UMC_source' },
    { id: 'LMC_source' },
    { id: 'LIC_source' },
    { id: 'HIC_target' },
    { id: 'UMC_target' },
    { id: 'LMC_target' },
    { id: 'LIC_target' }
  ];

  let graph17 = { nodes: nodes17, links: data.filter((d) => d.year == 2017).map((d) => ({ ...d })) };
  let graph22 = { nodes: nodes22, links: data.filter((d) => d.year == 2022).map((d) => ({ ...d })) };

  let plasticTradeSankey = sankey()
    .nodeId((d) => d.id)
    .nodeWidth(32)
    .nodePadding(1)
    .nodeSort(null);

  let layout17;
  let layout22;
  $: if (w) {
    layout17 = highLayout
      ? plasticTradeSankey.size([w - margin.left - margin.right, (h - margin.top - margin.bottom) * (1 - heightRatio)])(graph17)
      : plasticTradeSankey.size([(w - margin.left - margin.right) / 2 - 12, h - margin.top - margin.bottom])(graph17);
    layout22 = highLayout
      ? plasticTradeSankey.size([w - margin.left - margin.right, (h - 40) * heightRatio])(graph22)
      : plasticTradeSankey.size([(w - margin.left - margin.right) / 2 - 12, (h - margin.top - margin.right) * heightRatio])(graph22);
  }
</script>

<div>
  <svg width={w} height={h}>
    <defs>
      <linearGradient id="HIC_HIC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.HIC} />
        <stop offset="100%" stop-color={colorScale.HIC} />
      </linearGradient>
      <linearGradient id="HIC_UMC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.HIC} />
        <stop offset="100%" stop-color={colorScale.UMC} />
      </linearGradient>
      <linearGradient id="HIC_LMC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.HIC} />
        <stop offset="100%" stop-color={colorScale.LMC} />
      </linearGradient>
      <linearGradient id="HIC_LIC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.HIC} />
        <stop offset="100%" stop-color={colorScale.LIC} />
      </linearGradient>

      <linearGradient id="UMC_HIC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.UMC} />
        <stop offset="100%" stop-color={colorScale.HIC} />
      </linearGradient>
      <linearGradient id="UMC_UMC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.UMC} />
        <stop offset="100%" stop-color={colorScale.UMC} />
      </linearGradient>
      <linearGradient id="UMC_LMC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.UMC} />
        <stop offset="100%" stop-color={colorScale.LMC} />
      </linearGradient>
      <linearGradient id="UMC_LIC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.UMC} />
        <stop offset="100%" stop-color={colorScale.LIC} />
      </linearGradient>

      <linearGradient id="LMC_HIC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.LMC} />
        <stop offset="100%" stop-color={colorScale.HIC} />
      </linearGradient>
      <linearGradient id="LMC_UMC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.LMC} />
        <stop offset="100%" stop-color={colorScale.UMC} />
      </linearGradient>
      <linearGradient id="LMC_LMC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.LMC} />
        <stop offset="100%" stop-color={colorScale.LMC} />
      </linearGradient>
      <linearGradient id="LMC_LIC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.LMC} />
        <stop offset="100%" stop-color={colorScale.LIC} />
      </linearGradient>

      <linearGradient id="LIC_HIC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.LIC} />
        <stop offset="100%" stop-color={colorScale.HIC} />
      </linearGradient>
      <linearGradient id="LIC_UMC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.LIC} />
        <stop offset="100%" stop-color={colorScale.UMC} />
      </linearGradient>
      <linearGradient id="LIC_LMC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.LIC} />
        <stop offset="100%" stop-color={colorScale.LMC} />
      </linearGradient>
      <linearGradient id="LIC_LIC" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={colorScale.LIC} />
        <stop offset="100%" stop-color={colorScale.LIC} />
      </linearGradient>
    </defs>
    <g transform={`translate(${margin.left}, ${margin.top})`}>
      {#if layout17}
        <g class="alluvial17">
          {#if activeScene.index > 1}
            <g class="links" transition:fade|local>
              {#each layout17.links as link, i}
                <path
                  d={sankeyLinkHorizontal()(link)}
                  fill={'none'}
                  stroke={link.source.id.substring(0, 3) == 'HIC' && link.source.id.substring(0, 3) == 'HIC'
                    ? colorScale.HIC
                    : `url('#${link.source.id.substring(0, 3)}_${link.target.id.substring(0, 3)}')`}
                  stroke-width={link.width}
                  opacity={0.65}
                />
              {/each}
            </g>
          {/if}
          <g class="nodes">
            {#each layout17.nodes as node}
              {#if node.id.includes('source')}
                <rect
                  x={node.x0}
                  y={node.y0}
                  height={node.y1 - node.y0}
                  width={node.x1 - node.x0}
                  fill={colorScale[node.id.substring(0, 3)]}
                />
              {/if}
              {#if node.id.includes('target') && activeScene.index > 1}
                <rect
                  x={node.x0}
                  y={node.y0}
                  height={node.y1 - node.y0}
                  width={node.x1 - node.x0}
                  fill={colorScale[node.id.substring(0, 3)]}
                  transition:fade|local
                />
              {/if}
            {/each}
          </g>
        </g>
      {/if}

      {#if layout22}
        <g
          transform={highLayout
            ? `translate(0,${(h - margin.bottom - margin.top) * (1 - heightRatio) + 20})`
            : `translate(${w / 2},${h - (h - margin.bottom - margin.top) * heightRatio - margin.top - 24})`}
        >
          {#if activeScene.index > 2}
            <g class="links" transition:fade|local>
              {#each layout22.links as link, i}
                <path
                  d={sankeyLinkHorizontal()(link)}
                  fill={'none'}
                  stroke={link.source.id.substring(0, 3) == 'HIC' && link.source.id.substring(0, 3) == 'HIC'
                    ? colorScale.HIC
                    : `url(#${link.source.id.substring(0, 3)}_${link.target.id.substring(0, 3)})`}
                  stroke-width={link.width}
                  opacity={0.65}
                />
              {/each}
            </g>
          {/if}
          <g class="nodes">
            {#each layout22.nodes as node}
              {#if node.id.includes('source') && activeScene.index > 0}
                <rect
                  x={node.x0}
                  y={node.y0}
                  height={node.y1 - node.y0}
                  width={node.x1 - node.x0}
                  fill={colorScale[node.id.substring(0, 3)]}
                  transition:fade|local
                />
              {/if}
              {#if node.id.includes('target') && activeScene.index > 2}
                <rect
                  x={node.x0}
                  y={node.y0}
                  height={node.y1 - node.y0}
                  width={node.x1 - node.x0}
                  fill={colorScale[node.id.substring(0, 3)]}
                  transition:fade|local
                />
              {/if}
            {/each}
          </g>
        </g>
      {/if}
      <text x={highLayout ? w / 2 : w / 4} y={-10} class="label title centered middle">2017</text>
      <text class="small caps stronger" x={0} y={highLayout ? -10 : h - margin.top - 4}>{export_label}</text>
      {#if activeScene.index > 0}
        <text
          class="label title centered middle"
          x={highLayout ? w / 2 : (3 * w) / 4}
          y={highLayout ? h - (h - margin.bottom - margin.top) * heightRatio - margin.top - 10 : -10}>2022</text
        >
        <text class="small caps stronger" x={highLayout ? 0 : w / 2} y={highLayout ? -10 : h - margin.top - 4}>{export_label}</text>
      {/if}
      {#if activeScene.index > 1}
        <text class="small caps stronger" x={highLayout ? w : w / 2 - 10} y={highLayout ? -10 : h - margin.top - 4} text-anchor={'end'}
          >{import_label}</text
        >
      {/if}
      {#if activeScene.index > 2}
        <text class="small caps stronger" x={w} y={highLayout ? -10 : h - margin.top - 4} text-anchor={'end'}>{import_label}</text>
      {/if}
    </g>
  </svg>
</div>

<style>
  rect {
    stroke: white;
    stroke-width: 0px;
  }
</style>
