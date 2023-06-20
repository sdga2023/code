<script>
  export let width;
  export let height;
  export let className = 'svg';
  export let margins = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  export let w = width - margins.left - margins.right;
  export let h = height - margins.top - margins.bottom;

  let mousePosition = { x: 0, y: 0 };
</script>

<div class="svg-container" bind:clientHeight={h} bind:clientWidth={w}>
  <svg width={w} height={h} class={className} on:mousemove={(e) => (mousePosition = { x: e.clientX, y: e.clientY })}>
    <g transform="translate({margins.left}, {margins.top})">
      <slot {mousePosition} {w} {h} {margins} />
    </g>
  </svg>
</div>
