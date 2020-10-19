import { onDestroy } from 'svelte';
import logger from '../../utils/logger';

const log = logger('addSocketListeners');

export default function addSocketListeners(listeners) {
  Object.keys(listeners).forEach((msgType) => {
    const handler = listeners[msgType];
    window.clientSocket.on(msgType, handler);
  });

  onDestroy(() => {
    Object.keys(listeners).forEach((msgType) => {
      const handler = listeners[msgType];
      window.clientSocket.off(msgType, handler);
    });

    log('Removed listeners', window.clientSocket.listeners);
  });
}

