import { WS_MSG__CREATE_GAME } from '../../constants';

export default function createGame() {
  window.socketConnected.then(() => {
    window.socket.on(WS_MSG__CREATE_GAME, ({ roomID }) => {
      window.location.assign(`/${roomID}`);
    });
    window.socket.emit(WS_MSG__CREATE_GAME);
  });
}