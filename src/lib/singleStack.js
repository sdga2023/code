function constant(x) {
  return function () {
    return x;
  };
}

export default function () {
  let padding = constant(0);
  let height = constant(400);

  function singleStack(data, key) {
    const total = data.reduce((acc, d) => acc + d[key], 0);
    const totalPadding = (data.length - 1) * padding();

    return data.reduce((acc, d, i) => {
      if (i === 0) {
        acc.push({ y0: 0, y1: (d[key] / total) * (height() - totalPadding), data: d });
      } else {
        acc.push({
          y0: acc[i - 1].y1 + padding(),
          y1: acc[i - 1].y1 + padding() + (d[key] / total) * (height() - totalPadding),
          data: d
        });
      }

      return acc;
    }, []);
  }

  singleStack.padding = function (_) {
    return arguments.length ? ((padding = typeof _ === 'function' ? _ : constant(_)), singleStack) : padding;
  };

  singleStack.height = function (_) {
    return arguments.length ? ((height = typeof _ === 'function' ? _ : constant(_)), singleStack) : height;
  };

  return singleStack;
}
