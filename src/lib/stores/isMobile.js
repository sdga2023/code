import { readable } from 'svelte/store';
import variables from '$lib/variables';
import { browser } from '$app/environment';

const checkMobile = (win) => win.innerWidth < variables.mobile;

export const isMobile = readable(true /* <- initial value, since we don't have access to window here */, function start(set) {
  if (browser) {
    set(checkMobile(window));

    const resize = () => {
      set(checkMobile(window));
    };

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }
});
