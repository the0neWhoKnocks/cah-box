import { WS__MSG_TYPE__CREATE_GAME } from '../../constants';

export default function createGame() {
  window.socketConnected.then(() => {
    window.clientSocket.on(WS__MSG_TYPE__CREATE_GAME, ({ roomID }) => {
      window.location.assign(`/${roomID}`);
    });

    window.clientSocket.emit(WS__MSG_TYPE__CREATE_GAME);
  });
}