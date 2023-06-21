<script>
  import { max, sum, scaleLinear, groups, scaleBand } from 'd3';
  import { format } from 'd3-format';
  import { fade } from 'svelte/transition';
  import { getRegion } from './../../../data/countryRegionIncomeDictionary';
  import CountryPicker from '../general/CountryPicker.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { _ } from 'svelte-i18n';
  import Number from '../general/Number.svelte';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let parentWidth;
  export let parentHeight;
  export let activeScene;
  export let labels;

  let selectedCountry = 'HND';
  $: selectedRegion = selectedCountry === null ? undefined : getRegion(selectedCountry);
  let selectedCause = 724;

  let mousePos = { x: 0, y: 0 };
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  $: dataSumMaleFemale = data.map((d) => ({ ...d, both: d.male + d.female }));

  $: sumGlobal = sum(
    dataSumMaleFemale.filter((d) => d.iso3c === 'WLD'),
    (d) => d.both
  );

  $: global = dataSumMaleFemale
    .filter((d) => d.iso3c === 'WLD')
    .map((d) => ({
      ...d,
      both: d.both / sumGlobal,
      malePct: d.male / (d.male + d.female),
      femalePct: d.female / (d.male + d.female)
    }));

  $: sumRegion = sum(
    dataSumMaleFemale.filter((d) => d.iso3c === selectedRegion),
    (d) => d.both
  );

  $: region = dataSumMaleFemale
    .filter((d) => d.iso3c === selectedRegion)
    .map((d) => ({
      ...d,
      both: d.both / sumRegion,
      malePct: d.male / (d.male + d.female),
      femalePct: d.female / (d.male + d.female)
    }));

  $: sumCountry = sum(
    dataSumMaleFemale.filter((d) => d.iso3c === selectedCountry),
    (d) => d.both
  );

  $: country = dataSumMaleFemale
    .filter((d) => d.iso3c === selectedCountry)
    .map((d) => ({
      ...d,
      both: d.both / sumCountry,
      malePct: d.male / (d.male + d.female),
      femalePct: d.female / (d.male + d.female)
    }));

  const f = format('.2%');

  const margin = {
    top: 40,
    right: 5,
    bottom: 5,
    left: 5
  };

  $: width = parentWidth;
  $: height = parentHeight;

  $: w = width - margin.left - margin.right;
  $: h = height - margin.top - margin.bottom;

  $: y = scaleLinear()
    .domain([
      0,
      max(
        data2.filter((d) => d.country.val >= 0.01),
        (d) => d.country.d1
      )
    ])
    .range([0, h]);

  $: x = scaleBand()
    .domain(['global', 'region', 'country'])
    .range([$isMobile ? 0 : 300, w])
    .paddingInner(0.5);
  $: columnWidth = x.bandwidth();

  $: activeData = global;

  const minLabelHeight = 0;

  const enrich = (data, key) =>
    data
      // .sort((a, b) => b[key].malePct - a[key].malePct)
      .sort((a, b) => b[key].val - a[key].val)
      .reduce((acc, cur, i) => {
        if (i === 0) {
          acc.push({
            ...cur,
            [key]: {
              ...cur[key],
              d0: 0,
              d1: cur[key].val || 0
            }
          });
        } else {
          acc.push({
            ...cur,
            [key]: {
              ...cur[key],
              d0: acc[i - 1][key].d1,
              d1: acc[i - 1][key].d1 + (cur[key].val || 0)
            }
          });
        }

        return acc;
      }, []);

  $: data2 = enrich(
    enrich(
      enrich(
        groups([country, region, global].flat(), (d) => d.cause_id).map((d) => {
          return {
            cause_id: d[0],
            cause_name: d[1][0].cause_name,
            country: {
              val: d[1][0]?.both || 0,
              malePct: d[1][0]?.malePct || 0
            },
            region: {
              val: d[1][1]?.both || 0,
              malePct: d[1][1]?.malePct || 0
            },
            global: {
              val: d[1][selectedCountry !== null ? 2 : 0]?.both || 0,
              malePct: d[1][selectedCountry !== null ? 2 : 0]?.malePct || 0
            },
            data: d[1]
          };
        }),
        'country'
      ),
      'region'
    ),
    'global'
  );

  $: activeScene.index === 0 ? (activeData = global) : activeScene.index === 1 ? (activeData = region) : (activeData = country);

  $: selectedCauseData = data2.find((d) => d.cause_id === selectedCause);
  let hoverCause = undefined;

  const handleMouseOver = (s, column) => {
    if (activeScene.index >= 3) {
      selectedCause = s.cause_id;
      hoverCause = s;
      hoverCause.malePct = column === 2 ? s.global.malePct : column === 1 ? s.region.malePct : s.country.malePct;
      hoverCause.femalePct = column === 2 ? 1 - s.global.malePct : column === 1 ? 1 - s.region.malePct : 1 - s.country.malePct;
      hoverCause.geoPct = column === 2 ? s.global.val : column === 1 ? s.region.val : s.country.val;
      hoverCause.geo =
        column === 2 ? $_(labels.global) : column === 1 ? $_(`region.${s.data[1].iso3c}`) : $_(`country.${s.data[0].iso3c.toLowerCase()}`);
    } else {
      selectedCountry = 'HND';
    }
  };

  const handleMouseOut = () => {
    if (activeScene.index >= 3) {
      selectedCause = undefined;
      hoverCause = undefined;
    } else {
      selectedCountry = 'HND';
    }
  };

  $: {
    if (activeScene.index < 3) {
      selectedCountry = 'HND';
      selectedCause = 724;
    }
  }

  $: labelData = data2
    .filter((d) => d.global.val >= 0.01)
    .reduce((acc, cur, i) => {
      if (i === 0) {
        const y0 = y(0);
        const y1 = y(cur.global.val);

        acc.push({
          ...cur,
          label: cur.cause_name,
          y0,
          y1: y1 - y0 > minLabelHeight ? y1 : y0 + minLabelHeight,
          y: (y0 + y1) / 2
        });
      } else {
        const y0 = acc[i - 1].y1;
        const y1 = y0 + y(cur.global.val);

        acc.push({
          ...cur,
          cause_id: cur.cause_id,
          label: cur.cause_name,
          y0,
          y1: y1 - y0 > minLabelHeight ? y1 : y0 + minLabelHeight,
          y: (y0 + y1) / 2
        });
      }

      return acc;
    }, []);

  $: hiddenlabels = Math.floor(h * -0.015 + 19);
