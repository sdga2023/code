<script>
  import { scaleLinear, max, line } from 'd3';

  export let data = [];
  export let labels = {};

  const margin = {
    top: 40,
    right: 20,
    bottom: 20,
    left: 20
  };

  const variables = ['population', 'agriculture', 'industries', 'municipalities'];

  let width = 0;
  const height = 400;

  $: w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  $: x = scaleLinear()
    .domain([1960, 2018])
    .range([0, w / 5]);

  const getIncrease = (variable, d) => (d[variable] - data[0][variable]) / data[0][variable];

  $: y = scaleLinear()
    .domain([0, max(data || [], (d) => max(variables.map((v) => getIncrease(v, d))))])
    .range([h, 0]);

  const gap = 50;
  $: subChartWidth = w / variables.length - gap;
</script>

{#if data && data.length > 0}
  <div class="chart" bind:clientWidth={width}>
    <svg {width} {height}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g transform="translate({margin.left}, {margin.top})">
        {#each variables as variable, j}
          {@const l = line()
            .x((d) => x(d.year))
            .y((d) => y(getIncrease(variable, d)))}
          <g transform="translate({j * subChartWidth + j * gap}, 0)">
            <line x1={0} x2={subChartWidth} y1={y(0)} y2={y(0)} stroke="var(--color-grey-200)" />
            <text dy={-20} style="font-size: var(--font-size-m);">{labels[variable]}</text>
            <path d={l(data)} fill="none" stroke={j === 0 ? 'var(--color-base-red400)' : 'var(--color-base-blue400)'} stroke-width={2} />
            {#each data as d, i}
              <line x1={x(d.year)} x2={x(d.year)} y1={y(0)} y2={y(0) + 5} stroke="var(--color-grey-200)" />
              <circle
                fill={j === 0 ? 'var(--color-base-red400)' : 'var(--color-base-blue400)'}
                cx={x(d.year)}
                cy={y(getIncrease(variable, d))}
                r={i === 0 || i === data.length - 1 ? 5 : 2}
              />
              {#if i === data.length - 1}
                <line
                  x1={x(d.year)}
                  y1={y(0)}
                  x2={x(d.year)}
                  y2={y(getIncrease(variable, d)) + 7}
                  stroke="black"
                  stroke-dasharray="2 2"
                  marker-end="url(#arrow)"
                />
                <text style="font-size: var(--font-size-m);" dx={5} x={x(d.year)} y={y(getIncrease(variable, d) / 2)}
                  >+{Math.round((100 * (d[variable] - data[0][variable])) / data[0][variable])}%</text
                >
              {/if}
              {#if i === data.length - 1 || i === 0}
                <text style="text-anchor: middle; font-size: var(--font-size-s);" dy={20} y={y(0)} x={x(d.year)}>{d.year}</text>
              {/if}
            {/each}
          </g>
        {/each}
      </g>
    </svg>
  </div>
{/if}
