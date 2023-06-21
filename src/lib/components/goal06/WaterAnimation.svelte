<script>
  import { range } from 'd3-array';
  export let elapsed;

  const points = range(50);

  function dy(i, elapsed) {
    const offset = i / points.length;
    const amplitude = 20;
    const speed = elapsed * 0.002;

    const wave1 = Math.sin(speed + offset + 0.001 * elapsed) * amplitude;
    const wave2 = -Math.sin(speed + offset * 10) * amplitude * 0.5;
    const wave3 = Math.sin(speed + offset * 20) * amplitude * 0.5;

    return wave1 + wave2 + wave3;
    // return wave3;
  }

  function getPath(elapsed, rnd) {
    return `M 0, 100 ${points.map((i) => ` L ${i * 50}, ${dy(i, elapsed + rnd)}`).join(',')} L 1800, 100 L 0, 100 `;
  }
</script>

<path d={getPath(elapsed, 1234)} fill="#002244" stroke-width="1" opacity={0.6} />
<path d={getPath(elapsed, 324)} fill="#002244" stroke-width="1" opacity={0.6} />
<path d={getPath(elapsed, 14)} fill="#002244" stroke-width="1" opacity={0.6} />
<path d={getPath(elapsed, 140002)} fill="#002244" stroke-width="1" opacity={0.6} />