</script>

<div style="height: 40px;">
  {#if activeScene.index === 3}
    <CountryPicker bind:selectedCountry clear={() => (selectedCountry = 'HND')} />
  {/if}
</div>
<div bind:clientWidth={width} bind:clientHeight={height} class="causes-of-death-scroller svg-container">
  <svg {width} {height} on:mousemove={(e) => updateMouse(e)}>
    <g transform="translate({margin.left}, {margin.top})">
      {#if !$isMobile}
        {#each labelData as s, i}
          <g
            transform="translate(300, {s.y})"
            transition:fade|local={{ delay: i * 20 }}
            on:mouseover={() => handleMouseOver(s, 2)}
            on:mouseout={handleMouseOut}
            style:opacity={i < labelData.length - hiddenlabels ? 1 : s.cause_id === selectedCause ? 1 : 0}
          >
            {#if s.cause_id === selectedCause}
              <!-- y={(y(s.global.d1) + y(s.global.d0)) / 2} -->
              <text dx={-10} class="label small central end" style="font-weight: bold; fill: var(--color-vis-red);">
                {s.label}
              </text>
            {:else}
              <text dx={-10} class="label small central end">
                {s.label}
              </text>
            {/if}
          </g>
        {/each}
      {/if}

      {#if activeScene.index >= 0}
        <text class:geo={!$isMobile} class="label small stronger middle" x={x('global') + columnWidth / 2} dy={-10}
          >{$_(labels.global)}</text
        >
        {#each data2.filter((d) => d.global.val >= 0.01) as s, i}
          <g
            transform="translate({x('global')}, 0)"
            transition:fade|local={{ delay: i * 20 }}
            on:mouseover={() => handleMouseOver(s, 2)}
            on:mouseout={handleMouseOut}
          >
            <rect
              y={y(s.global.d0)}
              width={columnWidth}
              height={y(s.global.d1) - y(s.global.d0)}
              stroke="white"
              stroke-width={0.5}
              fill="var(--color-vis-gender-male)"
            />
            <rect
              y={y(s.global.d0)}
              width={(s.data[2]?.female / (s.data[2]?.female + s.data[2]?.male)) * columnWidth}
              height={y(s.global.d1) - y(s.global.d0)}
              fill="var(--color-vis-gender-female)"
            />
          </g>
        {/each}

        {#if selectedCauseData && selectedCauseData.global.val >= 0.01}
          <g transform="translate({x('global')}, 0)" style="pointer-events: none">
            <rect
              y={y(selectedCauseData.global.d0)}
              width={columnWidth}
              height={y(selectedCauseData.global.d1) - y(selectedCauseData.global.d0)}
              fill="none"
              stroke-width={4}
              stroke="var(--color-vis-red)"
            />
            <text
              x={columnWidth / 2}
              y={y(selectedCauseData.global.d0) + (y(selectedCauseData.global.d1) - y(selectedCauseData.global.d0)) / 2}
              class="label number middle central"
              style:fill="var(--color-vis-red)"
            >
              {f(selectedCauseData.global.val)}
            </text>
          </g>
        {/if}
      {/if}

      {#if activeScene.index >= 1 && selectedRegion}
        <text class:geo={!$isMobile} class="label small stronger middle" x={x('region') + columnWidth / 2} dy={-10}
          >{$_(`region.${selectedRegion}`)}</text
        >
        {#each data2.filter((d) => d.region.val >= 0.01) as s, i}
          <g
            transform="translate({x('region')}, 0)"
            transition:fade|local={{ delay: i * 20 }}
            on:mouseover={() => handleMouseOver(s, 1)}
            on:mouseout={handleMouseOut}
          >
            <rect
              y={y(s.region.d0)}
              width={columnWidth}
              height={y(s.region.d1) - y(s.region.d0)}
              stroke="white"
              stroke-width={0.5}
              fill="var(--color-vis-gender-male)"
            />
            <rect
              y={y(s.region.d0)}
              width={(s.data[1].female / (s.data[1].female + s.data[1].male)) * columnWidth}
              height={y(s.region.d1) - y(s.region.d0)}
              fill="var(--color-vis-gender-female)"
            />
          </g>
        {/each}

        {#if selectedCauseData && selectedCauseData.region.val >= 0.01}
          <g transform="translate({x('region')}, 0)" style="pointer-events: none">
            <rect
              y={y(selectedCauseData.region.d0)}
              width={columnWidth}
              height={y(selectedCauseData.region.d1) - y(selectedCauseData.region.d0)}
              fill="none"
              stroke-width={4}
              stroke="var(--color-vis-red)"
            />

            <text
              x={columnWidth / 2}
              y={y(selectedCauseData.region.d0) + (y(selectedCauseData.region.d1) - y(selectedCauseData.region.d0)) / 2}
              class="label number middle central"
              style:fill="var(--color-vis-red)"
            >
              {f(selectedCauseData.region.val)}
            </text>
          </g>

          {#if selectedCauseData.global.val >= 0.01}
            <path
              d="M{x('global') + columnWidth},{y(selectedCauseData.global.d0)} L{x('region')},{y(selectedCauseData.region.d0)} L{x(
                'region'
              )},{y(selectedCauseData.region.d1)} L{x('global') + columnWidth},{y(selectedCauseData.global.d1)} Z"
              fill="var(--color-vis-red)"
              opacity={0.2}
            />
          {/if}
        {/if}
      {/if}

      {#if activeScene.index >= 2 && selectedCountry !== null}
        <text class:geo={!$isMobile} class="label small stronger middle" x={x('country') + columnWidth / 2} dy={-10}
          >{$_(`country.${selectedCountry.toLowerCase()}`)}</text
        >
        {#each data2.filter((d) => d.country.val >= 0.01) as s, i}
          <g
            transform="translate({x('country')}, 0)"
            transition:fade|local={{ delay: i * 20 }}
            on:mouseover={() => handleMouseOver(s, 0)}
            on:mouseout={handleMouseOut}
          >
            <rect
              y={y(s.country.d0)}
              width={columnWidth}
              height={y(s.country.d1) - y(s.country.d0)}
              stroke="white"
              stroke-width={0.5}
              fill="var(--color-vis-gender-male)"
            />
            <rect
              y={y(s.country.d0)}
              width={(s.data[0].female / (s.data[0].female + s.data[0].male)) * columnWidth}
              height={y(s.country.d1) - y(s.country.d0)}
              fill="var(--color-vis-gender-female)"
            />
          </g>
        {/each}

        {#if selectedCauseData && selectedCauseData.country.val >= 0.01}
          <g transform="translate({x('country')}, 0)" style="pointer-events: none">
            <rect
              y={y(selectedCauseData.country.d0)}
              width={columnWidth}
              height={y(selectedCauseData.country.d1) - y(selectedCauseData.country.d0)}
              fill="none"
              stroke-width={4}
              stroke="var(--color-vis-red)"
            />

            <text
              x={columnWidth / 2}
              y={y(selectedCauseData.country.d0) + (y(selectedCauseData.country.d1) - y(selectedCauseData.country.d0)) / 2}
              class="label number middle central"
              style:fill="var(--color-vis-red)"
            >
              {f(selectedCauseData.country.val)}
            </text>
          </g>
          {#if selectedCauseData.region.val >= 0.01}
            <path
              d="M{x('region') + columnWidth},{y(selectedCauseData.region.d0)} L{x('country')},{y(selectedCauseData.country.d0)} L{x(
                'country'
              )},{y(selectedCauseData.country.d1)} L{x('region') + columnWidth},{y(selectedCauseData.region.d1)} Z"
              fill="var(--color-vis-red)"
              opacity={0.2}
            />
          {/if}
        {/if}
      {/if}
    </g>
  </svg>
</div>
<CategoricalLegend legendType="gender" title={labels.legend_title} />

<Tooltip visible={hoverCause !== undefined} targetPos={mousePos}>
  {#if hoverCause !== undefined}
    <div class="label small">{hoverCause.cause_name}</div>
    {#if false}
      <hr />
      <div class="label small stronger">{hoverCause.geo}</div>
      <div class="label small">
        {@html $_(labels.tooltip_text, {
          values: {
            total_pct: Math.round(1000 * hoverCause.geoPct) / 10,
            cause: hoverCause.cause_name,
            male_pct: Math.round(1000 * hoverCause.malePct) / 10,
            female_pct: Math.round(1000 * hoverCause.femalePct) / 10
          }
        })}
      </div>
    {/if}
  {/if}
</Tooltip>

<style>
  .causes-of-death-scroller {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
