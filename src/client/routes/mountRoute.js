import {
  DOM__SVELTE_MOUNT_POINT,
  WS__MSG__PONG,
} from '../../constants';
import logger from '../../utils/logger';
import Shell from './Shell.svelte';

const log = logger('routes:mountRoute');
// const logHeartbeat = logger('routes:mountRoute:heartbeat');

window.socketConnected = new Promise((resolve, reject) => {
  const WS_URL = location.origin.replace(/^http(s)?/, 'ws$1');
  const socket = new WebSocket(WS_URL);

  window.clientSocket = {
    connected: false,
    disconnect() {
      socket.close();
    },
    emit(type, data = {}) {
      // TODO: error occurs here when reloading Dev files (already in Closed or Closing state)
      socket.send(JSON.stringify({ data, type }));
    },
    listeners: {},
    off(type, cb) {
      for (let i = window.clientSocket.listeners[type].length - 1; i >= 0; i--) {
        const handler = window.clientSocket.listeners[type][i];
        if (handler === cb) {
          window.clientSocket.listeners[type].splice(i, 1);
        }
      }
    },
    on(type, cb) {
      if (!window.clientSocket.listeners[type]) window.clientSocket.listeners[type] = [];
      window.clientSocket.listeners[type].push(cb);
    },
  };

  socket.onopen = function onWSOpen() {
    socket.onmessage = function onWSMsg({ data: msgData }) {
      const { data, type } = JSON.parse(msgData);
      const baseMsg = `[WS] type: "${type}" | `;
      
      (type === WS__MSG__PONG)
        ? log.debug(baseMsg, data)
        : log.info(baseMsg, data);
      
      if (window.clientSocket.listeners[type]) {
        window.clientSocket.listeners[type].forEach(cb => { cb(data); });
      }
    };
    
    log('Client Socket connected to Server');

    window.clientSocket.connected = true;
    resolve();
  };

  socket.onerror = function onWSError(ev) {
    let err = 'An unknown error has occurred with your WebSocket';

    if (
      !window.clientSocket.connected
      && ev.currentTarget.readyState === WebSocket.CLOSED
    ) err = `WebSocket error, could not connect to ${WS_URL}`;
    
    reject(err);
  }
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
