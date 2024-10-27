import {
  DOM__SVELTE_MOUNT_POINT,
  WS__MSG__PING,
  WS__MSG__PONG,
} from '../constants';
import Shell from './components/Shell.svelte';
import initSocket from './utils/socket';


initSocket({
  msgLogLevel: {
    debug: [
      WS__MSG__PING,
      WS__MSG__PONG,
    ],
  },
});

const { route, ...rest } = window.app.props;
new Shell({
  target: document.getElementById(DOM__SVELTE_MOUNT_POINT),
  props: { routeName: route, routeProps: rest },
});

document.body.classList.add('route-loaded');
