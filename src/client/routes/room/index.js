import mountRoute from '../mountRoute';
import Room from './components/Room.svelte';

mountRoute(Room, { ...window.app.params });
