import { writable } from 'svelte/store';

export const liveGini = writable({ autopicking: false, pairs: [] });
