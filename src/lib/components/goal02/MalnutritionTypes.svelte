<script>
  import { groups, range, scaleLinear, format } from 'd3';
  import { fade } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let activeScene;
  export let parentWidth;
  export let parentHeight;

  export let labels;

  const intervals = [0, 0.25, 0.75, 1]; // probably not the most elegant approach

  const regions = [
    { key: 'SSF', label: 'Sub-Saharan Africa', cssVar: '--color-vis-region-SSF' },
    { key: 'MEA', label: 'Middle East & North Africa', cssVar: '--color-vis-region-MEA' },
    { key: 'ECS', label: 'Europe & Central Asia', cssVar: '--color-vis-region-ECS' },
    { key: 'SAS', label: 'South Asia', cssVar: '--color-vis-region-SAS' },
    { key: 'EAS', label: 'East Asia & Pacific', cssVar: '--color-vis-region-EAS' },
    { key: 'NAC', label: 'North America', cssVar: '--color-vis-region-NAC' },
    { key: 'LCN', label: 'Latin America & Caribbean', cssVar: '--color-vis-region-LCN' }
  ];

  const indicators = [
    { key: 'SN.ITK.DEFC.ZS', translationKey: 'malnutrition' },
    { key: 'SH.STA.STNT.ME.ZS', translationKey: 'stunting' },
    { key: 'SH.STA.WAST.ZS', translationKey: 'wasting' },
    { key: 'SH.ANM.ALLW.ZS', translationKey: 'anemia' },
    { key: 'SH.ANM.CHLD.ZS', translationKey: 'anemia2' }
  ];

  $: byIndicator2 = indicators.reduce((acc, indicator, i) => {
    acc[indicator.key] = groups(
      data.filter((d) => d[indicators[i].key] !== null && ['WLD', ...regions.map((d) => d.key)].includes(d.iso3c)),
      (d) => d.iso3c
    ).map((d) => d[1][d[1].length - 1]);

    return acc;
  }, {});

  const sceneMapping = [
    { indicators: ['SN.ITK.DEFC.ZS'], regions: ['WLD'] },
    { indicators: ['SN.ITK.DEFC.ZS'], regions: ['SSF', 'MEA', 'ECS', 'SAS', 'EAS', 'NAC', 'LCN'] },
    { indicators: ['SH.STA.STNT.ME.ZS'], regions: ['WLD'] },
    { indicators: ['SH.STA.STNT.ME.ZS'], regions: ['SSF', 'MEA', 'ECS', 'SAS', 'EAS', 'NAC', 'LCN'] },
    { indicators: ['SH.STA.WAST.ZS'], regions: ['WLD'] },
    { indicators: ['SH.STA.WAST.ZS'], regions: ['SSF', 'MEA', 'ECS', 'SAS', 'EAS', 'NAC', 'LCN'] },
    { indicators: ['SH.ANM.CHLD.ZS'], regions: ['WLD'] },
    { indicators: ['SH.ANM.CHLD.ZS'], regions: ['SSF', 'MEA', 'ECS', 'SAS', 'EAS', 'NAC', 'LCN'] },
    { indicators: ['SH.ANM.ALLW.ZS'], regions: ['WLD'] },
    { indicators: ['SH.ANM.ALLW.ZS'], regions: ['SSF', 'MEA', 'ECS', 'SAS', 'EAS', 'NAC', 'LCN'] }
  ];

  let width;
  $: height = parentHeight;

  const margin = {
    top: 55,
    right: 20,
    bottom: 20,
    left: 20
  };

  $: w = width - margin.left - margin.right;
</script>

