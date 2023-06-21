<script>
  import { scaleLinear, path } from 'd3';
  import { Number } from '$lib/components';
  import { isMobile } from '$lib/stores/isMobile';
  import ChartGrid from '../ChartGrid.svelte';

  export let label_reason_financial = '';
  export let label_reason_covid = '';
  export let label_reason_supply = '';
  export let label_reason_other = '';

  export let showFull = false;
  export let forceShowLabels = false;
  export let barColor;
  export let reasonColors;

  export let title;
  export let data;

  export let maxVal;

  export let w;
  export let h;

  const order = ['Financial barriers', 'COVID-19-related reasons', 'Health care supply constraints', 'Other reasons'].reverse();

  const reasonLabels = {
    'Financial barriers': label_reason_financial,
    'COVID-19-related reasons': label_reason_covid,
    'Health care supply constraints': label_reason_supply,
    'Other reasons': label_reason_other
  };

  $: barWidth = $isMobile ? 40 : 140;

  $: margins = {
    top: 50,
    right: 0,
    bottom: 25,
    left: 20
  };

  $: iw = w - margins.left - margins.right;
  $: ih = h - margins.top - margins.bottom;

  let stack;
  let xScale;
  let yScale;
  let areas = [];
  let topLine;
  let forgoneCare;

  $: if (data) {
    forgoneCare = data.find((d) => d.Variable === 'Forgone care');

    yScale = scaleLinear()
      .domain([0, maxVal])
      .range([h - margins.bottom, margins.top]);

    const y20Max = h - margins.bottom - yScale(forgoneCare['2020']);
    const y21Max = h - margins.bottom - yScale(forgoneCare['2021']);

    const sum20 = order.reduce((a, key) => data.find((d) => d.Variable === key)['2020'] + a, 0);
    const sum21 = order.reduce((a, key) => data.find((d) => d.Variable === key)['2021'] + a, 0);

    let y2020 = ih;
    let y2021 = ih;
    stack = [].concat(
      ...order.map((reason) => {
        const d = data.find((d) => d.Variable === reason);
        let prev20 = y2020;
        let prev21 = y2021;
        y2020 -= y20Max * (d['2020'] / sum20);
        y2021 -= y21Max * (d['2021'] / sum21);
        return [
          {
            reason,
            year: 2020,
            value: d['2020'],
            prev: prev20,
            y: y2020
          },
          { reason, year: 2021, value: d['2021'], prev: prev21, y: y2021 }
        ];
      })
    );

    xScale = scaleLinear()
      .domain([2020, 2021])
      .range([0, iw - barWidth]);

    const x20 = xScale(2020) + barWidth;
    const x21 = xScale(2021);
    const xMid = (x21 - x20) / 2 + x20;

    areas = order.map((reason) => {
      const d = stack.filter((d) => d.reason === reason);
      const y20 = d.find((d) => d.year === 2020);
      const y21 = d.find((d) => d.year === 2021);
      //const path = a(stack.filter((d) => d.reason === reason));
      const pathGen = path();
      pathGen.moveTo(x20 - barWidth, y20.y);
      pathGen.lineTo(x20, y20.y);
      pathGen.bezierCurveTo(xMid, y20.y, xMid, y21.y, x21, y21.y);
      pathGen.lineTo(x21 + barWidth, y21.y);

      const areaPathGen = path();
      areaPathGen.moveTo(x20 - barWidth, y20.y);
      areaPathGen.lineTo(x20, y20.y);
      areaPathGen.bezierCurveTo(xMid, y20.y, xMid, y21.y, x21, y21.y);
      areaPathGen.lineTo(x21 + barWidth, y21.y);
      areaPathGen.lineTo(x21 + barWidth, y21.prev);
      areaPathGen.lineTo(x21, y21.prev);
      areaPathGen.bezierCurveTo(xMid, y21.prev, xMid, y20.prev, x20, y20.prev);
      areaPathGen.lineTo(x20 - barWidth, y20.prev);
      areaPathGen.closePath();

      let mid = {
        x: xMid,
        y: (y21.y - y20.prev) / 2 + y20.prev
      };

      return { reason, mid, path: pathGen.toString(), areaPath: areaPathGen.toString() };
    });

    const topLinePG = path();
    topLinePG.moveTo(x20 - barWidth, ih - y20Max);
    topLinePG.lineTo(x20, ih - y20Max);
    topLinePG.bezierCurveTo(xMid, ih - y20Max, xMid, ih - y21Max, x21, ih - y21Max);
    topLinePG.lineTo(x21 + barWidth, ih - y21Max);
    topLine = topLinePG.toString();
  }

  $: activeReason = '';

  $: reasonIsActive = (r) => r === activeReason || forceShowLabels;
