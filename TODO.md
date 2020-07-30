
## Flow

- Host goes to start page
  - Create new game
    - A room code is generated
- Host shares room code
- Users go to start page
  - Enter room code
    - Enter in display name
      - Server checks if name is in use
    - Joins room
- The "Card Czar" is chosen
  - Host sets Czar
- A list of Black & White cards are randomly generated
  - The random list is maintained on the Host's system
  - For each turn, cards will be removed from the current deck and dispatched
  to all players via WebSockets.
  - Once the current list of cards is depleted, a new random list will be
  fetched from the Server.
- 10 White cards are dealt to each player
- The Czar is dealt a Black card, it is displayed to the group
  - Some Black cards require more than one White to be provided
    - Users can click which of their cards to apply, and it'll fill in the
    Black card on their device with the answer in the order they've clicked.
    They then slick Done or Ready.
  - Once all Users have provided the required amount of cards, the Czar can
  click through the anonymous cards, and the Black card will have the blank(s)
  filled in by the answer, for all to see.
- The Czar picks a winning answer, and that User gets an "Awesome Point"
  - All Users get new cards until they have 10 again
- The User after the current Czar becomes the new Czar, and it all starts over
again.

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
  - https://www.youtube.com/watch?v=AZNFox2CvBk
  - https://stackoverflow.com/questions/4536326/heroku-free-account-limited
  - https://www.heroku.com/pricing

## Testing

- https://github.com/testing-library/svelte-testing-library
  - https://testing-library.com/docs/svelte-testing-library/setup
  - https://github.com/svelte-society/recipes-mvp/blob/master/testing.md
- https://www.npmjs.com/package/dainte