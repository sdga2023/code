<script>
  import { range } from 'd3-array';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { getRegion } from './../../../data/countryRegionIncomeDictionary.js';
  import { fade } from 'svelte/transition';

  export let data;
  export let activeScene;

  let colorScale = {
    LCN: Colors.ColorVisRegionLCN,
    SAS: Colors.ColorVisRegionSAS,
    SSF: Colors.ColorVisRegionSSF,
    ECS: Colors.ColorVisRegionECS,
    MEA: Colors.ColorVisRegionMEA,
    NAC: Colors.ColorVisRegionNAC,
    EAS: Colors.ColorVisRegionEAS
  };

  let w;
  let h = 650;

  $: size = Math.min(w, h) / 2;
  $: yOffset = (size - Math.sin((30 * Math.PI) / 180) * size) / 2;

  // The coordinates of the angles of the triangle. A is left, B is right, C is top
  $: [A, B, C] = [150, 30, -90].map((d) => [Math.cos((d * Math.PI) / 180) * size, Math.sin((d * Math.PI) / 180) * size + yOffset]);

  function line([x1, y1], [x2, y2]) {
    return function (t) {
      return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
    };
  }

  // Functions that return the coordinates of a point on the axis for values between 0 and 1
  $: a = line(B, C);
  $: b = line(C, A);
  $: c = line(A, B);

  // Coordinates for the axis titles
  const labelOffset = 80;
  $: [_A, _B, _C] = [150, 30, -90].map((d) => [
    Math.cos((d * Math.PI) / 180) * (size + labelOffset),
    Math.sin((d * Math.PI) / 180) * (size + labelOffset) + yOffset
  ]);

  $: _a = line(_B, _C);
  $: _b = line(_C, _A);
  $: _c = line(_A, _B);

  const ticks = range(0, 100, 20).concat(100);
  const grid = range(0, 1, 0.1);

  $: grids = [grid.map((d) => [a(d), b(1 - d)]), grid.map((d) => [b(d), c(1 - d)]), grid.map((d) => [c(d), a(1 - d)])];
  $: labels = [
    ticks.map((d) => ({ value: d, position: a(d / 100), rotation: 0, anchor: 'start' })),
    ticks.map((d) => ({ value: d, position: b(d / 100), rotation: 60, anchor: 'end' })),
    ticks.map((d) => ({ value: d, position: c(d / 100), rotation: -60, anchor: 'end' }))
  ];

  $: titles = [
    { label: 'Other renewables', position: _a(0.5), rotation: 60 },
    { label: 'Solid biofuels', position: _b(0.5), rotation: -60 },
    { label: 'Non renewables', position: _c(0.5), rotation: 0 }
  ];
</script>

<div class="ternary" bind:clientWidth={w}>
  {#if A && w && grids && data}
    <svg width={w} height={h}>
      <g transform={`translate(${w / 2},${h / 2})`}>
        {#each titles as title}
          <text transform={`translate(${title.position}) rotate(${title.rotation})`} text-anchor={'middle'}>{title.label}</text>
        {/each}

        {#if activeScene.index > 0}
          <path d={`M${A}L${B}L${C}Z`} fill={'#ececec'} transition:fade|local />
          {#each grids as grid}
            {#each grid as gridline, i}
              <line
                x1={gridline[0][0]}
                y1={gridline[0][1]}
                x2={gridline[1][0]}
                y2={gridline[1][1]}
                stroke={'#ffffff'}
                stroke-width={i & 1 ? 1 : 2}
              />
            {/each}
          {/each}

          {#each labels as axislabels}
            {#each axislabels as label}
              <g transform={`translate(${label.position}) rotate(${label.rotation})`} transition:fade|local>
                <text x={10 * (label.anchor === 'start' ? 1 : -1)} y={3} text-anchor={label.anchor} class="small">{label.value}</text>
              </g>
            {/each}
          {/each}
        {/if}

        {#each data as country}
          {#if activeScene.id == 'singlecountryguides' && country.iso3c == 'PRY'}
            <line
              x1={(A[0] * country.solidbiofuels) / 100 + (B[0] * country.nonrenewable) / 100 + (C[0] * country.otherrenewables) / 100}
              x2={a(country.otherrenewables / 100)[0]}
              y1={(A[1] * country.solidbiofuels) / 100 + (B[1] * country.nonrenewable) / 100 + (C[1] * country.otherrenewables) / 100}
              y2={a(country.otherrenewables / 100)[1]}
              stroke-width={2}
              stroke={colorScale['LCN']}
              transition:fade|local
            />
            <line
              x1={(A[0] * country.solidbiofuels) / 100 + (B[0] * country.nonrenewable) / 100 + (C[0] * country.otherrenewables) / 100}
              x2={b(country.solidbiofuels / 100)[0]}
              y1={(A[1] * country.solidbiofuels) / 100 + (B[1] * country.nonrenewable) / 100 + (C[1] * country.otherrenewables) / 100}
              y2={b(country.solidbiofuels / 100)[1]}
              stroke-width={2}
              stroke={colorScale['LCN']}
              transition:fade|local
            />
            <line
              x1={(A[0] * country.solidbiofuels) / 100 + (B[0] * country.nonrenewable) / 100 + (C[0] * country.otherrenewables) / 100}
              x2={c(country.nonrenewable / 100)[0]}
              y1={(A[1] * country.solidbiofuels) / 100 + (B[1] * country.nonrenewable) / 100 + (C[1] * country.otherrenewables) / 100}
              y2={c(country.nonrenewable / 100)[1]}
              stroke-width={2}
              stroke={colorScale['LCN']}
              transition:fade|local
            />
          {/if}
          <circle
            cx={(A[0] * country.solidbiofuels) / 100 + (B[0] * country.nonrenewable) / 100 + (C[0] * country.otherrenewables) / 100}
            cy={(A[1] * country.solidbiofuels) / 100 + (B[1] * country.nonrenewable) / 100 + (C[1] * country.otherrenewables) / 100}
            r={4}
            fill={colorScale[getRegion(country.iso3c)]}
            stroke={'#ffffff'}
            stroke-width={1}
            id={country.iso3c}
            opacity={activeScene.index < 2
              ? 0
              : activeScene.index > 3 && activeScene.index < 5
              ? 1
              : country.iso3c == 'PRY' && (activeScene.id == 'singlecountry' || activeScene.id == 'singlecountryguides')
              ? 1
              : activeScene.id == 'ssf' && getRegion(country.iso3c) == 'SSF'
              ? 1
              : activeScene.id == 'ssf'
              ? 0.1
              : 0}
          />
        {/each}
      </g>
    </svg>
  {/if}
</div>

<style>
  .ternary {
    grid-column: main;
  }
  circle {
    transition: opacity 0.5s;
  }
</style>
