import { DOM__SVELTE_MOUNT_POINT } from '../../constants';

window.socketConnected = new Promise((resolve) => {
  window.socket = window.io();
  window.socket.on('connect', () => { resolve(); });
});

// NOTE - Webpack@4 doesn't have `iife` support yet, so this boilerplate is required.
const mountRoute = (Route, props = {}) => {
  new Route({
    target: document.getElementById(DOM__SVELTE_MOUNT_POINT),
    props,
  });

  document.body.classList.add('route-loaded');
}
export default mountRoute;
