import { readable } from 'svelte/store';
import variables from '$lib/variables';
import { browser } from '$app/environment';

const checkSize = (win) => win.innerWidth <= variables.tablet;

export const isTablet = readable(false /* <- initial value, since we don't have access to window here */, function start(set) {
  if (browser) {
    set(checkSize(window));

    const resize = () => {
      set(checkSize(window));
    };

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }
});
