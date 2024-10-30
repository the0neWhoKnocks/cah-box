import { writable } from 'svelte/store';
import { APP__TITLE } from '../constants';

export let gameFocused = writable(false);
export let title = writable(APP__TITLE);
export let titleSuffix = writable('');
