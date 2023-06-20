<script>
  import * as Colors from '$lib/styles/tokens.es6';
  import { extent, max } from 'd3-array';
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { area, curveCatmullRom, curveNatural, line } from 'd3-shape';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let activeScene;

  export let drought_label = 'Drought';
  export let normal_label = 'Normal Weather';
  export let hours_label = 'sum of hours spent by all people fetching water for';
  export let label_work_women = 'work done by women';
  export let label_work_men = 'work done by men';
  export let label_total_hours = 'total number of hours';
  export let label_total_hours_long = 'total number of hours spent by people who spend up to 10h per week fetching water';
  export let label_tooltip = 'each per week fetching water during';
  export let label_spent = 'spent';
  export let label_teenagers = 'Teenagers';
  export let label_children = 'Children';
  export let label_adults = 'Adults';
  export let label_all = 'All';
  export let label_gender_age_1 = 'Boys (age 5-12)';
  export let label_gender_age_2 = 'Boys (age 13-18)';
  export let label_gender_age_3 = 'Girls (age 5-12)';
  export let label_gender_age_4 = 'Girls (age 13-18)';
  export let label_gender_age_5 = 'Men (age 19-59)';
  export let label_gender_age_6 = 'Women (age 19-59)';
  export let label_gender_age_7 = 'Senior (aged 60+)';

  let w = 1000;
  let h = 600;

  const margins = {
    top: 15,
    right: 0,
    left: 0,
    bottom: 24
  };

  const genderAgeGroups = {
    3: { gender: 0, age: [5, 12] },
    4: { gender: 0, age: [13, 18] },
    6: { gender: 0, age: [19, 59] },
    5: { gender: 1, age: [19, 59] },
    2: { gender: 1, age: [13, 18] },
    1: { gender: 1, age: [5, 12] }
  };

  const genderAgeLabels = {
    1: label_gender_age_1,
    2: label_gender_age_2,
    3: label_gender_age_3,
    4: label_gender_age_4,
    5: label_gender_age_5,
    6: label_gender_age_6,
    7: label_gender_age_7
  };

  const availableAges = {
    'Aged 5-12': label_children,
    'Aged 13-18': label_teenagers,
    'Aged 19-59': label_adults,
    All: label_all
  };

  let gaOrder = [3, 4, 6, 5, 2, 1];
  let gaCenter = 5;
  //$: gaLeft = gaOrder.filter((ga) => gaOrder.indexOf(ga) < gaOrder.indexOf(gaCenter));
  let gaActive = [1, 2, 3, 4, 5, 6];

  $: gaOrder =
    !selectedAge || selectedAge === 'Aged 19-59' || selectedAge === 'All'
      ? [3, 4, 6, 5, 2, 1]
      : selectedAge === 'Aged 13-18'
      ? [3, 6, 4, 2, 5, 1]
      : [4, 6, 3, 1, 5, 2];

  $: gaCenter = gaOrder[3];
  $: gaActive = !selectedAge || selectedAge === 'All' ? [1, 2, 3, 4, 5, 6] : [gaOrder[2], gaOrder[3]];

  $: colorMap = !showGenderColors
    ? {
        1: Colors.ColorVisBlue,
        2: Colors.ColorVisBlue,
        3: Colors.ColorVisBlue,
        4: Colors.ColorVisBlue,
        5: Colors.ColorVisBlue,
        6: Colors.ColorVisBlue,
        7: Colors.ColorVisBlue
      }
    : splitUpGenders
    ? {
        1: gaActive.includes(1) ? Colors.ColorBasePurple200 : Colors.ColorBasePurple300 + '50',
        2: gaActive.includes(2) ? Colors.ColorBasePurple300 : Colors.ColorBasePurple300 + '50',
        3: gaActive.includes(3) ? Colors.ColorBaseYellow200 : Colors.ColorBaseYellow200 + '50',
        4: gaActive.includes(4) ? Colors.ColorBaseYellow300 : Colors.ColorBaseYellow200 + '50',
        5: gaActive.includes(5) ? Colors.ColorBasePurple500 : Colors.ColorBasePurple300 + '50',
        6: gaActive.includes(6) ? Colors.ColorBaseYellow400 : Colors.ColorBaseYellow200 + '50',
        7: gaActive.includes(7) ? '#666666' : '#888888aa'
      }
    : {
        1: Colors.ColorBasePurple300,
        2: Colors.ColorBasePurple300,
        3: Colors.ColorBaseYellow200,
        4: Colors.ColorBaseYellow200,
        5: Colors.ColorBasePurple300,
        6: Colors.ColorBaseYellow200,
        7: '#666666'
      };

  $: legendItems = gaOrder.map((ga) => ({
    key: genderAgeLabels[ga],
    colour: colorMap[ga]
  }));

  const rainfallColorMap = {
    5: Colors.ColorBaseBlue500,
    4: Colors.ColorBaseBlue300,
    3: Colors.ColorBaseBlue100,
    2: Colors.ColorBaseRed300,
    1: Colors.ColorBaseRed500
  };

  const rainfallGroups = {
    Drought: 1,
    'Moderate Scarcity': 2,
    Normal: 3,
    'Moderate Abundance': 4,
    Abundance: 5
  };

  $: removeNonWorkers = true; // activeScene.index > 0;
  $: showGenderColors = activeScene.index > 0;
  $: splitUpGenders = activeScene.index > 1;
  $: showDroughtState = selectedDroughtState === '1';
  $: shiftCenter = activeScene.index > 3;

  $: showDroughtControls = activeScene.index > 4;
  $: showAgeGroupControls = activeScene.index > 4;

  $: timeTabularData = data;

  $: valueRange = Array.from(
    new Set(timeTabularData.filter((d) => d.rainfallGroup === visibleDroughtState && d.total > 0).map((d) => d.hours))
  ).sort((a, b) => a - b);

  $: visibleDroughtState = showDroughtState ? rainfallGroups['Drought'] : rainfallGroups['Normal'];

  /*
  $: averageHours = [rainfallGroups['Normal'], rainfallGroups['Drought']].map((droughtState) => {
    const dat = timeTabularData.filter((d) => d.rainfallGroup === droughtState);

    const totalHoursPerState = dat.reduce((acc, val) => acc + val.hours * val.total, 0);
    const totalPeople = dat.reduce((acc, val) => acc + val.total, 0);

    return totalHoursPerState / totalPeople;
  });
  */

  $: timeData = (() => {
    let y = 0;
    let result = valueRange.reduce((acc, timeSpent) => {
      const dat = timeTabularData.find((d) => d.rainfallGroup === visibleDroughtState && d.hours === timeSpent);

      const total = dat.total;

      let x = 0;
      const gas = gaOrder.reduce((a, ga) => {
        if (total > 0) {
          a[ga] = { total: dat[ga] };
          a[ga].x = x;

          x += a[ga].total / total;

          a[ga].width = x - a[ga].x;
        } else {
          a[ga] = { total: 0, x: 0, width: 0 };
        }
        return a;
      }, {});

      let horizontalCenter = gas[gaCenter].x;
      const horizontalOffset = shiftCenter ? horizontalCenter - 0.5 : 0;

      acc[timeSpent] = {
        total,
        ...gas,
        y,
        horizontalOffset
      };

      y +=
        (total * Math.max(removeNonWorkers ? 0 : 0.2, timeSpent)) /
        timeTabularData.filter((d) => d.hours && d.rainfallGroup === visibleDroughtState).reduce((a, v) => a + v.total * v.hours, 0);

      //y += 1 / 26;
      acc[timeSpent].height = y - acc[timeSpent].y;
      return acc;
    }, {});
    return result;
  })();

  $: x = scaleLinear()
    .domain([0, 1])
    .range(shiftCenter ? [0.25 * w, 0.75 * w] : [0.05 * w, 0.95 * w]);
  $: yRange = [0, h - margins.top - margins.bottom]; // (showDroughtState ? h : h * (averageHours[0] / averageHours[1])) - margins.top - margins.bottom];
  $: y = scaleLinear().domain([0, 1]).range(yRange);

  $: yLabelScale = scaleLinear().domain([0, max(valueRange)]);
  $: yTicks = yLabelScale.ticks(5);

  let hoverPos;
  let hoverData;
  function hover(evt, timeSpent, drought) {
    hoverPos = { x: evt.clientX, y: evt.clientY };

    hoverData = { id: timeSpent + '-' + drought, timeSpent, drought, ...timeData[timeSpent] };
  }

  const areaGen = area()
    .x0((d) => x(d.x - d.horizontalOffset))
    .x1((d) => x(d.x + d.width - d.horizontalOffset))
    .y((d) => y(d.y))
    .curve(curveCatmullRom);

  const lineGen = line()
    .x((d) => x(d.x - d.horizontalOffset))
    .y((d) => y(d.y))
    .curve(curveCatmullRom);

  let areaData = [];
  $: {
    // dependency:
    h;

    areaData = gaOrder.map((ga) =>
      Object.keys(timeData)
        .sort((a, b) => a - b)
        .map((timeSpent) => {
          let result = {};
          result.x = timeData[timeSpent][ga].x;
          result.width = timeData[timeSpent][ga].width;
          result.y = timeData[timeSpent].y + timeData[timeSpent].height / 2;
          result.horizontalOffset = timeData[timeSpent].horizontalOffset;
          result.ga = ga;
          result.timeSpent = timeSpent;

          return result;
        })
    );
  }

  $: centerLineData = areaData[gaOrder.indexOf(gaCenter)];

  let selectedAge;
  $: {
    if (!selectedAge && activeScene.id === 'conclusion') {
      selectedAge = 'All';
    }
    if (!showAgeGroupControls) {
      selectedAge = null;
    }
  }

  let selectedDroughtState = 3;
  $: {
    if (!showDroughtControls) {
      selectedDroughtState = activeScene.index < 3 ? '3' : '1';
    }
  }

  /* fetch_water is the time spent on fetching water at the household level
fetch_water_ga is the time spent on fetching water by gender-age group
The Demo_group_detail indicator identifies the gender-age groups. I removed the labels. 
Here is the match: 1 = "Boys: Aged 5-12" 2 = "Boys: Aged 13-18" 3 = "Girls: Aged 5-12" 4 = "Girls: Aged 13-18" 5 = "Men: Aged 19-59" 6 = "Women: Aged 19-59" 7 = "Senior: Aged > 60+"
The indicator Ln_2012_2002_Categ identifies category of rainfall. Here are the groups: 5 = "Abundance" 4 = `" "Moderate Abundance" "' 3 = "Normal" 2 = "Moderate  Scarcity"  1 = "Drought" */
</script>

