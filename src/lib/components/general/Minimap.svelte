<script>
	export let minimapH
	export let minimapW
	export let visiblePartShare
	export let widthRatio
	export let visiblePartX
	
	$: minimapInsetW = minimapW*visiblePartShare
	$: minimapInsetH = minimapH
		
	// Initially, center the visible part
	$: minimapInsetX = minimapW/2 - minimapInsetW/2
	$: visiblePartX = minimapInsetX * widthRatio
	
  let dragging = false;
	// xDiff is the horizontal distance between the center of the minimapInset and the clicked location for dragging
	let xDiff = 0;
  function onMouseDown(e) {
    dragging = true;
	xDiff = e.clientX - (minimapInsetX + minimapInsetW/2)
  }
  function onTouchStart(e) {
    dragging = true;
	xDiff = e.touches[0].clientX - (minimapInsetX + minimapInsetW/2)
  }

  function onTouchMove(e) {
    if (dragging) {
		let newX = e.touches[0].clientX - minimapInsetW/2 - xDiff
		minimapInsetX = newX < 0
			? 0
			: newX > minimapW - minimapInsetW 
				? minimapW - minimapInsetW
				: newX
    }
  }

  function onMouseMove(e) {
    if (dragging) {
		let newX = e.clientX - minimapInsetW/2 - xDiff
		minimapInsetX = newX < 0
			? 0
			: newX > minimapW - minimapInsetW 
				? minimapW - minimapInsetW
				: newX
    }
  }

  function onMouseUp() {
    dragging = false;
  }
</script>

<div class="minimap-container">
<svg width={minimapW} height={minimapH}>
	<rect class={'minimap-background'} x={0} y={0} width={minimapW} height={minimapH}/>
	<slot></slot>
	<rect
        class={'minimap-inset'}
        x={minimapInsetX} y={0}
        width={minimapInsetW}
        height={minimapInsetH}
        on:mousedown={onMouseDown}
        on:touchstart={onTouchStart}
        style:cursor={dragging ? "grabbing" : "grab"}>
    </rect>

	{#if minimapInsetX > 1}
	<g transform={`translate(${minimapInsetX - 14}, ${minimapInsetH/2})`}>
		<polygon
		class={'triangle'}
		points={"0,0 10,6 10,-6 0,0"}
	></polygon>
	</g>
	{/if}

	{#if minimapInsetX + minimapInsetW + 1 < minimapW}
	<g transform={`translate(${minimapInsetX + minimapInsetW + 4}, ${minimapInsetH/2})`}>
		<polygon
		class={'triangle'}
		points={"0,6 10,0 0,-6 0,6"}
	></polygon>
	</g>
	{/if}

</svg>
</div>
<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} on:touchend={onMouseUp} on:touchmove={onTouchMove}/>

<style>
    .minimap-container {
        padding: 2px;
    }
    svg {
        margin: auto;
        overflow: visible;
    }
	.minimap-background {
		stroke: black;
		stroke-width: 1;
		fill: none;
	}
	.minimap-inset {
		stroke: var(--color-reference-country);
		stroke-width: 3px;
        fill: none;
	}
	.triangle {
		fill: var(--color-reference-country);
		stroke: white;
		stroke-width: 1px;
	}
</style>