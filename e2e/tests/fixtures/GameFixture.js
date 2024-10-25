import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import { test as base, expect } from '@playwright/test';
import {
  DISCONNECT_TIMEOUT,
  WS__MSG__CARDS_DEALT,
} from '@src/constants';

const PATH__REL_SCREENSHOTS = 'artifacts/screenshots';
const PATH__ABS_SCREENSHOTS = `/e2e/${PATH__REL_SCREENSHOTS}`;
export const STATUS__ACTIVE = '#27cfb6';
export const STATUS__DEFAULT = '#393939';
export const STATUS__DISCONNECTED = '#ffff00';
const fixtures = [];
const screenshotNdxs = {};
let currFixture;

const exec = promisify(_exec);
const genShotKeys = (testInfo) => {
  const testFileKey = testInfo.titlePath[0].replace(/\.test\.js$/, '');
  const testNameKey = `[${testInfo.titlePath[1]}][${testInfo.titlePath[2]}]`;
  
  return { testFileKey, testNameKey }; 
};
const genShotPrefix = ({ testFileKey, testNameKey }) => {
  return `${testFileKey}/${testNameKey}`.toLowerCase().replace(/\s/g, '-');
};
const pad = (num) => `${num}`.padStart(2, '0');
const transformAnswerText = (txt) => txt.trim().replace(/\.$/, '');

class GameFixture {
  constructor({ browser, context, page, testInfo }) {
    if (!currFixture) currFixture = this;
    fixtures.push(this);
    
    this.browser = browser;
    this.ctx = context;
    this.page = page;
    this.testInfo = testInfo;
    
    const { testFileKey, testNameKey } = genShotKeys(testInfo);
    this.testFileKey = testFileKey;
    this.testNameKey = testNameKey;
    this.ndxKey = `${this.testFileKey}_${this.testNameKey}`;
    this.shotNamePrefix = genShotPrefix({ testFileKey, testNameKey });
    
    page.wsMsgs = {};
    page.on('websocket', (ws) => {
      ws.on('framereceived', ({ payload }) => {
        const { data, type } = JSON.parse(payload);
        if (type !== 'pong') page.wsMsgs[type] = data;
      });
    });
  }
  
  async assignCzar({ from: userAName, to: userBName }) {
    if (userAName) await currFixture.valitateUser({ czar: true, name: userAName, status: STATUS__ACTIVE });
    await currFixture.valitateUser({ czar: false, name: userBName, status: STATUS__DEFAULT });
    
    const menu = await currFixture.openAdminMenu(userBName);
    const btn = currFixture.getAssignCzarBtn(menu, userBName);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    if (userAName) await currFixture.valitateUser({ czar: false, name: userAName, status: STATUS__DEFAULT });
    await currFixture.valitateUser({ czar: true, name: userBName, status: STATUS__ACTIVE });
  }
  
  async assignMC({ from: userAName, to: userBName }) {
    await currFixture.valitateUser({ admin: true, name: userAName });
    await currFixture.valitateUser({ admin: false, name: userBName });
    
    const menu = await currFixture.openAdminMenu(userBName);
    const btn = currFixture.getAssignMCBtn(menu, userBName);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    await currFixture.valitateUser({ admin: false, name: userAName });
    await currFixture.valitateUser({ admin: true, name: userBName });
  }
  
  async closePage(pageNum, { waitForUserRemoval } = {}) {
    const fNdx = pageNum - 1;
    const fx = fixtures[fNdx];
    
    await fx.page.close();
    await fx.ctx.close();
    
    if (waitForUserRemoval) {
      const user = currFixture.getUser(waitForUserRemoval);
      await expect(user).not.toBeAttached({ timeout: DISCONNECT_TIMEOUT + 1000 });
    }
    
    fixtures.splice(fNdx, 1);
  }
  
  async closePointsAwarded() {
    const dialog = await currFixture.waitForDialog('.points-awarded');
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeAttached();
  }
  
  async copyGameCode(el) {
    await el.locator('.copyable-item.for--code').click();
    const gameCode = await currFixture.readClipboard();
    await expect(
      gameCode,
      "should copy the room code to the clipboard"
    ).toEqual(currFixture.getRoomCode());
    return gameCode;
  }
  
