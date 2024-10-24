import { WS__MSG__CARDS_DEALT } from '@src/constants';
import {
  STATUS__ACTIVE,
  STATUS__DEFAULT,
  STATUS__DISCONNECTED,
  test,
  expect,
} from './fixtures/GameFixture';

test.describe('Game', () => {
  
  test('Create room', async ({ game }) => {
    await test.step('First User creates game', async () => {
      await game.loadRoom();
      await game.createGame();
      await game.joinGame({
        isFirst: true,
        name: 'User_1',
        screenshot: 'Adding first User',
      });
      await game.valitateUser({
        admin: true,
        name: 'User1',
        points: '0',
        status: STATUS__DEFAULT,
      });
      await game.valitatePendingMsg({
        loc: '.czar-pending-msg',
        msg: 'Waiting for more users to join.',
        note: "should inform the Admin that more users are required to play",
      });
      await game.screenshot('Admin User with pending czar message');
    });
    
    
    await test.step('Second User joins game from URL', async () => {
      const menuDialog = await game.openGameMenu();
      const gameURL = await game.copyGameURL(menuDialog);
      await expect(
        menuDialog,
        "should've closed menu dialog after URL copied"
      ).not.toBeAttached();
      await game.createPage();
      await game.switchToPage(2);
      await game.loadRoom(gameURL);
      await game.joinGame({
        name: 'User2',
        screenshot: 'Adding second User',
      });
      await game.valitateUser({
        admin: false,
        name: 'User2',
        points: '0',
        status: STATUS__DEFAULT,
      });
      await game.valitatePendingMsg({
        loc: '.czar-pending-msg',
        msg: 'Waiting for User1 to pick the Card Czar.',
        note: "should inform the User that a Czar needs to be chozen",
      });
      await game.validateTooltip({
        id: 'popover-card-czar',
        msg: 'The Card Czar shuffles all of the answers and shares each card combination with the group. For full effect, the Card Czar should usually re-read the Black Card.',
        note: "should inform the User what the Czar is",
      });
      await game.screenshot('Second User with pending czar message');
    });
    
    
    await test.step('Third User joins game from code', async () => {
      await game.switchToPage(1);
      await game.valitatePendingMsg({
        loc: '.czar-pending-msg',
        msg: 'You need to pick the Card Czar. To do so, just click on a User in the side menu.',
        note: "should inform the Admin that a Czar needs to be chozen",
      });
      await game.validateTooltip({
        id: 'popover-card-czar',
        msg: 'The Card Czar shuffles all of the answers and shares each card combination with the group. For full effect, the Card Czar should usually re-read the Black Card.',
        note: "should inform the Admin what the Czar is",
      });
      await game.screenshot('Admin with pending czar message');
      const menuDialog = await game.openGameMenu();
      const gameCode = await game.copyGameCode(menuDialog);
      await expect(
        menuDialog,
        "should've closed menu dialog after code copied"
      ).not.toBeAttached();
      await game.createPage();
      await game.switchToPage(3);
      await game.loadRoom(gameCode);
      await game.joinGame({
        name: 'User3',
        screenshot: 'Adding third User',
      });
      await game.valitateUser({
        admin: false,
        name: 'User3',
        points: '0',
        status: STATUS__DEFAULT,
      });
    });
    
    
    await test.step('Assign the Czar for the first time', async () => {
      await game.switchToPage(1);
      await game.validateUserMenu({
        btns: {
          czar: { enabled: true },
          mc: {
            caption: "You're already the MC, yuh silly goose.",
            enabled: false,
          },
          remove: { enabled: false },
        },
        screenshot: "User1 menu unassigned Czar",
        user: 'User1',
      });
      await game.validateUserMenu({
        btns: {
          czar: { enabled: true },
          mc: { enabled: true },
          remove: { enabled: true },
        },
        screenshot: "User3 menu nothing assigned",
        user: 'User3',
      });
      await game.assignCzar({ to: 'User3' });
      const { blackCard, whiteCards } = game.getSocketMsg(WS__MSG__CARDS_DEALT);
      await game.validateCards({
        blackCard,
        whiteCards: whiteCards['User1'],
      });
      await game.screenshot('User1 - Czar assigned and cards dealt');
      
      await game.switchToPage(2);
      await game.validateCards({
        blackCard,
        whiteCards: whiteCards['User2'],
      });
      await game.screenshot('User2 - cards dealt');
      
      await game.switchToPage(3);
      await game.validateCards({ blackCard });
      await game.screenshot('User3 - Czar waiting for answers');
    });
    
    
    await test.step('Assign the Czar role to another player', async () => {
      await game.switchToPage(1);
      await game.valitateUser({ admin: true, name: 'User1', status: STATUS__DEFAULT });
      await game.assignCzar({ from: 'User3', to: 'User1' });
      await game.valitateUser({ admin: false, czar: true, name: 'User1', status: STATUS__ACTIVE });
      
      const { blackCard, whiteCards } = game.getSocketMsg(WS__MSG__CARDS_DEALT);
      await game.validateCards({ blackCard });
      await game.screenshot('User1 - Assigned Czar role waiting for answers');
      
      await game.switchToPage(2);
      await game.validateCards({
        blackCard,
        whiteCards: whiteCards['User2'],
      });
      await game.screenshot('User2 - still has cards ready to pick');
      
      await game.switchToPage(3);
      await game.validateCards({
        blackCard,
        whiteCards: whiteCards['User3'],
      });
      await game.screenshot('User3 - now has cards ready to pick');
      
      await game.switchToPage(1);
      await game.assignCzar({ from: 'User1', to: 'User3' });
    });
    
    
    await test.step('Assign the MC role to another player', async () => {
      await game.switchToPage(1);
      await game.assignMC({ from: 'User1', to: 'User2' });
      await game.screenshot('Assigned User2 as MC from User1');
      await game.switchToPage(2);
      await game.validateAdminInstructions({ screenshot: 'New MC is presented with instructions' });
      await game.assignMC({ from: 'User2', to: 'User1' });
      await game.screenshot('Assigned User1 as MC from User2');
    });
    
    
    await test.step('Local user should be at the top of the users list', async () => {
      await game.switchToPage(1);
      await game.validateUserOrder({
        screenshot: "User1 should be at top",
        userNames: ['User1', 'User2', 'User3'],
      });
      
      await game.switchToPage(2);
      await game.validateUserOrder({
        screenshot: "User2 should be at top",
        userNames: ['User2', 'User1', 'User3'],
      });
      
      await game.switchToPage(3);
      await game.validateUserOrder({
        screenshot: "User3 should be at top",
        userNames: ['User3', 'User1', 'User2'],
      });
    });
    
    // TODO:
    // - play through a couple rounds (since there's only 2 cards)
    //   - users pick required cards
    //   - MC sees ready state for all users
    //   - pick a winner
    //   - verify dialog that displays winner and points
    //   - winner dialog should have confetti and sound 
    // - admin menu:
    //   - remove player
    // - have a player leave: https://playwright.dev/docs/api/class-page#page-close
    // - create a 2nd game with the same user names as 1st, verify there's no conflicts in gameplay.
    // - if admin leaves, another user gets assigned role automatically
    // - if czar leaves, another user gets assigned role automatically
  });
  
  test('Handle connection issues', async ({ game }) => {
    const DISCONNECTION_MSG = "You've lost connection to the Server";
    const users = ['User1', 'User2'];
    
    await game.startWithUsers(users);
    
    await game.goOffline();
    let dialog = await game.waitForDialog();
    await expect(dialog).toHaveText(DISCONNECTION_MSG);
    await game.screenshot(`${users[1]} informed they've lost connection`);
    
    await game.switchToPage(1);
    await game.screenshot(`${users[0]} sees ${users[1]} as connected`, '.users-list');
    await game.valitateUser({ disconnected: true, name: users[1], status: STATUS__DISCONNECTED });
    await game.screenshot(`${users[0]} sees ${users[1]} as disconnected`, '.users-list');
    
    await game.switchToPage(2);
    await game.goOnline();
    await game.valitateUser({ name: users[1], status: STATUS__DEFAULT });
    await game.screenshot(`${users[1]} re-connected`, '.users-list');
    
    await game.goOffline();
    dialog = await game.waitForDialog();
    await expect(dialog).toHaveText(DISCONNECTION_MSG);
    await game.screenshot(`${users[1]} lost connection again`);
    
    await game.switchToPage(1);
    await game.valitateUser({ disconnected: true, name: users[1], status: STATUS__DISCONNECTED });
    await game.screenshot(`${users[0]} sees ${users[1]} disconnected again`, '.users-list');
    await game.valitateUserRemoved({ name: users[1], screenshot: `${users[1]} removed from game due to disconnection` });
    
    await game.switchToPage(2);
    await game.goOnline();
    await game.joinGame({ name: users[1], screenshot: `${users[1]} rejoined game` });
    
    await game.switchToPage(1);
    await game.valitateUser({ name: users[1], status: STATUS__DEFAULT });
    await game.screenshot(`${users[0]} sees ${users[1]} re-joined game`, '.users-list');
  });
  
  test('Non-existent room', async ({ game }) => {
    await game.loadRoom('D3AD');
    const dialog = await game.waitForDialog();
    
    await expect(
      dialog.locator('.room-error-msg'),
      "should display error message to User"
    ).toHaveText("Sorry, it looks like room D3AD doesn't exist anymore.");
    
    await game.validateGameEntry();
    
    await game.screenshot('Missing Room dialog');
  });
});