</script>

<div class="foregone-care-slope">
  <svg
    width={w}
    height={h}
    on:pointerleave={() => {
      $isMobile ? null : (activeReason = null);
    }}
  >
    <ChartGrid
      gridType="yGrid"
      innerHeight={h - margins.top - margins.bottom}
      innerWidth={w - margins.left - margins.right}
      scale={yScale}
      ticks={[0, 5, 10, 15, 20]}
    />
    {#if $isMobile}
      <text class="title">
        <tspan class="title" x={w / 2} y={11}>{title.split(' ')[0]} </tspan>
        <tspan class="title" x={w / 2} dy={16}>{title.split(' ').slice(1).join(' ')} </tspan>
      </text>
    {:else}
      <text class="title" x={w / 2} y={20}>{title}</text>
    {/if}
    <g style={`transform: translate(${margins.left}px, ${margins.top}px)`}>
      {#each stack as reason}
        <rect
          class:active={!showFull || reasonIsActive(reason.reason)}
          class:full={showFull}
          x={xScale(reason.year)}
          width={barWidth}
          y={reason.y}
          height={reason.prev - reason.y}
          style={`fill: ${showFull ? reasonColors[reason.reason] : barColor}`}
        />
      {/each}
      {#each areas as ar, i}
        <path
          class:active={showFull && reasonIsActive(ar.reason)}
          class:full={showFull}
          d={ar.path}
          style:fill={'none'}
          style:stroke={showFull ? reasonColors[ar.reason] : i === areas.length - 1 ? barColor : 'none'}
          style:stroke-width="1"
        /><path d={ar.areaPath} style:fill="transparent" on:pointerenter={() => (activeReason = ar.reason)} />
      {/each}
      <!-- <path d={topLine} class="topline" />-->

      {#each [2020, 2021] as year}
        <text class={'y' + year + ' axis-label'} x={xScale(year) + ($isMobile ? 0 : barWidth / 2)} y={ih + 15}>{year}</text>
        <text
          class={'y' + year + ' number'}
          x={xScale(year) + ($isMobile ? 0 : barWidth / 2)}
          y={yScale(forgoneCare[year]) - margins.top - 5}><Number value={forgoneCare[year]} unit="%" digits="1" /></text
        >
      {/each}

      {#if showFull}
        {#each stack.filter((d) => reasonIsActive(d.reason)) as reason}
          <text
            class={'y' + reason.year + ' small number'}
            x={xScale(reason.year) + ($isMobile ? 0 : barWidth / 2)}
            y={-(reason.y - reason.prev) / 2 + reason.y + 5}><Number value={reason.value} unit="%" digits="1" /></text
          >
        {/each}

        {#each areas as reason}
          {#if reasonIsActive(reason.reason)}
            {#if $isMobile}
              <text class="reason category small" x={reason.mid.x} y={reason.mid.y}>
                {#each reasonLabels[reason.reason].split(' ') as t, i}
                  <tspan alignment-baseline="baseline" class="category small" x={reason.mid.x} dy={$isMobile ? 16 : 20}>{t}</tspan>
                {/each}
              </text>
            {:else}
              <text class={'reason category small'} x={reason.mid.x} y={reason.mid.y}>{reasonLabels[reason.reason]}</text>
            {/if}
          {/if}
        {/each}
      {/if}
    </g>
  </svg>
</div>

<style>
  rect,
  text {
    pointer-events: none;
    transition: 0.5s fill;
  }

  rect.full,
  path.full {
    stroke: white;
    stroke-width: 1;
    stroke-linecap: round;
  }

  path {
    opacity: 1;
  }
  path.active {
    opacity: 0.7;
  }

  text {
    text-anchor: middle;
  }

  @media screen and (max-width: 872px) {
    text.y2020 {
      text-anchor: start;
    }
    text.y2021 {
      text-anchor: end;
      transform: translate(40px, 0);
    }

    text.reason {
      transform: translate(0, -30px);
    }
  }
</style>
