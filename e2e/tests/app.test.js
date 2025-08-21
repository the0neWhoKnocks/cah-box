import {
  STATUS__ACTIVE,
  STATUS__DEFAULT,
  STATUS__DISCONNECTED,
  AppFixture,
  test,
  expect,
} from './fixtures/AppFixture';

const {
  chooseCards,
} = AppFixture;

test.describe.configure({ mode: 'serial' }); // Required to stop tests on failure.

test.afterEach(async ({ app }) => {
  await app.closeStragglingPages();
});

test('Create and play', async ({ app }) => {
  await test.step('First User creates game', async () => {
    await app.loadRoom();
    await app.createGame({ screenshots: true });
    await app.joinGame({
      isFirst: true,
      name: 'User_1',
      screenshot: 'Adding first User',
    });
    await app.verifyUser({
      host: true,
      name: 'User1',
      points: '0',
      status: STATUS__DEFAULT,
    });
    await app.verifyPendingMsg({
      loc: '.czar-pending-msg',
      msg: 'Waiting for more users to join.',
      note: "should inform the Host that more users are required to play",
    });
    await app.screenshot('Host User with pending czar message');
  });
  
  await test.step('Second User joins game from URL', async () => {
    const menuDialog = await app.openGameMenu();
    const gameURL = await app.copyGameURL(menuDialog);
    await expect(
      menuDialog,
      "should've closed menu dialog after URL copied"
    ).not.toBeAttached();
    await app.createPage();
    await app.switchToPage(2);
    await app.loadRoom(gameURL);
    await app.joinGame({
      name: 'User2',
      screenshot: 'Adding second User',
    });
    await app.verifyUser({
      host: false,
      name: 'User2',
      points: '0',
      status: STATUS__DEFAULT,
    });
    await app.verifyPendingMsg({
      loc: '.czar-pending-msg',
      msg: 'Waiting for User1 to pick the Card Czar.',
      note: "should inform the User that a Czar needs to be chozen",
    });
    await app.verifyTooltip({
      id: 'popover-card-czar',
      msg: 'The Card Czar shuffles all of the answers and shares each card combination with the group. For full effect, the Card Czar should usually re-read the Black Card.',
      note: "should inform the User what the Czar is",
    });
    await app.screenshot('Second User with pending czar message');
  });
  
  await test.step('Third User joins game from code', async () => {
    await app.switchToPage(1);
    await app.verifyPendingMsg({
      loc: '.czar-pending-msg',
      msg: 'You need to pick the Card Czar. To do so, just click on a User in the side menu.',
      note: "should inform the Host that a Czar needs to be chozen",
    });
    await app.verifyTooltip({
      id: 'popover-card-czar',
      msg: 'The Card Czar shuffles all of the answers and shares each card combination with the group. For full effect, the Card Czar should usually re-read the Black Card.',
      note: "should inform the Host what the Czar is",
    });
    await app.screenshot('Host with pending czar message');
    const menuDialog = await app.openGameMenu();
    const gameCode = await app.copyGameCode(menuDialog);
    await expect(
      menuDialog,
      "should've closed menu dialog after code copied"
    ).not.toBeAttached();
    await app.createPage();
    await app.switchToPage(3);
    await app.loadRoom(gameCode);
    await app.joinGame({
      name: 'User3',
      screenshot: 'Adding third User',
    });
    await app.verifyUser({
      host: false,
      name: 'User3',
      points: '0',
      status: STATUS__DEFAULT,
    });
  });
  
  await test.step('Assign the Czar for the first time', async () => {
    await app.switchToPage(1);
    await app.verifyUserMenu({
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
    await app.verifyUserMenu({
      btns: {
        czar: { enabled: true },
        mc: { enabled: true },
        remove: { enabled: true },
      },
      screenshot: "User3 menu nothing assigned",
      user: 'User3',
    });
    
    await app.assignCzar({ to: 'User3' });
    const { blackCard, whiteCards } = app.getDealtCards();
    
    await app.verifyCards({
      blackCard,
      whiteCards: whiteCards['User1'],
    });
    await app.screenshot('User1 - Czar assigned and cards dealt');
    
    await app.switchToPage(2);
    await app.verifyCards({
      blackCard,
      whiteCards: whiteCards['User2'],
    });
    await app.screenshot('User2 - cards dealt');
    
    await app.switchToPage(3);
    await app.verifyCards({ blackCard });
    await app.screenshot('User3 - Czar waiting for answers');
  });
  
  await test.step('Assign the Czar role to another player', async () => {
    await app.switchToPage(1);
    await app.verifyUser({ host: true, name: 'User1', status: STATUS__DEFAULT });
    
    await app.assignCzar({ from: 'User3', to: 'User1' });
    const { blackCard, whiteCards } = app.getDealtCards();
    
    await app.verifyUser({ czar: true, host: false, name: 'User1', status: STATUS__ACTIVE });
    await app.verifyCards({ blackCard });
    await app.screenshot('User1 - Assigned Czar role waiting for answers');
    
    await app.switchToPage(2);
    await app.verifyCards({
      blackCard,
      whiteCards: whiteCards['User2'],
    });
    await app.screenshot('User2 - still has cards ready to pick');
    
    await app.switchToPage(3);
    await app.verifyCards({
      blackCard,
      whiteCards: whiteCards['User3'],
    });
    await app.screenshot('User3 - now has cards ready to pick');
    
    await app.switchToPage(1);
    await app.assignCzar({ from: 'User1', to: 'User3' });
  });
  
  await test.step('Assign the Host role to another player', async () => {
    await app.switchToPage(1);
    await app.assignMC({ from: 'User1', to: 'User2' });
    await app.screenshot('Assigned User2 as Host from User1');
    await app.switchToPage(2);
    await app.verifyHostInstructions({ screenshot: 'New Host is presented with instructions' });
    await app.assignMC({ from: 'User2', to: 'User1' });
    await app.screenshot('Assigned User1 as Host from User2');
  });
  
  await test.step('Local user should be at the top of the users list', async () => {
    await app.switchToPage(1);
    await app.verifyUserOrder({
      screenshot: "User1 should be at top",
      userNames: ['User1', 'User2', 'User3'],
    });
    
    await app.switchToPage(2);
    await app.verifyUserOrder({
      screenshot: "User2 should be at top",
      userNames: ['User2', 'User1', 'User3'],
    });
    
    await app.switchToPage(3);
    await app.verifyUserOrder({
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
      const czar = await app.findCzar();
      const czarPageNum = users[czar].pageNum;
      const otherUsers = Object.keys(users).filter((user) => user !== czar);
      const { blackCard, required, whiteCards } = app.getDealtCards();
      
      await app.switchToPage(czarPageNum);
      await app.verifyCards({ blackCard });
      await app.screenshot("Czar is waiting for 2 users' answers");
      
      for (let u=0; u<otherUsers.length; u++) {
        const uName = otherUsers[u];
        const uData = users[uName];
        
        await app.switchToPage(uData.pageNum);
        
        uData.chosenCards = chooseCards(whiteCards, uName, required);
        await app.submitWhiteCards({
          blackCard,
          chosenCards: uData.chosenCards,
          screenshot: `round${rNum} - ${uName} submitted card${(required > 1) ? 's' : ''}`,
        });
      }
      
      // TODO: Check that notification fired for Czar. Currently not possible https://github.com/microsoft/playwright/issues/23954
      // TODO: Check Czar's title. Tried but the below check for `Come Back` never worked.
      // const czarFNum = czarPageNum - 1;
      // const roomCode = app.getRoomCode();
      // await expect(app.getFixturePage(czarFNum)).toHaveTitle(`${APP__TITLE} | Game ${roomCode}`);
      // await app.getFixturePage(czarFNum).waitForFunction(() => document.title === 'Come Back!');
      
      await app.switchToPage(czarPageNum);
      // await expect(app.getFixturePage(czarFNum)).toHaveTitle(`${APP__TITLE} | Game ${roomCode}`);
      await app.showAnswers();
      
      const [ firstUser, ...remainingUsers ] = await app.getOrderedUsers(otherUsers, users);
      await app.verifySubmittedAnswers(otherUsers);
      
      await app.verifyAnswerFormatting(blackCard, users[firstUser].chosenCards);
      await app.getPickAnswerBtn().click();
      
      await app.verifyPointsMsg({
        answers: users[firstUser].chosenCards,
        blackCard,
        points: required,
        screenshot: `Czar sees ${required} point(s) awarded to ${firstUser}`,
        user: firstUser,
      });
      await app.verifyUser({ czar: false, name: czar });
      
      users[firstUser].points += required;
      await app.switchToPage(users[firstUser].pageNum);
      await app.verifyPointsMsg({
        answers: users[firstUser].chosenCards,
        blackCard,
        points: required,
        screenshot: `${firstUser} sees ${required} point(s) awarded`,
        winner: true,
      });
      
      for (let i=0; i<remainingUsers.length; i++) {
        const uName = remainingUsers[i];
        await app.switchToPage(users[uName].pageNum);
        await app.verifyPointsMsg({
          answers: users[firstUser].chosenCards,
          blackCard,
          points: required,
          screenshot: `${uName} sees ${required} point(s) awarded to ${firstUser}`,
          user: firstUser,
        });
      }
      
      await app.verifyUserPoints({
        screenshot: `${firstUser} should have more points`,
        users,
      });
    }
  });
});

test('Ability to swap cards', async ({ app }) => {
  const users = ['User1', 'User2'];
  
  await test.step('setup', async () => {
    await app.startWithUsers(users);
    await app.switchToPage(1);
    await app.assignCzar({ to: users[1] });
  });
  
  await test.step('first user submitted answer', async () => {
    const { required, whiteCards } = app.getDealtCards();
    await app.submitWhiteCards({ chosenCards: chooseCards(whiteCards, users[0], required) });
  });
  
  await test.step('second user awards points', async () => {
    await app.switchToPage(2);
    await app.showAnswers();
    await app.getPickAnswerBtn().click();
    await app.closePointsAwarded();
  });
  
  await test.step('second user submitted answer', async () => {
    const { required, whiteCards } = app.getDealtCards();
    await app.submitWhiteCards({ chosenCards: chooseCards(whiteCards, users[1], required) });
  });
  
  await test.step('first user awards points', async () => {
    await app.switchToPage(1);
    await app.closePointsAwarded();
    await app.showAnswers();
    await app.getPickAnswerBtn().click();
    await app.closePointsAwarded();
  });
  
  await test.step('first user swapped cards', async () => {
    await app.verifySwappable();
    await app.swapMaxCards();
  });
});

test('Handle connection issues', async ({ app }) => {
  const DISCONNECTION_MSG = "You've lost connection to the Server";
  const users = ['User1', 'User2'];
  
  await app.startWithUsers(users);
  
  await app.goOffline();
  let dialog = await app.waitForDialog();
  await expect(dialog).toHaveText(DISCONNECTION_MSG);
  await app.screenshot(`${users[1]} informed they've lost connection`);
  
  await app.switchToPage(1);
  await app.screenshot(`${users[0]} sees ${users[1]} as connected`, '.users-list');
  await app.verifyUser({ disconnected: true, name: users[1], status: STATUS__DISCONNECTED });
  await app.screenshot(`${users[0]} sees ${users[1]} as disconnected`, '.users-list');
  
  await app.switchToPage(2);
  await app.goOnline();
  await app.verifyUser({ name: users[1], status: STATUS__DEFAULT });
  await app.screenshot(`${users[1]} re-connected`, '.users-list');
  
  await app.goOffline();
  dialog = await app.waitForDialog();
  await expect(dialog).toHaveText(DISCONNECTION_MSG);
  await app.screenshot(`${users[1]} lost connection again`);
  
  await app.switchToPage(1);
  await app.verifyUser({ disconnected: true, name: users[1], status: STATUS__DISCONNECTED });
  await app.screenshot(`${users[0]} sees ${users[1]} disconnected again`, '.users-list');
  await app.verifyUserRemoved({ name: users[1], screenshot: `${users[1]} removed from game due to disconnection` });
  
  await app.switchToPage(2);
  await app.goOnline();
  await app.joinGame({ name: users[1], screenshot: `${users[1]} rejoined game` });
  
  await app.switchToPage(1);
  await app.verifyUser({ name: users[1], status: STATUS__DEFAULT });
  await app.screenshot(`${users[0]} sees ${users[1]} re-joined game`, '.users-list');
});

test('Non-existent room', async ({ app }) => {
  await app.loadRoom('D3AD');
  const dialog = await app.waitForDialog();
  
  await expect(
    dialog.locator('.room-error-msg'),
    "should display error message to User"
  ).toHaveText("Sorry, it looks like room D3AD doesn't exist anymore.");
  
  await app.verifyGameEntry();
  
  await app.screenshot('Missing Room dialog');
});

test('Auto-Reassign roles', async ({ app }) => {
  const users = ['User1', 'User2', 'User3', 'User4'];
  
  await test.step('setup', async () => {
    await app.startWithUsers(users);
    await app.switchToPage(1);
  });
  
  await test.step('Host removes last user and first user becomes Czar', async () => {
    await app.assignCzar({ to: users[3] });
    await app.removeUser({
      screenshot: `${users[3]} removed `,
      user: users[3],
    });
    await app.closePage(4);
    await app.verifyUser({
      czar: true,
      name: users[0],
      screenshot: `the next user - ${users[0]} - should be auto-assigned the Czar role`,
      status: STATUS__ACTIVE,
    });
  });
  
  await test.step('second user leaves game and third user becomes Czar', async () => {
    await app.assignCzar({ to: users[1] });
    await app.closePage(2, { waitForUserRemoval: users[1] });
    await app.verifyUser({
      czar: true,
      name: users[2],
      screenshot: `the next user - ${users[2]} - should be auto-assigned the Czar role`,
      status: STATUS__ACTIVE,
    });
  });
  
  await test.step('Host leaves game and third user becomes Host', async () => {
    await app.switchToPage(2);
    await app.verifyUser({
      host: false,
      name: users[2],
      screenshot: `${users[2]} is not the Host`,
    });
    await app.closePage(1, { waitForUserRemoval: users[0] });
    await app.verifyHostInstructions({ screenshot: 'Auto-assigned Host is presented with instructions' });
    await app.verifyUser({
      host: true,
      name: users[2],
      screenshot: `${users[2]} should be auto-assigned the Host role`,
    });
  });
});

test('No conflicts with multiple games', async ({ app }) => {
  const users = ['User1', 'User2'];
  
  await test.step('setup', async () => {
    await app.startWithUsers(users);
    await app.startWithUsers(users, true);
  });
  
  await test.step('same names different rooms', async () => {
    await app.switchToPage(1);
    const roomCode1 = await app.getRoomCode();
    await app.verifyUserOrder({
      screenshot: `Room ${roomCode1} has the same users`,
      userNames: users,
    });
    
    await app.switchToPage(3);
    const roomCode2 = await app.getRoomCode();
    expect(roomCode2).not.toEqual(roomCode1);
    await app.verifyUserOrder({
      screenshot: `Room ${roomCode2} has the same users`,
      userNames: users,
    });
  });
});

test('User informed that room destroyed before joining', async ({ app }) => {
  let joinForm;
  
  await test.step('setup', async () => {
    await app.startWithUsers(['User1']);
    const gameURL = await app.copyGameURL( await app.openGameMenu() );
    
    await app.createPage();
    await app.switchToPage(2);
    await app.loadRoom(gameURL);
    joinForm = (await app.getJoinDialog()).locator('.join-form');
  });
  
  await test.step("User sees that room doesn't exist anymore", async () => {
    await app.closePage(1, { waitForUserRemoval: 'User1' });
    await expect(joinForm).not.toBeAttached();
    await expect( await app.waitForDialog('.room-error-msg') ).toBeAttached();
    await app.screenshot('User informed of dead room while joining');
  });
});
