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
   - [ ] Spend a point to discard X amount of cards, and get the same number of
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
- [ ] Change Home modal to display
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

## Bugs

- Random disconnects
   - Since I can SSH into the box, I should start writing a log to the FS to
     keep track of connections and disconnects to maybe get some more info on
     what's possibly happening. 
   - [ ] Phone going to sleep, causes a User to be removed from room.
      - https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
   - [ ] User bumped from room during idle
- [x] On Desktop (maybe Mobile), when you shrink the viewport vertically (while there
  are cards to be chosen for an answer), the cards sometimes overflow from the
  top or bottom.
- [x] If Users have submitted their cards and the Czar leaves, the Czar gets
  assigned to someone that had submitted a card. Instead the round should be
  reset and those cards thrown out.
- [x] Flashing <title> for "time to review answers" not working

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
