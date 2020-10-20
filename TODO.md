## Features/Changes

- [x] Make the chosen card more obvious
   - Once chosen it displays the card, then a point zips over to the player?
   - Sprites for explosions
      - https://www.kirupa.com/canvas/sprite_animations_canvas.htm
      - https://www.mrspeaker.net/2012/02/02/colorising-sprites-2/
      - https://spicyyoghurt.com/tutorials/html5-javascript-game-development/images-and-sprite-animations
- User's on Mobile sometimes click Pick Answer on accident
   - [ ] Add confirmation to card selection
   - [x] Or make it harder for Users on Mobile devices to accidentally click it.
- Optional Rules:
   - [x] Spend a point to discard X amount of cards, and get the same number of
     new cards back. (requires they have points of course)
   - [ ] Everyone can discard any number of cards and draw up to ten when the
     haiku card is played (before answering)
   - [ ] The first player to reach 3 points wins. Deal out new hands to start
     the next game.
   - [ ] Reward the top three answers. If you're playing with a large group, the
     Card Czar can choose three winners. Award three points to the Czar's
     favorite answer, two points to the second best, and one point to number
     three.
- [x] Ability for MC to remove a User
- [x] Remove `/game` in path to have less for Mobile users to type
- [x] Switch from `socket.io` to just WebSocket
   - https://github.com/websockets/ws
   - https://www.pubnub.com/blog/nodejs-websocket-programming-examples/
   - https://devcenter.heroku.com/articles/node-websockets
   - https://www.hackdoor.io/articles/6xQkgQo4/differences-between-websockets-and-socketio
- [x] Change Home modal to display
   ```
      Enter Code for Game
           [    ]
   --------- or -----------
   [Click to Create a Game]
   ```
   That way a Mobile user can just add the root path to their home screen, and
   enter a code to go to a running game.
   Might have to update the "Looks like that room doesn't exist" message, and
   give the option to enter a code there as well.
- [x] Add a "Waiting for players to submit answers" message for the Czar. Maybe
  have it be dynamic "Waiting for 'name', 'name', and 'name' to submit answers".
- [x] Increase disconnect to 5 seconds, display user as disconnected, then as left room.
- [x] Ensure the Answers section on Mobile can't vertically overflow. Hasn't
  been an issue yet, but could be with a card that requires multiple answers,
  and those answers are long.
- [x] Ensure a room is torn down if no one ever joins it. So, when a User creates
  a game, then leaves, currently the room just sits in memory.
- [ ] Possibly simplify the `Room` component by moving all `state` to `store`, and
  all the handling of that state to an `engine` file.
   - Still dispatch unique events, but only listen for `ROOM_UPDATED` events.
   - Maybe instead of having a bunch of handlers on the Server, just have one
     file that processes everything, big maybe.
- [x] When a User goes into a disconnected state, maybe have a spinning
  hourglass icon to symbolize time's running out? Would be cool to have it flip
  over and the sand fills up based on the `DISCONNECT_TIMEOUT`.
- [x] Transition the Modal more smoothly instead of just popping on.
- [x] Order the Local User at the top of the `users` list.
- [x] Limit the length of a User's name.
- [x] Add "Waiting for <MC_NAME> to pick the Czar"
- [x] Figure out HTTPS on Heroku. For now using `http` works, but I can't use
  `ws//`, instead I have to use `wss` (a secure WS), which would mean I'd have
  to have ship the Server with certs... or use LetsEncrypt
   - https://devcenter.heroku.com/articles/ssl
   - https://blog.heroku.com/announcing-automated-certificate-management
   - (no LetsEncrypt) https://stackoverflow.com/a/57793405/5156659
   - handle piggyback-ssl https://stackoverflow.com/a/25007872/5156659
   - https://stackoverflow.com/a/15215838/5156659
   - https://stackoverflow.com/a/18392161/5156659
   - Apps using free dynos can use the *.herokuapp.com certificate if they need SSL.
   - Check if on Heroku https://stackoverflow.com/a/28474482/5156659
      - https://devcenter.heroku.com/articles/config-vars#using-the-heroku-dashboard
- [x] Add Room code at top in monospace font so it's easy to read
- [x] After User has submitted an answer, the `Swap Card` button should go away
- [x] The "You need to pick the Card Czar." message should read "Waiting for
  more players to join", when there's no one else in the room.

## Bugs