<div class="radio-container" class:hidden={!showAgeGroupControls}>
  {#each Object.keys(availableAges) as ageGroup}
    <input type="radio" name="age" value={ageGroup} id={ageGroup} bind:group={selectedAge} /><label for={ageGroup}
      >{availableAges[ageGroup]}</label
    >
  {/each}
</div>

{#if !showDroughtControls}
  <p class="label stronger small centered radio-container">
    {visibleDroughtState === 1 ? drought_label : normal_label}
  </p>
{:else}
  <div class="radio-container">
    <input type="radio" name="droughtState" value="3" id="Normal" bind:group={selectedDroughtState} /><label for="Normal"
      >{normal_label}</label
    >
    <input type="radio" name="droughtState" value="1" id="Drought" bind:group={selectedDroughtState} /><label for="Drought"
      >{drought_label}</label
    >
  </div>
{/if}

<div class="container" bind:clientWidth={w} bind:clientHeight={h}>
  <svg class="stacked-area" width={w} height={h} on:mouseout={() => (hoverData = null)} on:blur={() => (hoverData = null)}>
    <defs>
      <marker id="arrowhead-down" markerWidth="10" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <polygon points="0 0, 7 3.5, 0 7" fill={Colors.ColorThemeDarkText} />
      </marker>
      <marker id="arrowhead-up" markerWidth="7" markerHeight="7" refX="0" refY="3.5" orient="auto">
        <polygon points="7 0, 0 3.5, 7 7" fill={Colors.ColorThemeDarkText} />
      </marker>
    </defs>
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      {#each gaOrder as ga, i}
        <path d={areaGen(areaData[i])} fill={colorMap[ga]} style:stroke={splitUpGenders ? '' : colorMap[ga]} />
      {/each}
      {#each valueRange as timeSpent, i}
        <g>
          <rect
            class="interactive-box"
            x={x(-1)}
            y={y(timeData[timeSpent].y)}
            width={x(2) - x(-1)}
            height={y(timeData[timeSpent].height)}
            fill="white"
            style:opacity={hoverData?.id === timeSpent + '-' + visibleDroughtState ? 0.5 : !showGenderColors && timeSpent <= 10 ? 0.2 : 0}
            on:mouseover={(e) => hover(e, timeSpent, visibleDroughtState)}
            on:mousemove={(e) => hover(e, timeSpent, visibleDroughtState)}
            on:focus={(e) => hover(e, timeSpent, visibleDroughtState)}
          />
        </g>
      {/each}

      <!-- percentage separator lines: -->
      {#if showGenderColors}
        <path class="center-line" d={lineGen(centerLineData)} />
      {/if}

      <!-- axes: -->
      <g transform="translate({x(0.0)},{h - margins.bottom + 5})">
        <line x1={0} x2={0} y1={0} y2={-h} style:stroke="var(--color-theme-bg-weaker)" stroke-width="2" />
        <text class="small middle">{shiftCenter ? ($isMobile ? '' : '50%') : '0%'}</text>
      </g>
      <g transform="translate({x(0.5)},{h - margins.bottom + 5})">
        <line x1={0} x2={0} y1={0} y2={-h} style:stroke="var(--color-theme-bg-weaker)" stroke-width={!showGenderColors ? 0 : 2} />
        <text class="small middle">{shiftCenter ? '0%' : '50%'}</text>
      </g>
      <g transform="translate({x(1)},{h - margins.bottom + 5})">
        <line x1={0} x2={0} y1={0} y2={-h} style:stroke="var(--color-theme-bg-weaker)" stroke-width="2" />
        <text class="small middle">{shiftCenter ? ($isMobile ? '' : '50%') : '100%'}</text>
      </g>

      <!-- labels: -->
      {#each yTicks.filter((d) => d) as timeSpent, i (timeSpent)}
        <g class="timespent" transform={`translate(${w}, ${y(timeData[timeSpent].y + timeData[timeSpent].height)})`}>
          <line x1={-w} x2={0} y1={0} y2={0} stroke={'var(--color-theme-bg-weaker)'} style:stroke-width={showGenderColors ? 0.5 : 4} />
          <text
            class="end"
            y={-(y(timeData[timeSpent].y) - y(timeData[yTicks[Math.max(i, 0)]].y + timeData[yTicks[Math.max(i, 0)]].height)) / 2}
          >
            <!--<tspan class="small weaker">people spending</tspan>-->
            <tspan class="small stronger" x="0" dy="0em">{yTicks[Math.max(i, 0)] + 1} - {timeSpent} h/week</tspan></text
          >
        </g>
      {/each}

      {#if shiftCenter}
        <text class="small start" transform="translate({0},{h - margins.bottom + 5})">← {label_work_women}</text>
        <text class="small end" transform="translate({w},{h - margins.bottom + 5})">{label_work_men} →</text>
      {/if}

      <text class="small end" x={w - 10} y={-5}>{hours_label} ↓</text>

      {#if !shiftCenter}
        <text text-anchor="middle" transform="translate({x(0) - 5},{yRange[1] / 2}) rotate(-90)">{label_total_hours}</text>
      {/if}
      {#if !showGenderColors}
        <line
          x1={x(0) + 8}
          x2={x(0) + 8}
          y1={0}
          y2={y(timeData[11].y) - 5}
          stroke="#ffffff"
          stroke-width={2}
          marker-start={'url(#arrowhead-up)'}
          marker-end={'url(#arrowhead-down)'}
        />
        <foreignObject x={x(0) + 14} y={$isMobile ? 10 : 30} width={w / 2} height={1000}>
          <p class="label white">{label_total_hours_long}</p></foreignObject
        >
      {/if}
    </g>
  </svg>
  {#if hoverData}
    <Tooltip visible={true} targetPos={hoverPos}>
      <p>
        <span class="label stronger">{hoverData.total} {$_('people', { default: 'people' })}</span>
        {label_spent} <span class="label stronger">{hoverData.timeSpent} {$_('hours', { default: 'hours' })}</span>
        {label_tooltip}
        {hoverData.drought === 1 ? drought_label.toLowerCase() : normal_label.toLowerCase()}.
      </p>

      {#if showGenderColors && !$isMobile}
        <hr />
        <ul>
          {#each gaOrder as ga}
            <li class="label small">
              <p style="display: inline-block; width:180px">
                {genderAgeLabels[ga]}: <span class="label small stronger">{(hoverData[ga].width * 100).toFixed(1)}%</span>
              </p>
              <div
                style:background-color={colorMap[ga]}
                style:width={hoverData[ga].width * 200 + 'px'}
                style:margin-right={100 - hoverData[ga].width * 200 + 'px'}
                style="height:10px; display: inline-block;"
              />
            </li>
          {/each}
        </ul>
      {/if}
    </Tooltip>
  {/if}
</div>

{#if splitUpGenders}
  <CategoricalLegend hidden={!showGenderColors} legendType="custom" customItems={legendItems} />
{:else}
  <CategoricalLegend hidden={!showGenderColors} legendType="gender" />
{/if}

<style>
  .hidden {
    opacity: 0;
    pointer-events: none;
  }
  .container {
    flex: 1;
    overflow: hidden;
  }
  .radio-container {
    display: flex;
    justify-content: center;
    gap: var(--space-2xs);
    margin-bottom: var(--space-xs);
  }
  .radio-container label {
    padding-right: var(--space-s);
    font-weight: var(--font-weights-semibold);
    font-size: var(--font-size-s);
  }

  rect,
  path,
  line {
    transition: all 1s, fill 1.5s;
  }
  rect.interactive-box {
    transition: none;
  }
  g,
  text {
    transition: all 1.5s;
  }

  path.center-line {
    stroke-width: 2px;
    fill: none;
    stroke: var(--color-theme-bg-weaker);
  }

  path,
  line {
    pointer-events: none;
  }
</style>
