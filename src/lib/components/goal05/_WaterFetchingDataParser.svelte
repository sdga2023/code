<script>
  import * as Colors from '$lib/styles/tokens.es6';
  import { extent, max } from 'd3-array';
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { area, curveCatmullRom, curveNatural, line } from 'd3-shape';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Tooltip from '../general/Tooltip.svelte';

  export let data;
  export let activeScene;

  export let drought_label = 'Drought';
  export let normal_label = 'Normal';
  export let hours_label = 'sum of hours spent by all people fetching water for ↓';

  let w = 1000;
  let h = 600;

  const margins = {
    top: 15,
    right: 0,
    left: 0,
    bottom: 40
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
    1: 'Boys: Aged 5-12',
    2: 'Boys: Aged 13-18',
    3: 'Girls: Aged 5-12',
    4: 'Girls: Aged 13-18',
    5: 'Men: Aged 19-59',
    6: 'Women: Aged 19-59',
    7: 'Senior: Aged > 60+'
  };

  const availableAges = {
    'Aged 5-12': 'Children (5-12)',
    'Aged 13-18': 'Teenagers (13-18)',
    'Aged 19-59': 'Adults (19-59)',
    All: 'All'
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

  let householdAccessor = (d) => d.HHID;
  let yearAccessor = (d) => d.Year;
  let gaAccessor = (d) => d.Demo_group_Detail;
  let rainfallAccessor = (d) => d.Ln_2012_2002_Categ;
  let valueAccessor = (d) => (d.fetch_water_ga === null ? 0 : d.fetch_water_ga);
  let hhValueAccessor = (d) => d.fetch_water;
  let genderAccessor = (d) => genderAgeGroups[gaAccessor(d)].gender;

  $: allHHids = Array.from(new Set(data.map((d) => householdAccessor(d))));

  $: removeNonWorkers = true; // activeScene.index > 0;
  $: showGenderColors = activeScene.index > 0;
  $: splitUpGenders = activeScene.index > 1;
  $: showDroughtState = selectedDroughtState === '1';
  $: shiftCenter = activeScene.index > 3;

  $: showDroughtControls = activeScene.index > 5;
  $: showAgeGroupControls = activeScene.index > 4;

  let parsedData = [];

  $: if (data) {
    // only use 'Drought' and 'Normal' data:
    parsedData = data.filter((d) => rainfallAccessor(d) === rainfallGroups['Drought'] || rainfallAccessor(d) === rainfallGroups['Normal']);

    // remove seniors
    parsedData = parsedData.filter((d) => gaAccessor(d) !== 7);

    // only use actual households (where individuals' contributions add up to the total household value):
    parsedData = allHHids.reduce((acc, hhid) => {
      const hhData = parsedData.filter((d) => householdAccessor(d) === hhid);
      let isValidHH = true;
      // split by years, check for each year:
      const hhYears = Array.from(new Set(hhData.map((d) => yearAccessor(d))));
      hhYears.forEach((year) => {
        const hhYearData = hhData.filter((d) => yearAccessor(d) === year);
        const hhSum = hhYearData.reduce((akku, value) => akku + valueAccessor(value), 0);

        // doesn't add up. don't use this household:
        if (hhSum !== hhValueAccessor(hhYearData[0])) {
          isValidHH = false;
        }
      });

      if (isValidHH) {
        acc.push(...hhData.map((d) => ({ ...d, hhsize: hhData.filter((dd) => yearAccessor(dd) === yearAccessor(d)).length })));
      }
      return acc;
    }, []);

    // round-down .5 values (0.5 hours, 3.5 hours, 10.5 hours etc.)
    parsedData = parsedData.map((d) => ({ ...d, fetch_water_ga: Math.floor(d.fetch_water_ga) }));
  }

  $: valueRange = Array.from(
    new Set(timeTabularData.filter((d) => d.rainfallGroup === visibleDroughtState && d.total > 0).map((d) => d.hours))
  ).sort((a, b) => a - b);

  $: console.log(valueRange);

  $: visibleDroughtState = showDroughtState ? rainfallGroups['Drought'] : rainfallGroups['Normal'];

  $: averageHours = [rainfallGroups['Normal'], rainfallGroups['Drought']].map((droughtState) => {
    const dat = timeTabularData.filter((d) => d.rainfallGroup === droughtState);

    const totalHoursPerState = dat.reduce((acc, val) => acc + val.hours * val.total, 0);
    const totalPeople = dat.reduce((acc, val) => acc + val.total, 0);

    return totalHoursPerState / totalPeople;
  });

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

  let actualTabularData = [];
  $: timeTabularData = parsedData
    ? (() => {
        actualTabularData = 'rainfallGroup, hours, total, 1, 2, 3, 4, 5, 6';

        let result = [];
        const valueRanges = Array.from(new Set(parsedData.map((d) => valueAccessor(d)))).sort((a, b) => a - b);

        [1, 3].forEach((rainfallGroup) => {
          valueRanges.forEach((timeSpent) => {
            let entry = { rainfallGroup, hours: timeSpent };
            let total = 0;
            Object.keys(genderAgeGroups).forEach((ga) => {
              const gaValue = parsedData.filter(
                (d) => rainfallAccessor(d) === rainfallGroup && +gaAccessor(d) === +ga && valueAccessor(d) === timeSpent
              ).length;
              entry[ga] = gaValue;
              total += gaValue;
            });

            entry.total = total;
            result.push(entry);

            actualTabularData +=
              '\n' + [rainfallGroup, timeSpent, total, entry[1], entry[2], entry[3], entry[4], entry[5], entry[6]].join(',');
          });
        });

        console.log(actualTabularData);
        return result;
      })()
    : [];

  $: console.log(timeTabularData);

  $: x = scaleLinear()
    .domain([0, 1])
    .range(shiftCenter ? [0.25 * w, 0.75 * w] : [0.15 * w, 0.85 * w]);
  $: yRange = [0, (showDroughtState ? h : h * (averageHours[0] / averageHours[1])) - margins.top - margins.bottom];
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
    if (!selectedAge && activeScene.id === 'teenage-girls') {
      selectedAge = 'Aged 13-18';
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

<p class="title centered">
  {#if !showDroughtControls}
    {visibleDroughtState === 1 ? drought_label : normal_label}
  {:else}
    <input type="radio" name="droughtState" value="3" id="Normal" bind:group={selectedDroughtState} /><label for="Normal"
      >Normal conditions</label
    >
    <input type="radio" name="droughtState" value="1" id="Drought" bind:group={selectedDroughtState} /><label for="Drought">Drought</label>
  {/if}
  <br />
  {#if showAgeGroupControls}
    {#each Object.keys(availableAges) as ageGroup}
      <input type="radio" name="age" value={ageGroup} id={ageGroup} bind:group={selectedAge} /><label for={ageGroup}
        >{availableAges[ageGroup]}</label
      >
    {/each}
  {:else}
    <br />
  {/if}
</p>

<div class="container" bind:clientWidth={w} bind:clientHeight={h}>
  <svg class="stacked-area" width={w} height={h} on:mouseout={() => (hoverData = null)} on:blur={() => (hoverData = null)}>
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
            style:opacity={hoverData?.id === timeSpent + '-' + visibleDroughtState ? 0.5 : 0}
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

      <!-- labels: -->
      {#each yTicks.filter((d) => d) as timeSpent, i (timeSpent)}
        <g class="timespent" transform={`translate(${w}, ${y(timeData[timeSpent].y + timeData[timeSpent].height)})`}>
          <line x1={-w} x2={0} y1={0} y2={0} stroke="var(--color-grey-200)" style:stroke-width="0.5" />
          <text
            class="end"
            y={-(y(timeData[timeSpent].y) - y(timeData[yTicks[Math.max(i, 0)]].y + timeData[yTicks[Math.max(i, 0)]].height)) / 2}
          >
            <!--<tspan class="small weaker">people spending</tspan>-->
            <tspan class="small stronger" x="0" dy="0em">{yTicks[Math.max(i, 0)] + 1} - {timeSpent} h/week</tspan></text
          >
        </g>
      {/each}

      <!-- axes: -->
      <g transform="translate({x(0.5)},{h - margins.bottom + 5})">
        <line x1={0} x2={0} y1={0} y2={-h} stroke="white" stroke-width="2" />
        <text class="small middle">{shiftCenter ? '0%' : '50%'}</text>
      </g>
      <g transform="translate({x(0.0)},{h - margins.bottom + 5})">
        <line x1={0} x2={0} y1={0} y2={-h} stroke="white" stroke-width="2" />
        <text class="small middle">{shiftCenter ? '50%' : '0%'}</text>
      </g>
      <g transform="translate({x(1)},{h - margins.bottom + 5})">
        <line x1={0} x2={0} y1={0} y2={-h} stroke="white" stroke-width="2" />
        <text class="small middle">{shiftCenter ? '50%' : '100%'}</text>
      </g>
      {#if shiftCenter}
        <text class="small start" transform="translate({0},{h - margins.bottom + 5})">← work done by women</text>
        <text class="small end" transform="translate({w},{h - margins.bottom + 5})">work done by men →</text>
      {/if}

      <text class="small end" x={w - 10} y={-5}>{hours_label}</text>

      {#if !shiftCenter}
        <text text-anchor="middle" transform="translate({x(0) - 5},{yRange[1] / 2}) rotate(-90)">total amount of hours</text>
      {/if}
    </g>
  </svg>
  {#if hoverData}
    <Tooltip visible={true} targetPos={hoverPos}>
      <p>
        {hoverData.total} people spent {hoverData.timeSpent} hours each per week fetching water during {hoverData.drought === 1
          ? 'droughts'
          : 'normal times'}.
      </p>
      {#if showGenderColors}
        <ul>
          {#each gaOrder as ga}
            <li class="label small">
              <div
                style:background-color={colorMap[ga]}
                style:width={hoverData[ga].width * 200 + 'px'}
                style:margin-left={100 - hoverData[ga].width * 200 + 'px'}
                style="height:10px; display: inline-block;"
              />
              {genderAgeLabels[ga]}: {hoverData[ga].total} ({(hoverData[ga].width * 100).toFixed(1)}%)
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
  .container {
    flex: 1;
    overflow: hidden;
  }

  rect,
  path,
  line {
    transition: all 1.5s, fill 2.5s;
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