  async copyGameURL(el) {
    await el.locator('.copyable-item.for--url').click();
    const gameURL = await currFixture.readClipboard();
    await expect(
      gameURL,
      "should copy the room's URL to the clipboard"
    ).toEqual(`https://cahbox:3000/${currFixture.getRoomCode()}`);
    return gameURL;
  }
  
  async createGame() {
    await currFixture.waitForDialog();
    const { createBtn } = await currFixture.validateGameEntry();
    await currFixture.screenshot('game entry');
    
    const { pathname: oldPath } = currFixture.getURLParts();
    const navPromise = currFixture.page.waitForNavigation();
    await createBtn.click();
    await navPromise;
    const { pathname: newPath } = currFixture.getURLParts();
    expect(oldPath).not.toEqual(newPath);
    await currFixture.screenshot('new room created');
  }
  
  async createPage() {
    const ctx = await currFixture.browser.newContext();
    const page = await ctx.newPage();
    
    new GameFixture({
      browser: currFixture.browser,
      context: ctx,
      page,
      testInfo: currFixture.testInfo,
    });
  }
  
  async decodeHTML(rawTxt) {
    // NOTE: There are cards with HTML entities (`A gerbil named &quot;Gerbil&quot;.`),
    // so when comparing the raw WS data against what's in the DOM, errors will
    // occur unless decoded.
    return await currFixture.page.evaluate((str) => {
      const el = document.createElement('div');
      el.innerHTML = str;
      return el.textContent;
    }, rawTxt);
  }
  
  async findCzar() {
    return await currFixture.page
      .locator('.users-list .user.is--czar .user__name')
      .evaluate((el) => el.textContent);
  }
  
  getAnswerNav() {
    return currFixture.page.locator('.black-card-wrapper .card.is--black + nav');
  }
  
  getAssignCzarBtn(menu, user) {
    return menu.getByRole('button', { name: `Make ${user} the Czar` });
  }
  
  getAssignMCBtn(menu, user) {
    return menu.getByRole('button', { name: `Make ${user} the MC` });
  }
  
