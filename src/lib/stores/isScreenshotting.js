import { readable } from 'svelte/store';
import { browser } from '$app/environment';

const checkScreenshot = (win) => new URL(win?.location).searchParams.get('screenshot') === 'true';

export const isScreenshotting = readable(null /* <- initial value, since we don't have access to window here */, function start(set) {
  if (browser) {
    set(checkScreenshot(window));
  }

  return () => {};
});