- Random disconnects
   - Since I can SSH into the box, I should start writing a log to the FS to
     keep track of connections and disconnects to maybe get some more info on
     what's possibly happening. 
   - [ ] Phone going to sleep, causes a User to be removed from room.
      - https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
   - [ ] User bumped from room during idle
   - Logs from Heroku
   ```sh
   2020-10-18T21:46:48.472964+00:00 heroku[router]: at=error code=H15 desc="Idle connection" method=GET path="/" host=cahbox.herokuapp.com request_id=0e56538f-8558-4833-8da1-0823ff4000bc fwd="24.20.217.243" dyno=web.1 connect=1ms service=102336ms status=503 bytes= protocol=http
   2020-10-18T21:46:48.474511+00:00 heroku[router]: at=error code=H15 desc="Idle connection" method=GET path="/" host=cahbox.herokuapp.com request_id=03df43e7-c0e1-4da3-8bff-467c92ea0c89 fwd="24.20.217.243" dyno=web.1 connect=0ms service=55133ms status=503 bytes= protocol=http
   2020-10-18T21:46:48.477160+00:00 app[web.1]: 2020-10-18T21:46:48.477Z cahbox:socket:socketHandlers User "test" disconnected from room "CB47" while a game was running
   2020-10-18T21:46:48.477375+00:00 app[web.1]: 2020-10-18T21:46:48.477Z cahbox:socket:socketHandlers User "Cb47" disconnected from room "CB47" while a game was running
   2020-10-18T21:46:53.481209+00:00 app[web.1]: 2020-10-18T21:46:53.481Z cahbox:socket:socketHandlers User "test" left room "CB47" due to disconnection
   2020-10-18T21:46:53.481303+00:00 app[web.1]: 2020-10-18T21:46:53.481Z cahbox:socket:socketHandlers All Users have left, killing room "CB47"
   2020-10-18T21:46:53.481384+00:00 app[web.1]: 2020-10-18T21:46:53.481Z cahbox:socket Room "CB47" deleted
   ```
   > The dyno did not send a full response and was terminated due to 55 seconds
   > of inactivity.
   - https://devcenter.heroku.com/articles/error-codes#h15-idle-connection
   - https://stackoverflow.com/questions/41202207/how-to-keep-a-websocket-connection-to-heroku-alive
   - https://devcenter.heroku.com/articles/websockets#timeouts
     > Either client or server can prevent the connection from idling by sending
     > an occasional ping packet over the connection.
      - https://github.com/heroku-examples/node-ws-test/blob/master/index.js
   
- [x] On Desktop (maybe Mobile), when you shrink the viewport vertically (while there
  are cards to be chosen for an answer), the cards sometimes overflow from the
  top or bottom.
- [x] If Users have submitted their cards and the Czar leaves, the Czar gets
  assigned to someone that had submitted a card. Instead the round should be
  reset and those cards thrown out.
- [x] Flashing <title> for "time to review answers" not working
- [x] If I had a card selected, but not submitted, and the Czar left the game,
  then a second User joins, I make them the Czar, then I try to submit a card -
  some of the cards are grayed out, and I can't select a new card.
- [x] Notification permissions aren't requested on Mobile
   - https://stackoverflow.com/a/62450722/5156659

## Flow

- Host goes to start page
   - [x] Create new game
      - [x] A room code is generated
- [x] Host shares room code
- Users go to start page
   - Enter room code
      - [x] Enter in display name
         - [x] Server checks if name is in use
      - Joins room
- [x] The "Card Czar" is chosen
   - [x] Host sets Czar
- [x] A list of Black & White cards are randomly generated
   - [x] The random list is maintained on the Server
   - [x] For each turn, cards will be removed from the current deck and
     dispatched to all players via WebSockets.
   - Once the current list of cards is depleted, a new random list will be
     fetched from the Server.
- [x] 10 White cards are dealt to each player
- [x] The Czar is dealt a Black card, it is displayed to the group
   - [x] Some Black cards require more than one White to be provided
      - [x] Users can click which of their cards to apply, and it'll fill in the
        Black card on their device with the answer in the order they've clicked.
        They then slick Done or Ready.
   - [x] Once all Users have provided the required amount of cards, the Czar can
     click through the anonymous cards, and the Black card will have the
     blank(s) filled in by the answer, for all to see.
- [x] The Czar picks a winning answer, and that User gets an "Awesome Point"
   - [x] All Users get new cards until they have 10 again
- [x] The User after the current Czar becomes the new Czar, and it all starts
  over again.
- User leaves
   - [x] wait X seconds to see if they've actually left, or just refreshed the page
   - [x] dump their white cards into the `dead` pile
   - [x] remove them from the `users` list
   - [x] if not enough players are left, go back into a waiting state
   - [x] if the MC tries to leave, prompt them to grant MC control to someone else

## Frameworks

- https://sapper.svelte.dev/docs
   - Downloaded template by getting the template URL from
   https://github.com/sveltejs/sapper-template/tree/webpack and DownGit to
   download instead of `degit` (cuz who wants another global dep)
   https://downgit.github.io/#/home.
   - Explains why `node_modules` are in `src` https://github.com/sveltejs/sapper/issues/551
- https://github.com/sveltech/routify

## Hosting

- https://aws.amazon.com/free/webapps/
- https://www.codeinwp.com/blog/best-nodejs-hosting/
- https://devcenter.heroku.com/articles/deploying-nodejs
   - https://www.freecodecamp.org/news/how-to-deploy-an-application-to-heroku/
   - https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up
   - https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app
   - https://devcenter.heroku.com/articles/creating-apps
   - https://devcenter.heroku.com/articles/getting-started-with-nodejs#define-a-procfile
   - https://devcenter.heroku.com/articles/free-dyno-hours#free-dyno-hour-pool
   - https://devcenter.heroku.com/articles/deploying-nodejs
   - https://www.youtube.com/watch?v=AZNFox2CvBk
   - https://stackoverflow.com/questions/4536326/heroku-free-account-limited
   - https://www.heroku.com/pricing

## Testing

- https://github.com/testing-library/svelte-testing-library
   - https://testing-library.com/docs/svelte-testing-library/setup
   - https://github.com/svelte-society/recipes-mvp/blob/master/testing.md
- https://www.npmjs.com/package/dainte
