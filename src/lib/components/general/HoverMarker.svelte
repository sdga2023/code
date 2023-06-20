<script>
  export let x, y, fill;
</script>

<g class="hover-marker">
  <circle cx={x} cy={y} r="6" stroke="white" {fill} stroke-width="4" />
  <circle cx={x} cy={y} r="6" stroke="black" fill="transparent" />
</g>