<div class="svg-container" bind:clientWidth={width} bind:clientHeight={height}>
  <svg {width} {height}>
    <g transform="translate({margin.left}, {margin.top})">
      {#if data && activeScene !== undefined && activeScene.index !== undefined}
        {#if sceneMapping[activeScene.index]?.indicators}
          {#each sceneMapping[activeScene.index]?.indicators as indicator, j}
            <g transform="translate(0, {j * 160})">
              <text x={w / 2} style="text-anchor: middle" class="label title" dy={-40}>
                {$_(labels[indicators.find((d) => d.key === indicator).translationKey])}
              </text>
              {#each byIndicator2[indicator]
                .filter((d) => sceneMapping[activeScene.index].regions.includes(d.iso3c))
                .sort((a, b) => b[indicator] - a[indicator]) as d, i (`${d.iso3c}_${indicator}`)}
                {#if parentHeight <= 480 && parentWidth > parentHeight}
                  <g transform="translate({w / 2 + 100}, {48 * i})" transition:fade|local={{ duration: 300, delay: i * 50 }}>
                    <text dx={-54} dy={0} x={(-20 / 2) * 10} class="label small">{d.country}</text>
                    <g transform="translate({(-20 / 2) * 10}, 10)">
                      <text class="label small" dy={10} dx={-180}>
                        <tspan class="label stronger large">{Math.round(d[indicator])}</tspan>
                        {indicator === 'SN.ITK.DEFC.ZS' ? $_(labels['in_100_people']) : $_(labels['in_100_children'])}
                      </text>
                      {#each range(100) as k}
                        <circle
                          r={4}
                          cx={(k % 50) * 10 - 50}
                          cy={Math.floor(k / 50) * 10}
                          stroke="var(--color-vis-region-{d.iso3c})"
                          fill={k < Math.round(d[indicator]) ? `var(--color-vis-region-${d.iso3c})` : 'transparent'}
                        />
                      {/each}
                    </g>
                  </g>
                {:else if $isMobile}
                  <g transform="translate({w / 2 + 100}, {68 * i})" transition:fade|local={{ duration: 300, delay: i * 50 }}>
                    <text dx={-54} dy={0} x={(-20 / 2) * 10} class="label small">{d.country}</text>
                    <g transform="translate({(-20 / 2) * 10}, 10)">
                      <text class="label small" dy={2 * 10 + 4} dx={-170}>
                        <tspan class="label stronger large">{Math.round(d[indicator])}</tspan>
                        {indicator === 'SN.ITK.DEFC.ZS' ? $_(labels['in_100_people']) : $_(labels['in_100_children'])}</text
                      >
                      {#each range(100) as k}
                        <circle
                          r={4}
                          cx={(k % 20) * 10 - 50}
                          cy={Math.floor(k / 20) * 10}
                          stroke="var(--color-vis-region-{d.iso3c})"
                          fill={k < Math.round(d[indicator]) ? `var(--color-vis-region-${d.iso3c})` : 'transparent'}
                        />
                      {/each}
                    </g>
                  </g>
                {:else}
                  <g transform="translate({w / 2 + 100}, {90 * i})" transition:fade|local={{ duration: 300, delay: i * 50 }}>
                    <text dx={-20} dy={64} x={(-25 / 2) * 16} class="label small" style="text-anchor: end; dominant-baseline: middle;"
                      >{d.country}</text
                    >
                    <g transform="translate({(-25 / 2) * 16}, 16)">
                      <text class="label" style="dominant-baseline: middle; text-anchor: end;" dy={2 * 16 - 8} dx={-20}
                        ><tspan class="label stronger large">{Math.round(d[indicator])}</tspan>
                        {indicator === 'SN.ITK.DEFC.ZS' ? $_(labels['in_100_people']) : $_(labels['in_100_children'])}</text
                      >
                      {#each range(100) as k}
                        <circle
                          r={6}
                          cx={(k % 25) * 16}
                          cy={Math.floor(k / 25) * 16}
                          stroke="var(--color-vis-region-{d.iso3c})"
                          fill={k < Math.round(d[indicator]) ? `var(--color-vis-region-${d.iso3c})` : 'transparent'}
                        />
                      {/each}
                    </g>
                  </g>
                {/if}
              {/each}
            </g>
          {/each}
        {/if}
      {/if}
    </g>
  </svg>
</div>

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
