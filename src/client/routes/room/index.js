import mountRoute from '../mountRoute';
import Room from './Room.svelte';

mountRoute(Room, { ...window.app.params });