  async getBGColor(loc) {
    return await loc.evaluate((el) => {
      const rgb = window.getComputedStyle(el).getPropertyValue('background-color');
      return `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;
    });
  }
  
  getBlackCard(inDialog = false) {
    const par = (inDialog) ? '.dialog' : '.cards .answers';
    return currFixture.page.locator(`${par} .card.is--black .card__text`);
  }
  
  async getBlackCardAnswers() {
    return await currFixture.getBlackCard()
      .locator('.answer')
      .evaluateAll((els) => els.map(el => el.textContent));
  }
  
  getCardsNav() {
    return currFixture.page.locator('.cards-nav');
  }
  
  getCancelCardSwapBtn() {
    return currFixture.getCardsNav().getByRole('button', { name: 'Cancel Card Swap' });
  }
  
  // getFixturePage(fNum) {
  //   return fixtures[fNum].page;
  // }
  
  getLocalUser(extraSelector = '') {
    return currFixture.page.locator(`.user.is--local${extraSelector}`);
  }
  
  async getLocalUserPoints() {
    const localUser = currFixture.getLocalUser();
    return +(await localUser.locator('.user__points').evaluate(el => el.textContent));
  }
  
  getNextAnswerBtn() {
    return currFixture.getAnswerNav().locator('.next-btn');
  }
  
  async getOrderedUsers(otherUsers, users) {
    await expect(
      currFixture.getPrevAnswerBtn(),
      "View previous answer button should be disabled at start"
    ).toBeDisabled();
    await expect(
      currFixture.getNextAnswerBtn(),
      "View next answer button should be enabled at start"
    ).toBeEnabled();
    
    const orderedUsers = [];
    // NOTE: order of user's answers is shuffled, so find the order so assertions can continue.
    for (let a=0; a<otherUsers.length; a++) {
      const answers = await currFixture.getBlackCardAnswers();
      
      for (let u=0; u<otherUsers.length; u++) {
        const uName = otherUsers[u];
        const { chosenCards } = users[uName];
        
        if (transformAnswerText(chosenCards[0]) === answers[0]) orderedUsers.push(uName);
      }
      
      if (a < otherUsers.length - 1) await currFixture.viewNextAnswer();
    }
    await expect(
      currFixture.getPrevAnswerBtn(),
      "View previous answer button should be enabled at end"
    ).toBeEnabled();
    await expect(
      currFixture.getNextAnswerBtn(),
      "View next answer button should be disabled at end"
    ).toBeDisabled();
    
    for (let u=0; u<otherUsers.length; u++) {
      if (u < otherUsers.length - 1) await currFixture.viewPrevAnswer();
    }
    await expect(
      currFixture.getPrevAnswerBtn(),
      "View previous answer button should be disabled at start"
    ).toBeDisabled();
    await expect(
      currFixture.getNextAnswerBtn(),
      "View next answer button should be enabled at start"
    ).toBeEnabled();
    
    return orderedUsers;
  }
  
  getPickAnswerBtn() {
    return currFixture.getAnswerNav().locator('.pick-answer-btn');
  }
  
  getPrevAnswerBtn() {
    return currFixture.getAnswerNav().locator('.prev-btn');
  }
  
  getRemoveUserBtn(menu, user) {
    return menu.getByRole('button', { name: `Remove ${user} from game` });
  }
  
  getRoomCode() {
    return currFixture.getURLParts().pathname.replace(/^\//, '');
  }
  
  getSocketMsg(type) {
    let payload = currFixture.page.wsMsgs[type];
    
    switch (type) {
      case WS__MSG__CARDS_DEALT: {
        const {
          room: {
            blackCard,
            requiredWhiteCardsCount,
            users,
          },
        } = payload;
        payload = {
          blackCard,
          required: requiredWhiteCardsCount,
          whiteCards: users.reduce((obj, { cards, name }) => {
            obj[name] = cards.map(({ text }) => text);
            return obj;
          }, {}),
        };
        break;
      }
    }
    
    return payload;
  }
  
  getSwapCardBtn() {
    return currFixture.getCardsNav().getByRole('button', { name: 'Swap Card' });
  }
  
  getURLParts() {
    return new URL(currFixture.page.url());
  }
  
  getUser(name) {
    return currFixture.page.locator(`.users-list .user[data-name="${name}"]`);
  }
  
  async goOffline() {
    await currFixture.ctx.setOffline(true);
  }
  
  async goOnline() {
    await currFixture.ctx.setOffline(false);
  }
  
  async joinGame({ isFirst, name, screenshot }) {
    const dialog = await currFixture.waitForDialog('.join-form');
    await dialog.getByLabel('Enter Username').fill(name);
    
    if (screenshot) await currFixture.screenshot(`${screenshot} (name entered)`);
    
    await dialog.getByRole('button', { name: 'Join Game' }).click();
    await expect(
      dialog.locator('.join-form'),
      "should've closed Join Game dialog"
    ).not.toBeAttached();
    
    if (isFirst) {
      const opts = {};
      if (screenshot) opts.screenshot = `${screenshot} (admin instructions)`;
      await currFixture.validateAdminInstructions(opts);
    }
    
    if (screenshot) await currFixture.screenshot(`${screenshot} (added to list)`);
  }
  
  async loadRoom(str) {
    const route = (str)
      ? (str.startsWith('http')) ? str : `/${str}`
      : '';
    await currFixture.page.goto(route);
  }
  
  async openAdminMenu(name) {
    await currFixture.getUser(name).click();
    return await currFixture.waitForDialog('.user-data-menu');
  }
  
  async openGameMenu() {
    await currFixture.page
      .locator('.top-nav')
      .getByRole('button', { name: 'Menu' })
      .click();
    return await currFixture.waitForDialog('.game-menu');
  }
  
  async readClipboard() {
    await currFixture.ctx.grantPermissions(['clipboard-read']);
    const handle = await currFixture.page.evaluateHandle(() => navigator.clipboard.readText());
    const txt = await handle.jsonValue();
    await handle.dispose();
    return txt;
  }
  
  async removeUser({ screenshot, user }) {
    const menu = await currFixture.openAdminMenu(user);
    const btn = currFixture.getRemoveUserBtn(menu, user);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    await expect(currFixture.getUser(user)).not.toBeAttached();
    
    if (screenshot) await currFixture.screenshot(screenshot, '.users-list');
  }
  
  async screenshot(name, loc) {
    const _loc = (typeof loc === 'string') ? currFixture.page.locator(loc) : loc; 
    if (!screenshotNdxs[currFixture.ndxKey]) screenshotNdxs[currFixture.ndxKey] = 1;
    
    const screenshotNdx = screenshotNdxs[currFixture.ndxKey];
    const filename = `${PATH__REL_SCREENSHOTS}/${`${currFixture.shotNamePrefix}_${pad(screenshotNdx)}__${name}`.toLowerCase().replace(/\s/g, '-')}.jpg`;
    
    screenshotNdxs[currFixture.ndxKey] += 1;
    
    const el = (_loc) ? _loc : currFixture.page;
    await el.screenshot({
      animations: 'disabled', // stops CSS animations, CSS transitions and Web Animations.
      fullPage: !_loc,
      path: filename,
      quality: 90,
      type: 'jpeg',
    });
  }
  
  async showAnswers() {
    const nav = currFixture.getAnswerNav();
    
    await expect(
      currFixture.getPrevAnswerBtn(),
      "Previous answer button should not be visible"
    ).toHaveClass(/\bhidden\b/);
    await expect(
      currFixture.getNextAnswerBtn(),
      "Next answer button should not be visible"
    ).toHaveClass(/\bhidden\b/);
    await expect(
      currFixture.getPickAnswerBtn(),
      "Pick answer button should be disabled"
    ).toBeDisabled();
    await nav.locator('.show-answer-btn').click();
    await expect(
      currFixture.getPickAnswerBtn(),
      "Pick answer button should be enabled when reviewing answers"
    ).toBeEnabled();
  }
  
  async startWithUsers(users, freshPage) {
    const _users = [...users];
    
    if (freshPage) {
      await currFixture.createPage();
      await currFixture.switchToPage(fixtures.length);
    }
    
    await currFixture.loadRoom();
    await currFixture.createGame();
    await currFixture.joinGame({ isFirst: true, name: _users.shift() });
    const menuDialog = await currFixture.openGameMenu();
    const gameURL = await currFixture.copyGameURL(menuDialog);
    
    for (let i=0; i<_users.length; i++) {
      const name = _users[i];
      await currFixture.createPage();
      await currFixture.switchToPage(fixtures.length);
      await currFixture.loadRoom(gameURL);
      await currFixture.joinGame({ name });
    }
  }
  
  async submitWhiteCards({ chosenCards, screenshot }) {
    const userCards = currFixture.page.locator('.user-cards');
    const selectMultiple = chosenCards.length > 1;
    
    for (let i=0; i<chosenCards.length; i++) {
      const cardText = (await currFixture.decodeHTML(chosenCards[i]));
      const card = userCards.locator(`.card:has-text("${cardText.replace(/"/g, "\\\"")}")`);
      
      await expect(card, "card should be enabled before selection").toBeEnabled();
      await expect(card).toHaveClass(/\bis--selectable\b/);
      await expect(card).not.toHaveClass(/\bis--selected\b/);
      await card.click();
      await expect(card, "card should be disabled after selection").toBeDisabled();
      await expect(card).not.toHaveClass(/\bis--selectable\b/);
      await expect(card).toHaveClass(/\bis--selected\b/);
      
      const answerCard = currFixture.page
        .locator('.answers-wrapper.displaying-users-cards .card.is--white.is--selectable')
        .nth(i);
      await expect(answerCard).toHaveText(cardText);
      
      if (selectMultiple) {
        if (i < chosenCards.length - 1) {
          await expect(
            userCards,
            "cards should still be selectable when all required cards have not been selected"
          ).not.toHaveClass(/\bdisabled\b/);
        }
        else {
          await expect(
            userCards,
            "no cards should be selectable after required cards selected"
          ).toHaveClass(/\bdisabled\b/);
        }
      }
      else {
        await expect(
          userCards, 
          "no cards should be selectable after required cards selected"
        ).toHaveClass(/\bdisabled\b/);
      }
    }
    
    await currFixture.page.locator('.submit-cards-btn').click();
    await expect(userCards, "User's cards should not be visible after they've submitted answers").not.toBeAttached();
    const localUser = currFixture.getLocalUser('.cards-submitted');
    const animName = await localUser.evaluate((el) => {
      return window.getComputedStyle(el, '::after').getPropertyValue('animation-name');
    });
    await expect(animName).toMatch(/.*showCard$/);
    
    if (screenshot) await currFixture.screenshot(screenshot, '.game-ui');
  }
  
