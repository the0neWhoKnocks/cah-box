import { DOM__SVELTE_MOUNT_POINT } from '../../constants';

window.socketConnected = new Promise((resolve) => {
  const socket = new WebSocket(location.origin.replace(/^https?/, 'ws'));

  window.clientSocket = {
    disconnect() {
      socket.close();
    },
    emit(type, data = {}) {
      socket.send(JSON.stringify({ data, type }));
    },
    listeners: {},
    on(type, cb) {
      if (!window.clientSocket.listeners[type]) window.clientSocket.listeners[type] = [];
      window.clientSocket.listeners[type].push(cb);
    },
  };

  socket.onopen = function onWSOpen() {
    socket.onmessage = function onWSMsg({ data: msgData }) {
      const { data, type } = JSON.parse(msgData);
      console.log(`Message from Server: "${type}"`, data);
      
      if (window.clientSocket.listeners[type]) {
        window.clientSocket.listeners[type].forEach(cb => { cb(data); });
      }
    };
    
    console.log('Client Socket connected to Server');

    resolve();
  };
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
