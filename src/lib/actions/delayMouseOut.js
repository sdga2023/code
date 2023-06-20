/**
 * Action that can delay the execution of the callback. This can make interaction a bit smoother because a mouseout is not directly triggered.
 *
 * Usage: `<div use:delayMouseOut={{ delay: 500, callback: () => console.log("do something")}}>...</div>`
 */
export const delayMouseOut = (node, params) => {
  node.onmouseout = () => setTimeout(() => params.callback(), params.delay);
};