  async swapMaxCards() {
    const SELECTOR__WHITE_CARDS = '.user-cards .card.is--white.is--selectable';
    const SELECTOR__SWAPPABLE = '.is--swappable';
    
    let points = await currFixture.getLocalUserPoints();
    
    await currFixture.screenshot("pre-swap cards");
    
    for (let i=0; i<points; i++) {
      await currFixture.getSwapCardBtn().click();
      
      let card = currFixture.page.locator(`${SELECTOR__WHITE_CARDS}${SELECTOR__SWAPPABLE}`).nth(0);
      const cardText1 = await card.evaluate(el => el.textContent);
      await card.click();
      
      card = currFixture.page.locator(`${SELECTOR__WHITE_CARDS}:not(${SELECTOR__SWAPPABLE})`).nth(0);
      const cardText2 = await card.evaluate(el => el.textContent);
      await expect(cardText2).not.toBe(cardText1);
      
      await currFixture.screenshot("swapped card");
    }
    
    points = await currFixture.getLocalUserPoints();
    await expect(points).toBe(0);
    await expect(currFixture.getSwapCardBtn()).not.toBeAttached();
    await expect(currFixture.getCancelCardSwapBtn()).not.toBeAttached();
    
    await currFixture.screenshot("swapped available points for cards");
  }
  
