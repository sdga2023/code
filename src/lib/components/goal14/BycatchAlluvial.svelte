<script>
  import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
  import { _ } from 'svelte-i18n';
  import * as colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let catched;
  export let bycatch;
  export let target;
  export let commercial;
  export let discarded;
  export let intended;

  const margin = {
    top: 20,
    right: 0,
    bottom: 0,
    left: 0
  };
  let w;
  let h = 500;

  $: labelMap = {
    catch: { label: catched, color: colors.ColorVisReference },
    intended: { label: intended, color: colors.ColorBaseBlue300 },
    bycatch: { label: bycatch, color: colors.ColorBasePurple500 },
    target: { label: target, color: colors.ColorBaseBlue300 },
    commercial: { label: commercial, color: colors.ColorBaseTeal300 },
    discarded: { label: discarded, color: colors.ColorBaseOrange400 }
  };

  let nodes = [{id: 'catch'}, {id: 'intended'}, {id: 'bycatch'}, {id: 'target'}, {id: 'discarded'}, {id: 'commercial'}]

  let graph = { nodes: nodes, links: data.map((d) => ({ ...d }))  };
  let bycatchSankey = sankey()
    .nodeId((d) => d.id)
    .nodeWidth(16)
    .nodePadding(32)
    .nodeSort(null);

  let layout
  $: if(w) {
    bycatchSankey.size([w, h - 40])
    layout = bycatchSankey(graph)
  }

</script>

<div bind:clientWidth={w}>
  <svg width={w} height={h}>
    <defs>
      <linearGradient id="l0" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={labelMap.catch.color} />
        <stop offset="50%" stop-color={labelMap.target.color} />
        <stop offset="100%" stop-color={labelMap.target.color} />
      </linearGradient>
      <linearGradient id="l1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={labelMap.target.color} />
        <stop offset="50%" stop-color={labelMap.target.color} />
        <stop offset="100%" stop-color={labelMap.target.color} />
      </linearGradient>
      <linearGradient id="l2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={labelMap.catch.color} />
        <stop offset="50%" stop-color={labelMap.bycatch.color} />
        <stop offset="100%" stop-color={labelMap.bycatch.color} />
      </linearGradient>
      <linearGradient id="l3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={labelMap.bycatch.color} />
        <stop offset="50%" stop-color={labelMap.commercial.color} />
        <stop offset="100%" stop-color={labelMap.commercial.color} />
      </linearGradient>
      <linearGradient id="l4" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color={labelMap.bycatch.color} />
        <stop offset="50%" stop-color={labelMap.discarded.color} />
        <stop offset="100%" stop-color={labelMap.discarded.color} />
      </linearGradient>
    </defs>
    <g transform={`translate(${margin.left}, ${margin.top})`}>
      {#if layout}

        <g class="links">
          {#each layout.links as link, i}
            <path d={sankeyLinkHorizontal()(link)} fill={'none'} stroke={'url(#l' + i + ')'} stroke-width={link.width} opacity={0.65} />
          {/each}
        </g>

        <g class="nodes">
          {#each layout.nodes as node}
            <rect x={node.x0} y={node.y0} height={node.y1 - node.y0} width={node.x1 - node.x0} fill={labelMap[node.id].color} />
          {/each}
          {#each layout.nodes as node}
            <text
              x={node.x0 + (node.x1 - node.x0) / 2}
              y={node.y0 + (node.y1 - node.y0) / 2 + 4}
              text-anchor={node.id == 'catch' ? 'start' : node.id == 'bycatch' || node.id == 'intended' ? 'middle' : 'end'}
              class="category white">{`${labelMap[node.id].label}`}</text
            >
            <text
              x={node.x0 + (node.x1 - node.x0) / 2}
              y={node.y0 + (node.y1 - node.y0) / 2 + 24}
              text-anchor={node.id == 'catch' ? 'start' : node.id == 'bycatch' ? 'middle' : 'end'}
              class="number white">{`${Math.round(node.value * 10) / 10}%`}</text
            >

          {/each}
        </g>
      {/if}
    </g>
  </svg>
</div>
