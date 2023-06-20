<script>
  export let fillColour;
  export let markerID;
  export let reverse;
</script>

<marker id={markerID} markerWidth="4" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
  <polygon points={reverse ? "4 0, 0 3, 4 6, 3 3" : "0 0, 4 3, 0 6, 1 3"} fill={fillColour} stroke="white" stroke-width={0.5} />
</marker>