  async switchToPage(pageNum) {
    currFixture = fixtures[pageNum - 1];
    await currFixture.page.bringToFront();
    await expect(currFixture.page.locator('body')).toBeAttached();
  }
  
  async validateAdminInstructions({ screenshot }) {
    const dialog = await currFixture.waitForDialog('.admin-instructions');
    const instructions = dialog.locator('p');
    await expect(instructions.nth(0)).toHaveText("Congrats! You're the MC, so you're running the game. In order for others to join, just send them");
    await expect(instructions.nth(1)).toHaveText("When starting a new CAH game it's up to the group to choose the Card Czar. Y'all can do that via the typical Who was the last to poop? question, or by what ever means you choose.");
    await expect(instructions.nth(2)).toHaveText("Once the group's chosen the Czar, you just have to click on that User and choose Make <User> the Czar. Once you do so, the game will start.");
    await currFixture.copyGameURL(dialog);
    await currFixture.copyGameCode(dialog);
    if (screenshot) await currFixture.screenshot(screenshot);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(
      dialog,
      "should've closed Admin instructions"
    ).not.toBeAttached();
  }
  
  async validateAnswerFormatting(blackCard, answers, inDialog = false) {
    let ndx = 0;
    const expected = blackCard.replaceAll('__________', () => {
      const a = transformAnswerText(answers[ndx]);
      ndx += 1;
      return a;
    });
    
    await expect(
      currFixture.getBlackCard(inDialog),
      "black card should have gaps replaced with answer text"
    ).toHaveText(await currFixture.decodeHTML(expected));
  }
  
  async validateCards({ blackCard, whiteCards }) {
    const answers = currFixture.page.locator('.cards .answers');
    const userCards = currFixture.page.locator('.cards .user-cards');
    
    let cards = answers.locator('.card');
    await expect(cards).toHaveCount(1);
    let card = cards.nth(0);
    await expect(card).toHaveClass(/\bis--black\b/);
    await expect(card).toHaveText( await currFixture.decodeHTML(blackCard) );
    
    if (whiteCards) {
      cards = userCards.locator('.card');
      await expect(cards).toHaveCount(10);
      const cardsCount = await cards.count();
      for (let i=0; i<cardsCount; i++) {
        card = cards.nth(i);
        await expect(card).toHaveClass(/\bis--white\b/);
        await expect(card).toHaveText( await currFixture.decodeHTML(whiteCards[i]) );
      }
    }
    else {
      const waitingMsg = currFixture.page.locator('.czar-waiting-msg');
      const userNames = await currFixture.page
        .locator('.users-list .user:not(.is--czar):not(.cards-submitted)')
        .evaluateAll(els => els.map((el) => el.dataset.name));
      const formattedTxt = (userNames.length > 1)
        ? userNames.reduce((str, uName, ndx) => {
          if (ndx === 0) str += uName;
          else if (ndx === userNames.length - 1) str += `, and ${uName}`;
          else str += `, ${uName}`;
          return str;
        }, '')
        : userNames[0];
      
      await expect(
        waitingMsg,
        "should be formatted based on how many users that haven't submitted cards"
      ).toHaveText(`Waiting for ${formattedTxt} to submit their answer${userNames.length > 1 ? 's' : ''}.`);
      await expect(userCards).not.toBeAttached();
    }
  }
  
