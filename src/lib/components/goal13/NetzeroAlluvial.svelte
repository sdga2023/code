<script>
  import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
  import { _ } from 'svelte-i18n';
  import * as colors from '$lib/styles/tokens.es6.js';
  import Number from '../general/Number.svelte';

  export let data;
  export let policy;
  export let pledge;
  export let law;
  export let nodoc;
  export let achieved;
  export let notarget;
  export let unknown;
  export let after2030;
  export let after2040;
  export let after2050;

  const labelMap = {
    law: { label: law, color: colors.ColorBaseTeal200 },
    policy: { label: policy, color: colors.ColorBaseTeal300 },
    pledge: { label: pledge, color: colors.ColorBaseTeal400 },
    nodoc: { label: nodoc, color: colors.ColorGrey200 },
    HIC: { label: $_('income.HIC'), color: colors.ColorVisIncomeHigh },
    UMC: { label: $_('income.UMC'), color: colors.ColorVisIncomeUpperMiddle },
    LMC: { label: $_('income.LMC'), color: colors.ColorVisIncomeLowerMiddle },
    LIC: { label: $_('income.LIC'), color: colors.ColorVisIncomeLow },
    unknown: { label: unknown, color: colors.ColorGrey200 },
    achieved: { label: achieved, color: colors.ColorBaseGreen200 },
    notarget: { label: notarget, color: colors.ColorGrey200 },
    '≥2030': { label: after2030, color: colors.ColorBaseGreen400 },
    '≥2040': { label: after2040, color: colors.ColorBaseGreen500 },
    '≥2050': { label: after2050, color: colors.ColorBaseGreen600 }
  };

  let nodes = [...new Set(data.map((d) => d.source).concat(data.map((d) => d.target)))].map((d) => {
    return { id: d };
  });

  const margin = {
    top: 20,
    right: 0,
    bottom: 0,
    left: 0
  };
  let w;
  let h = 750;

  $: netzeroSankey = sankey()
    .nodeId((d) => d.id)
    .nodeSort(null)
    .nodeWidth(18)
    .nodePadding(3)
    .size([w - margin.right - margin.left, h - 40]);

  $: graph = { nodes: nodes, links: data.map((d) => ({ ...d })) };

  $: layout = netzeroSankey(graph);
</script>

<div bind:clientWidth={w}>
  <div class="header" style="display:flex">
    <p class="label category" style="text-align:left">Income groups</p>
    <p class="label category" style="text-align:center">Net Zero Commitments</p>
    <p class="label category" style="text-align:right">Targets</p>
  </div>
  <svg width={w} height={h}>
    <g transform={`translate(${margin.left}, ${margin.top})`}>
      {#if layout}
        <g class="links">
          {#each layout.links as link}
            <path
              d={sankeyLinkHorizontal()(link)}
              fill={'none'}
              stroke={labelMap[link.source.id].color}
              stroke-width={link.width}
              opacity={0.4}
            />
          {/each}
          {#each layout.nodes as node}
            <rect x={node.x0} y={node.y0} height={node.y1 - node.y0} width={node.x1 - node.x0} fill={labelMap[node.id].color} />
          {/each}
          {#each layout.nodes as node}
            <foreignObject
              x={['notarget', '≥2050'].includes(node.id)
                ? node.x0 + (node.x1 - node.x0) / 2 - w / 4 - 12
                : ['≥2040', '≥2030', 'achieved'].includes(node.id)
                ? node.x0 + (node.x1 - node.x0) / 2 - w / 2 - 12
                : node.x0 + (node.x1 - node.x0) / 2 + 12}
              y={node.id == '≥2040'
                ? node.y0 + (node.y1 - node.y0) / 2 + 8
                : node.id == '≥2030'
                ? node.y0 + (node.y1 - node.y0) / 2
                : node.y0 + (node.y1 - node.y0) / 2 - 12}
              width={['≥2040', '≥2030', 'achieved'].includes(node.id) ? w / 2 : w / 4}
              height="100%"
            >
              <div
                class="label-container"
                style={['notarget', '≥2050', '≥2040', '≥2030', 'achieved'].includes(node.id)
                  ? 'justify-content:end; text-align:right'
                  : 'justify-content:start'}
              >
                <p class="label small stronger" style="display:inline-block">{labelMap[node.id].label}</p>
                <p class="number" style={['notarget', '≥2050', '≥2040', '≥2030', 'achieved'].includes(node.id) ? 'text-align:right' : ''}>
                  <Number value={Math.round(node.value * 10) / 10} unit="%" digits="1" />
                </p>
              </div></foreignObject
            >

            <!--
            <text
              x={node.x0 + (node.x1 - node.x0) / 2}
              dx={['notarget', '≥2050', '≥2040', '≥2030', 'achieved'].includes(node.id) ? -12 : 12}
              y={node.y0 + (node.y1 - node.y0) / 2 + 4}
              dy={node.id == '≥2040' ? 8 : node.id == 'achieved' ? -12 : 0}
              text-anchor={['law', 'policy', 'pledge', 'nodoc'].includes(node.id)
                ? 'start'
                : ['notarget', '≥2050', '≥2040', '≥2030', 'achieved'].includes(node.id)
                ? 'end'
                : 'start'}
              ><tspan class={['achieved', '≥2030', '≥2040'].includes(node.id) ? 'no-stroke category' : 'no-stroke category'}
                >{labelMap[node.id].label}:</tspan
              >
              <tspan class={['achieved', '≥2030', '≥2040'].includes(node.id) ? 'number' : 'number'}
                ><Number value={Math.round(node.value * 10) / 10} unit="%" digits="1" /></tspan
              ></text
            >
            -->
          {/each}
        </g>
      {/if}
    </g>
  </svg>
</div>

<style>
  .header {
    align-items: flex-end;
  }
  .label-container p {
    line-height: 100%;
  }
  .header p {
    flex: 1;
    height: fit-content;
  }
  .label-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-content: center;
    column-gap: 5px;
  }
</style>
