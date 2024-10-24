import logger from '../../utils/logger';

const log = logger('utils:socket');

export default function initSocket(opts = {}) {
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
        
        let logFn = 'info';
        if (opts.msgLogLevel) {
          Object.entries(opts.msgLogLevel).find(([ fn, arr ]) => {
            if (arr.includes(type)) {
              logFn = fn;
              return true;
            }
          });
        }
        log[logFn](baseMsg, data);
        
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
}