  async validateGameEntry() {
    const dialog = await currFixture.waitForDialog();
    const rows = dialog.locator('.row');
    const codeRow = rows.nth(0);
    const codeLabel = codeRow.locator('label');
    const codeInput = codeLabel.locator('input');
    const codeBtn = codeRow.locator('button');
    const createRow = rows.nth(1);
    const createLabel = await createRow.evaluate(el => el.childNodes[0].textContent); // text node
    const createBtn = createRow.locator('button');
    
    await expect(async () => {
      await expect(rows).toHaveCount(2);
      
      await expect(codeLabel).toHaveText(/Enter code/);
      await expect(codeInput).toHaveValue('');
      await expect(codeBtn).toHaveText('Go');
      
      await expect(createLabel).toMatch(/Or/);
      await expect(createBtn).toHaveText('Create Game');
    }, "should provide User with options to enter a new room code or create a new one")
    .toPass({ timeout: 1000 });
    
    return { codeBtn, codeInput, createBtn };
  }
  
  async valitatePendingMsg({ loc, msg, note }) {
    await expect(currFixture.page.locator(loc), note).toHaveText(msg);
  }
  
  async validatePointsMsg({ answers, blackCard, points, screenshot, user, winner }) {
    const dialog = await currFixture.waitForDialog('.points-awarded');
    
    if (winner) {
      await expect(currFixture.page.locator('.dialog-wrapper .confetti')).toBeAttached();
      // TODO: check if audio play(ing/ed). Haven't found anything that allows for this check
    }
    
    await expect(dialog.locator('.points-awarded__msg')).toHaveText(`${winner ? 'You' : user} got ${points} point${(points > 1 ? 's' : '')} for`);
    await currFixture.validateAnswerFormatting(blackCard, answers, true);
    if (screenshot) await currFixture.screenshot(screenshot);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeAttached();
  }
  
  async validateSwappable() {
    const SELECTOR__WHITE_CARDS = '.user-cards .card.is--white.is--selectable';
    const SELECTOR__SWAPPABLE = '.is--swappable';
    
    await expect(
      await currFixture.getLocalUserPoints(),
      "should have at least one point for swapping to be enabled"
    ).toBeGreaterThan(0);
    
    const swapBtn = currFixture.getSwapCardBtn();
    await expect(
      swapBtn,
      "ability to swap cards should be enabled"
    ).toBeAttached();
    await swapBtn.click();
    const swappableCards = currFixture.page.locator(`${SELECTOR__WHITE_CARDS}${SELECTOR__SWAPPABLE}`);
    await expect(
      swappableCards,
      "all cards should be swappable"
    ).toHaveCount(10);
    
    const cancelSwapBtn = currFixture.getCancelCardSwapBtn();
    await expect(
      cancelSwapBtn,
      "ability to cancel swapping cards should be enabled"
    ).toBeAttached();
    await cancelSwapBtn.click();
    const unSwappableCards = currFixture.page.locator(`${SELECTOR__WHITE_CARDS}:not(${SELECTOR__SWAPPABLE})`);
    await expect(
      unSwappableCards,
      "all cards should be not be swappable"
    ).toHaveCount(10);
  }
  
  async validateTooltip({ id, msg, note }) {
    await currFixture.page.locator(`button[popovertarget="${id}"]`).click();
    await expect(
      currFixture.page.locator(`[popover][role="tooltip"][id="${id}"]`),
      note
    ).toHaveText(msg);
  }
  
  async valitateUser({ admin, czar, disconnected, name, points, screenshot, status }) {
    const userEl = currFixture.getUser(name);
    let userIcon;
    
    if (admin) {
      await expect(userEl).toHaveClass(/\bis--admin\b/);
      userIcon = 'ui-icon__star';
    }
    else if (czar) {
      await expect(userEl).toHaveClass(/\bis--czar\b/);
      userIcon = 'ui-icon__crown';
    }
    
    if (disconnected) {
      await expect(userEl).not.toHaveClass(/\bis--connected\b/, { timeout: 5000 });
      await expect(
        userEl.locator('.disconnect-indicator'),
        "should display animated icon that informs users when disconnected user will be removed"
      ).toBeAttached();
    }
    
    if (userIcon) {
      await expect(
        // NOTE: using `xlink:href` isn't valid, but `*|href` is.
        userEl.locator(`.user__icon .icon use[*|href="#${userIcon}"]`),
        "should display correct icon"
      ).toBeAttached();
    }
    
    if (name) {
      await expect(
        userEl.locator('.user__name'),
        "should display sanitized User name"
      ).toHaveText(name);
    }
    
    if (points) {
      await expect(
        userEl.locator('.user__points'),
        "should display starting points"
      ).toHaveText(points);
    }
    
    if (status) {
      const statusEl = (disconnected) ? userEl : userEl.locator('.user__status-indicator');
      await currFixture.waitForAnimations(statusEl);
      await expect(
        await currFixture.getBGColor(statusEl),
        "should display User status color"
      ).toEqual(status);
    }
    
    if (screenshot) await currFixture.screenshot(screenshot, '.users-list');
  }
  
