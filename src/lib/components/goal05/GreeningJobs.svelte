<script>
  import { _ } from 'svelte-i18n';
  import { pie, arc, scaleLinear, stack, scaleSqrt, max } from 'd3';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { CountryPicker, Number, Factoid, CategoricalLegend } from '$lib/components';
  import { isMobile } from '$lib/stores/isMobile';

  export let activeScene;
  export let data;

  export let green_skill_gap_label = 'Green skills gap';
  export let label_green = 'Green jobs';
  export let label_unaffected = 'Unaffected jobs';
  export let label_change = 'Jobs with changing tasks';
  export let label_retraining = 'Jobs that require retraining';
  export let label_brown = 'Brown jobs';
  export let label_of_jobs = 'of all jobs';
  export let label_overall = 'overall';

  $: w = 0;
  $: h = 0;

  $: pieDimensions = Math.min(450, Math.min(w * 0.9, $isMobile ? h * 0.45 : h * 0.9));
  $: pieDimensionsW = $isMobile ? w * 0.9 : pieDimensions;
  $: pieDimensionsH = pieDimensions;

  const GENDERS = ['female', 'male'];
  const LABELS = {
    green: label_green,
    unaffected: label_unaffected,
    change: label_change,
    retraining: label_retraining,
    brown: label_brown
  };

  const genderColorMap = {
    male: 'var(--color-vis-gender-male)',
    female: 'var(--color-vis-gender-female)',
    rest: 'var(--color-vis-not-available)'
  };

  $: countries = Array.from(new Set(data.map((d) => d.ISO3)));

  $: countriesToRemove = countriesISO.filter((iso) => !countries.includes(iso));
  $: remove = (iso) => countriesToRemove.includes(iso);

  $: countryData = data.filter((d) => d.ISO3 === selectedCountry);
  $: percCountryData = countryData.find((d) => d.type === 'percentage');
  $: absCountryData = countryData.find((d) => d.type === 'absolute');

  $: pieData = GENDERS.map((gender) => ({ gender, value: absCountryData[`${gender} ${activeType}`] }));

  let activeType = 'unaffected';
  $: {
    switch (activeScene.index) {
      case 0:
        activeType = 'brown';
        break;
      case 1:
        activeType = 'green';
        break;
      case 2:
      case 3:
        activeType = 'change';
        break;
      case 4:
        activeType = 'retraining';
        break;
      case 5:
        activeType = 'skill gap';
    }
  }
  $: mode = activeScene.index < 5 ? 'PIE' : 'BAR';

  $: selectedCountry = 'TUR';

  $: arcs = pie().value((d) => d.value)(pieData);
  $: radius = pieDimensions * 0.5;
  $: yScale = scaleLinear()
    .domain([0, max(data.map((d) => max([...GENDERS, 'total'], (dd) => d[`${dd} skill gap`])))])
    .range([pieDimensionsH * 0.9, pieDimensionsH * 0.05]);

  $: BAR_WIDTH = pieDimensions * 0.25;
</script>

<CountryPicker bind:selectedCountry {remove} clear={() => (selectedCountry = 'TUR')} />
<div class="container greening">
  <div class="svg-container" bind:clientWidth={w} bind:clientHeight={h}>
    {#if mode === 'PIE'}
      <svg width={pieDimensionsW} height={pieDimensionsH}>
        <g transform="translate({pieDimensionsW / 2}, {pieDimensionsH / 2})">
          {#each arcs as slice}
            <path
              class:animated={activeScene.index > 0 && activeScene.index < 5}
              d={arc().innerRadius(0).outerRadius(radius)(slice)}
              stroke={Colors.ColorThemeBgWeaker}
              stroke-width={0.5}
              fill={genderColorMap[slice.data.gender]}
            />
          {/each}
          {#each arcs as slice}
            <g
              class:animated={activeScene.index > 0 && activeScene.index < 5}
              transform="translate({arc()
                .innerRadius(0)
                .outerRadius(h / 3)
                .startAngle(slice.startAngle)
                .endAngle(slice.endAngle)
                .centroid()[0]},{arc()
                .innerRadius(0)
                .outerRadius(h / 3)
                .startAngle(slice.startAngle)
                .endAngle(slice.endAngle)
                .centroid()[1]})"
            >
              <text class="label number middle"
                ><Number value={(slice.data.value / absCountryData[`total ${activeType}`]) * 100} digits="1" unit="%" />
                <tspan dx="5" class="label small"> (<Number value={slice.data.value} />)</tspan>
              </text>
              <text class="label category no-stroke middle" y="20"> {slice.data.gender === 'female' ? $_('women') : $_('men')}</text>
            </g>
          {/each}
        </g>
      </svg>
    {:else}
      <svg width={pieDimensions} height={pieDimensions}>
        {#each GENDERS as gender, i}
          <g transform="translate({pieDimensions / 2 - BAR_WIDTH + i * (BAR_WIDTH + 10)}, {0})">
            <rect
              x={0}
              width={BAR_WIDTH}
              y={yScale(percCountryData?.[`${gender} skill gap`])}
              height={pieDimensionsH * 0.7 - yScale(percCountryData?.[`${gender} skill gap`])}
              style:fill={genderColorMap[gender]}
            />
            <text class="label stronger middle" y={yScale(percCountryData?.[`${gender} skill gap`]) - 10} x={BAR_WIDTH / 2}
              ><Number value={percCountryData?.[`${gender} skill gap`]} digits="1" /></text
            >
            <text class="label category middle" y={pieDimensionsH * 0.7 + 20} x={BAR_WIDTH / 2}
              >{gender === 'female' ? $_('women') : $_('men')}</text
            >
          </g>
        {/each}
      </svg>
    {/if}
    {#if mode === 'PIE'}
      <Factoid
        title={LABELS[activeType]}
        number={(percCountryData?.[`total ${activeType}`] * 100).toFixed(1) + '%'}
        label={$isMobile ? '' : label_of_jobs}
        text=""
      />
    {:else}
      <Factoid title={green_skill_gap_label} number={(percCountryData?.[`total ${activeType}`]).toFixed(1)} label={label_overall} text="" />
    {/if}
  </div>
</div>

<style>
  .greening :global(.title) {
    border-top: none;
  }
  .greening :global(.factoid) {
    width: var(--col-4);
    margin: 0;
  }
  .container {
    flex: 1;

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: center;
  }

  .svg-container {
    flex: 1;
    overflow: hidden;
    flex-direction: row;
    flex-wrap: wrap;
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: var(--space-l);
  }

  g.animated,
  path.animated,
  text {
    transition: 0.5s all;
  }

  .factoid-container {
    flex: 0;
    flex-basis: 400px;
    min-width: 400px;

    display: flex;
    align-items: center;
  }
  :global(.factoid-container .factoid) {
    justify-content: center;
  }
</style>
