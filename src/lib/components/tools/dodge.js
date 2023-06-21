import { range } from 'd3';

// From https://observablehq.com/@d3/beeswarm
// Given an array of x-values and a separation radius, returns an array of y-values.
export default function (X, radius) {
  const Y = new Float64Array(X.length);
  const radius2 = radius ** 2;
  const epsilon = 1e-3;
  let head = null,
    tail = null;

  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x, y) {
    let a = head;
    while (a) {
      const ai = a.index;
      if (radius2 - epsilon > (X[ai] - x) ** 2 + (Y[ai] - y) ** 2) return true;
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const bi of range(X.length).sort((i, j) => X[i] - X[j])) {
    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && X[head.index] < X[bi] - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(X[bi], (Y[bi] = 0))) {
      let a = head;
      Y[bi] = Infinity;
      do {
        const ai = a.index;
        let y = Y[ai] + Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
        if (y < Y[bi] && !intersects(X[bi], y)) Y[bi] = y;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    const b = { index: bi, next: null };
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

  return Y;
}