  async valitateUserRemoved({ name, screenshot }) {
    const user = currFixture.getUser(name);
    await expect(user).not.toBeAttached({ timeout: DISCONNECT_TIMEOUT });
    if (screenshot) await currFixture.screenshot(screenshot, currFixture.page.locator('.users-list'));
  }
  
  async validateUserMenu({ btns, screenshot, user }) {
    const menu = await currFixture.openAdminMenu(user);
    const cancelBtn = menu.getByRole('button', { name: 'Cancel' });
    
    for (const [ key, { caption, enabled } ] of Object.entries(btns)) {
      let btnEl;
      
      switch (key) {
        case 'czar': {
          btnEl = currFixture.getAssignCzarBtn(menu, user);
          break;
        }
        case 'mc': {
          btnEl = currFixture.getAssignMCBtn(menu, user);
          break;
        }
        case 'remove': {
          btnEl = currFixture.getRemoveUserBtn(menu, user);
          break;
        }
      }
      
      if (enabled) await expect(btnEl).toBeEnabled();
      else await expect(btnEl).toBeDisabled();
      
      if (caption) await expect(btnEl.locator(' + .help')).toHaveText(caption);
    }
    
    if (screenshot) await currFixture.screenshot(screenshot);
    
    await cancelBtn.click();
    await expect(menu).not.toBeAttached();
  }
  
  async validateUserOrder({ screenshot, userNames }) {
    const users = currFixture.page.locator('.users-list .user.is--connected');
    const usersCount = await users.count();
    
    await expect(usersCount).toEqual(userNames.length);
    
    for (let i=0; i<usersCount; i++) {
      await expect(users.nth(i)).toHaveAttribute('data-name', userNames[i]);
    }
    
    if (screenshot) await currFixture.screenshot(screenshot, currFixture.page.locator('.users-list'));
  }
  
  async validateUserPoints({ screenshot, users }) {
    const usersLoc = currFixture.page.locator('.users-list .user');
    const usersCount = await usersLoc.count();
    
    for (let i=0; i<usersCount; i++) {
      const user = usersLoc.nth(i);
      const uName = await user.locator('.user__name').evaluate((el) => el.textContent);
      await expect(
        user.locator('.user__points'),
        "should display the User's current points"
      ).toHaveText(`${users[uName].points}`);
    }
    
    if (screenshot) await currFixture.screenshot(screenshot, currFixture.page.locator('.users-list'));
  }
  
  async viewNextAnswer() {
    await currFixture.getNextAnswerBtn().click();
  }
  
  async viewPrevAnswer() {
    await currFixture.getPrevAnswerBtn().click();
  }
  
  async waitForDialog(selector) {
    const dialog = currFixture.page.locator('.dialog');
    await dialog.waitFor({ state: 'visible' });
    
    if (selector) {
      const el = dialog.locator(selector);
      await expect(el).toBeVisible();
    }
    
    return dialog;
  }
  
  async waitForAnimations(loc) {
    await loc.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished)));
  }
  
  async writeClipboard() {
    await currFixture.ctx.grantPermissions(['clipboard-write']);
  }
}

export const test = base.extend({
  game: async ({ browser, context, page }, use, testInfo) => {
    // [ before test ] =========================================================
    const rmPath = `${PATH__ABS_SCREENSHOTS}/${genShotPrefix(genShotKeys(testInfo))}`;
    await test.step(`Remove old screenshots for "${rmPath}"`, async () => {
      await exec(`rm -rf "${rmPath}"*`); // without quotes, the brackets get misinterpreted
    });
    
    // [ test ] ================================================================
    const game = new GameFixture({ browser, context, page, testInfo });
    await use(game);
    
    // [ after test ] ==========================================================
  },
});

export { expect };
