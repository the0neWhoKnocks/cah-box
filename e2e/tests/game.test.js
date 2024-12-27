import { WS__MSG__CARDS_DEALT } from '@src/constants';
import {
  STATUS__ACTIVE,
  STATUS__DEFAULT,
  STATUS__DISCONNECTED,
  test,
  expect,
} from './fixtures/GameFixture';

const chooseCards = (cards, name, required) => cards[name].filter((card, ndx) => (ndx + 1) <= required);


test('Create and play', async ({ game }) => {
  await test.step('First User creates game', async () => {
    await game.loadRoom();
    await game.createGame({ screenshots: true });
    await game.joinGame({
      isFirst: true,
      name: 'User_1',
      screenshot: 'Adding first User',
    });
    await game.valitateUser({
      host: true,
      name: 'User1',
      points: '0',
      status: STATUS__DEFAULT,
    });
    await game.valitatePendingMsg({
      loc: '.czar-pending-msg',
      msg: 'Waiting for more users to join.',
      note: "should inform the Host that more users are required to play",
    });
    await game.screenshot('Host User with pending czar message');
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
      host: false,
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
      note: "should inform the Host that a Czar needs to be chozen",
    });
    await game.validateTooltip({
      id: 'popover-card-czar',
      msg: 'The Card Czar shuffles all of the answers and shares each card combination with the group. For full effect, the Card Czar should usually re-read the Black Card.',
      note: "should inform the Host what the Czar is",
    });
    await game.screenshot('Host with pending czar message');
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
      host: false,
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
          caption: "You're already the Host, yuh silly goose.",
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
    await game.valitateUser({ host: true, name: 'User1', status: STATUS__DEFAULT });
    await game.assignCzar({ from: 'User3', to: 'User1' });
    await game.valitateUser({ czar: true, host: false, name: 'User1', status: STATUS__ACTIVE });
    
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
  
  
  await test.step('Assign the Host role to another player', async () => {
    await game.switchToPage(1);
    await game.assignMC({ from: 'User1', to: 'User2' });
    await game.screenshot('Assigned User2 as Host from User1');
    await game.switchToPage(2);
    await game.validateHostInstructions({ screenshot: 'New Host is presented with instructions' });
    await game.assignMC({ from: 'User2', to: 'User1' });
    await game.screenshot('Assigned User1 as Host from User2');
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
  
  
  await test.step('Play a couple rounds', async () => {
    const users = {
      'User1': { pageNum: 1, points: 0 },
      'User2': { pageNum: 2, points: 0 },
      'User3': { pageNum: 3, points: 0 },
    };
    
    for (let rNum=1; rNum<=2; rNum++) {
      const czar = await game.findCzar();
      const czarPageNum = users[czar].pageNum;
      const otherUsers = Object.keys(users).filter((user) => user !== czar);
      const { blackCard, required, whiteCards } = game.getSocketMsg(WS__MSG__CARDS_DEALT);
      
      await game.switchToPage(czarPageNum);
      await game.validateCards({ blackCard });
      await game.screenshot("Czar is waiting for 2 users' answers");
      
      for (let u=0; u<otherUsers.length; u++) {
        const uName = otherUsers[u];
        const uData = users[uName];
        
        await game.switchToPage(uData.pageNum);
        
        uData.chosenCards = chooseCards(whiteCards, uName, required);
        await game.submitWhiteCards({
          blackCard,
          chosenCards: uData.chosenCards,
          screenshot: `round${rNum} - ${uName} submitted card${(required > 1) ? 's' : ''}`,
        });
      }
      
      // TODO: Check that notification fired for Czar. Currently not possible https://github.com/microsoft/playwright/issues/23954
      // TODO: Check Czar's title. Tried but the below check for `Come Back` never worked.
      // const czarFNum = czarPageNum - 1;
      // const roomCode = game.getRoomCode();
      // await expect(game.getFixturePage(czarFNum)).toHaveTitle(`${APP__TITLE} | Game ${roomCode}`);
      // await game.getFixturePage(czarFNum).waitForFunction(() => document.title === 'Come Back!');
      
      await game.switchToPage(czarPageNum);
      // await expect(game.getFixturePage(czarFNum)).toHaveTitle(`${APP__TITLE} | Game ${roomCode}`);
      await game.showAnswers();
      const [ firstUser, ...remainingUsers ] = await game.getOrderedUsers(otherUsers, users);
      await game.validateAnswerFormatting(blackCard, users[firstUser].chosenCards);
      await game.getPickAnswerBtn().click();
      
      await game.validatePointsMsg({
        answers: users[firstUser].chosenCards,
        blackCard,
        points: required,
        screenshot: `Czar sees ${required} point(s) awarded to ${firstUser}`,
        user: firstUser,
      });
      await game.valitateUser({ czar: false, name: czar });
      
      users[firstUser].points += required;
      await game.switchToPage(users[firstUser].pageNum);
      await game.validatePointsMsg({
        answers: users[firstUser].chosenCards,
        blackCard,
        points: required,
        screenshot: `${firstUser} sees ${required} point(s) awarded`,
        winner: true,
      });
      
      for (let i=0; i<remainingUsers.length; i++) {
        const uName = remainingUsers[i];
        await game.switchToPage(users[uName].pageNum);
        await game.validatePointsMsg({
          answers: users[firstUser].chosenCards,
          blackCard,
          points: required,
          screenshot: `${uName} sees ${required} point(s) awarded to ${firstUser}`,
          user: firstUser,
        });
      }
      
      await game.validateUserPoints({
        screenshot: `${firstUser} should have more points`,
        users,
      });
    }
  });
});

test('Ability to swap cards', async ({ game }) => {
  const users = ['User1', 'User2'];
  
  await test.step('setup', async () => {
    await game.startWithUsers(users);
    await game.switchToPage(1);
    await game.assignCzar({ to: users[1] });
  });
  
  await test.step('first user submitted answer', async () => {
    const data = game.getSocketMsg(WS__MSG__CARDS_DEALT);
    await game.submitWhiteCards({ chosenCards: chooseCards(data.whiteCards, users[0], data.required) });
  });
  
  await test.step('second user awards points', async () => {
    await game.switchToPage(2);
    await game.showAnswers();
    await game.getPickAnswerBtn().click();
    await game.closePointsAwarded();
  });
  
  await test.step('second user submitted answer', async () => {
    const data = game.getSocketMsg(WS__MSG__CARDS_DEALT);
    await game.submitWhiteCards({ chosenCards: chooseCards(data.whiteCards, users[1], data.required) });
  });
  
  await test.step('first user awards points', async () => {
    await game.switchToPage(1);
    await game.closePointsAwarded();
    await game.showAnswers();
    await game.getPickAnswerBtn().click();
    await game.closePointsAwarded();
  });
  
  await test.step('first user swapped cards', async () => {
    await game.validateSwappable();
    await game.swapMaxCards();
  });
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

test('Auto-Reassign roles', async ({ game }) => {
  const users = ['User1', 'User2', 'User3', 'User4'];
  
  await test.step('setup', async () => {
    await game.startWithUsers(users);
    await game.switchToPage(1);
  });
  
  await test.step('Host removes last user and first user becomes Czar', async () => {
    await game.assignCzar({ to: users[3] });
    await game.removeUser({
      screenshot: `${users[3]} removed `,
      user: users[3],
    });
    await game.closePage(4);
    await game.valitateUser({
      czar: true,
      name: users[0],
      screenshot: `the next user - ${users[0]} - should be auto-assigned the Czar role`,
      status: STATUS__ACTIVE,
    });
  });
  
  await test.step('second user leaves game and third user becomes Czar', async () => {
    await game.assignCzar({ to: users[1] });
    await game.closePage(2, { waitForUserRemoval: users[1] });
    await game.valitateUser({
      czar: true,
      name: users[2],
      screenshot: `the next user - ${users[2]} - should be auto-assigned the Czar role`,
      status: STATUS__ACTIVE,
    });
  });
  
  await test.step('Host leaves game and third user becomes Host', async () => {
    await game.switchToPage(2);
    await game.valitateUser({
      host: false,
      name: users[2],
      screenshot: `${users[2]} is not the Host`,
    });
    await game.closePage(1, { waitForUserRemoval: users[0] });
    await game.validateHostInstructions({ screenshot: 'Auto-assigned Host is presented with instructions' });
    await game.valitateUser({
      host: true,
      name: users[2],
      screenshot: `${users[2]} should be auto-assigned the Host role`,
    });
  });
});

test('No conflicts with multiple games', async ({ game }) => {
  const users = ['User1', 'User2'];
  
  await test.step('setup', async () => {
    await game.startWithUsers(users);
    await game.startWithUsers(users, true);
  });
  
  await test.step('same names different rooms', async () => {
    await game.switchToPage(1);
    const roomCode1 = await game.getRoomCode();
    await game.validateUserOrder({
      screenshot: `Room ${roomCode1} has the same users`,
      userNames: users,
    });
    
    await game.switchToPage(3);
    const roomCode2 = await game.getRoomCode();
    await expect(roomCode2).not.toBe(roomCode1);
    await game.validateUserOrder({
      screenshot: `Room ${roomCode2} has the same users`,
      userNames: users,
    });
  });
});

test('User informed that room destroyed before joining', async ({ game }) => {
  let joinForm;
  
  await test.step('setup', async () => {
    await game.startWithUsers(['User1']);
    const gameURL = await game.copyGameURL( await game.openGameMenu() );
    
    await game.createPage();
    await game.switchToPage(2);
    await game.loadRoom(gameURL);
    joinForm = (await game.getJoinDialog()).locator('.join-form');
  });
  
  await test.step("User sees that room doesn't exist anymore", async () => {
    await game.closePage(1, { waitForUserRemoval: 'User1' });
    await expect(joinForm).not.toBeAttached();
    await expect( await game.waitForDialog('.room-error-msg') ).toBeAttached();
    await game.screenshot('User informed of dead room while joining');
  });
});
