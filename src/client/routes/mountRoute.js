import {
  DOM__SVELTE_MOUNT_POINT,
  WS__MSG__PING,
  WS__MSG__PONG,
} from '../../constants';
import initSocket from '../utils/socket';
import Shell from './Shell.svelte';

initSocket({
  msgLogLevel: {
    debug: [
      WS__MSG__PING,
      WS__MSG__PONG,
    ],
  },
});

// TODO: running 5 now, so update this.
// NOTE - Webpack@4 doesn't have `iife` support yet, so this boilerplate is required.
const mountRoute = (Route, props = {}) => {
  new Shell({
    target: document.getElementById(DOM__SVELTE_MOUNT_POINT),
    props: {
      Route,
      routeProps: props,
    },
  });
  
  document.body.classList.add('route-loaded');
}
export default mountRoute;
