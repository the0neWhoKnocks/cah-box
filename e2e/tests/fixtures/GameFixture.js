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
const screenshotNdxs = {};

const exec = promisify(_exec);
const genShotKeys = (testInfo) => {
  const testFileKey = testInfo.titlePath[0].replace(/\.test\.js$/, '');
  const testNameKey = `[${testInfo.titlePath[1]}]`;
  
  return { testFileKey, testNameKey }; 
};
const genShotPrefix = ({ testFileKey, testNameKey }) => {
  return `${testFileKey}/${testNameKey}`.toLowerCase().replace(/\s/g, '-');
};
const pad = (num) => `${num}`.padStart(2, '0');
const transformAnswerText = (txt) => txt.trim().replace(/\.$/, '');

class GameFixture {
  constructor({ browser, context, page, testCtx, testInfo }) {
    if (!testCtx.fixture) testCtx.fixture = this;
    testCtx.fixtures.push(this);
    
    this.browser = browser;
    this.ctx = context;
    this.page = page;
    this.testCtx = testCtx;
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
    if (userAName) await this.testCtx.fixture.valitateUser({ czar: true, name: userAName, status: STATUS__ACTIVE });
    await this.testCtx.fixture.valitateUser({ czar: false, name: userBName, status: STATUS__DEFAULT });
    
    const menu = await this.testCtx.fixture.openHostMenu(userBName);
    const btn = this.testCtx.fixture.getAssignCzarBtn(menu, userBName);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    if (userAName) await this.testCtx.fixture.valitateUser({ czar: false, name: userAName, status: STATUS__DEFAULT });
    await this.testCtx.fixture.valitateUser({ czar: true, name: userBName, status: STATUS__ACTIVE });
  }
  
  async assignMC({ from: userAName, to: userBName }) {
    await this.testCtx.fixture.valitateUser({ host: true, name: userAName });
    await this.testCtx.fixture.valitateUser({ host: false, name: userBName });
    
    const menu = await this.testCtx.fixture.openHostMenu(userBName);
    const btn = this.testCtx.fixture.getAssignMCBtn(menu, userBName);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    await this.testCtx.fixture.valitateUser({ host: false, name: userAName });
    await this.testCtx.fixture.valitateUser({ host: true, name: userBName });
  }
  
  async closePage(pageNum, { waitForUserRemoval } = {}) {
    const fNdx = pageNum - 1;
    const fx = this.testCtx.fixtures[fNdx];
    
    await fx.page.close();
    await fx.ctx.close();
    
    if (waitForUserRemoval) {
      const user = this.testCtx.fixture.getUser(waitForUserRemoval);
      await expect(
        user,
        `'${waitForUserRemoval}' should be removed after disconnect`
      ).not.toBeAttached({ timeout: DISCONNECT_TIMEOUT + 1000 });
    }
    
    this.testCtx.fixtures.splice(fNdx, 1);
  }
  
  async closePointsAwarded() {
    const dialog = await this.testCtx.fixture.waitForDialog('.points-awarded');
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeAttached();
  }
  
  async copyGameCode(el) {
    await el.locator('.copyable-item.for--code').click();
    const gameCode = await this.testCtx.fixture.readClipboard();
    await expect(
      gameCode,
      "should copy the room code to the clipboard"
    ).toEqual(this.testCtx.fixture.getRoomCode());
    return gameCode;
  }
  
  async copyGameURL(el) {
    await el.locator('.copyable-item.for--url').click();
    const gameURL = await this.testCtx.fixture.readClipboard();
    await expect(
      gameURL,
      "should copy the room's URL to the clipboard"
    ).toEqual(`https://cahbox:3000/${this.testCtx.fixture.getRoomCode()}`);
    return gameURL;
  }
  
  async createGame({ screenshots } = {}) {
    await this.testCtx.fixture.waitForDialog();
    const { createBtn } = await this.testCtx.fixture.validateGameEntry();
    if (screenshots) await this.testCtx.fixture.screenshot('game entry');
    
    const { pathname: oldPath } = this.testCtx.fixture.getURLParts();
    const navPromise = this.testCtx.fixture.page.waitForNavigation();
    await createBtn.click();
    await navPromise;
    const { pathname: newPath } = this.testCtx.fixture.getURLParts();
    expect(oldPath).not.toEqual(newPath);
    if (screenshots) await this.testCtx.fixture.screenshot('new room created');
  }
  
  async createPage() {
    const ctx = await this.testCtx.fixture.browser.newContext();
    const page = await ctx.newPage();
    
    new GameFixture({
      browser: this.testCtx.fixture.browser,
      context: ctx,
      page,
      testCtx: this.testCtx,
      testInfo: this.testCtx.fixture.testInfo,
    });
  }
  
  async decodeHTML(rawTxt) {
    // NOTE: There are cards with HTML entities (`A gerbil named &quot;Gerbil&quot;.`),
    // so when comparing the raw WS data against what's in the DOM, errors will
    // occur unless decoded.
    return await this.testCtx.fixture.page.evaluate((str) => {
      const el = document.createElement('div');
      el.innerHTML = str;
      return el.textContent;
    }, rawTxt);
  }
  
  async findCzar() {
    return await this.testCtx.fixture.page
      .locator('.users-list .user.is--czar .user__name')
      .evaluate((el) => el.textContent);
  }
  
  getAnswerNav() {
    return this.testCtx.fixture.page.locator('.black-card-wrapper .card.is--black + nav');
  }
  
  getAssignCzarBtn(menu, user) {
    return menu.getByRole('button', { name: `Make ${user} the Czar` });
  }
  
  getAssignMCBtn(menu, user) {
    return menu.getByRole('button', { name: `Make ${user} the Host` });
  }
  
  async getBGColor(loc) {
    return await loc.evaluate((el) => {
      const rgb = window.getComputedStyle(el).getPropertyValue('background-color');
      return `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;
    });
  }
  
  getBlackCard(inDialog = false) {
    const par = (inDialog) ? '.dialog' : '.cards .answers';
    return this.testCtx.fixture.page.locator(`${par} .card.is--black .card__text`);
  }
  
  async getBlackCardAnswers() {
    return await this.testCtx.fixture.getBlackCard()
      .locator('.answer')
      .evaluateAll((els) => els.map(el => el.textContent));
  }
  
  getCardsNav() {
    return this.testCtx.fixture.page.locator('.cards-nav');
  }
  
  getCancelCardSwapBtn() {
    return this.testCtx.fixture.getCardsNav().getByRole('button', { name: 'Cancel Card Swap' });
  }
  
  // getFixturePage(fNum) {
  //   return this.testCtx.fixtures[fNum].page;
  // }
  
  async getJoinDialog() {
    return await this.testCtx.fixture.waitForDialog('.join-form');
  }
  
  getLocalUser(extraSelector = '') {
    return this.testCtx.fixture.page.locator(`.user.is--local${extraSelector}`);
  }
  
  async getLocalUserPoints() {
    const localUser = this.testCtx.fixture.getLocalUser();
    return +(await localUser.locator('.user__points').evaluate(el => el.textContent));
  }
  
  getNextAnswerBtn() {
    return this.testCtx.fixture.getAnswerNav().locator('.next-btn');
  }
  
  async getOrderedUsers(otherUsers, users) {
    await expect(
      this.testCtx.fixture.getPrevAnswerBtn(),
      "View previous answer button should be disabled at start"
    ).toBeDisabled();
    await expect(
      this.testCtx.fixture.getNextAnswerBtn(),
      "View next answer button should be enabled at start"
    ).toBeEnabled();
    
    const orderedUsers = [];
    // NOTE: order of user's answers is shuffled, so find the order so assertions can continue.
    for (let a=0; a<otherUsers.length; a++) {
      const answers = await this.testCtx.fixture.getBlackCardAnswers();
      
      for (let u=0; u<otherUsers.length; u++) {
        const uName = otherUsers[u];
        const { chosenCards } = users[uName];
        
        if (transformAnswerText(chosenCards[0]) === answers[0]) orderedUsers.push(uName);
      }
      
      if (a < otherUsers.length - 1) await this.testCtx.fixture.viewNextAnswer();
    }
    await expect(
      this.testCtx.fixture.getPrevAnswerBtn(),
      "View previous answer button should be enabled at end"
    ).toBeEnabled();
    await expect(
      this.testCtx.fixture.getNextAnswerBtn(),
      "View next answer button should be disabled at end"
    ).toBeDisabled();
    
    for (let u=0; u<otherUsers.length; u++) {
      if (u < otherUsers.length - 1) await this.testCtx.fixture.viewPrevAnswer();
    }
    await expect(
      this.testCtx.fixture.getPrevAnswerBtn(),
      "View previous answer button should be disabled at start"
    ).toBeDisabled();
    await expect(
      this.testCtx.fixture.getNextAnswerBtn(),
      "View next answer button should be enabled at start"
    ).toBeEnabled();
    
    return orderedUsers;
  }
  
  getPickAnswerBtn() {
    return this.testCtx.fixture.getAnswerNav().locator('.pick-answer-btn');
  }
  
  getPrevAnswerBtn() {
    return this.testCtx.fixture.getAnswerNav().locator('.prev-btn');
  }
  
  getRemoveUserBtn(menu, user) {
    return menu.getByRole('button', { name: `Remove ${user} from game` });
  }
  
  getRoomCode() {
    return this.testCtx.fixture.getURLParts().pathname.replace(/^\//, '');
  }
  
  getSocketMsg(type) {
    let payload = this.testCtx.fixture.page.wsMsgs[type];
    
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
    return this.testCtx.fixture.getCardsNav().getByRole('button', { name: 'Swap Card' });
  }
  
  getURLParts() {
    return new URL(this.testCtx.fixture.page.url());
  }
  
  getUser(name) {
    return this.testCtx.fixture.page.locator(`.users-list .user[data-name="${name}"]`);
  }
  
  async goOffline() {
    await this.testCtx.fixture.ctx.setOffline(true);
  }
  
  async goOnline() {
    await this.testCtx.fixture.ctx.setOffline(false);
  }
  
  async joinGame({ isFirst, name, screenshot }) {
    const dialog = await this.testCtx.fixture.getJoinDialog();
    await dialog.getByLabel('Enter Username').fill(name);
    
    if (screenshot) await this.testCtx.fixture.screenshot(`${screenshot} (name entered)`);
    
    await dialog.getByRole('button', { name: 'Join Game' }).click();
    await expect(
      dialog.locator('.join-form'),
      "should've closed Join Game dialog"
    ).not.toBeAttached();
    
    if (isFirst) {
      const opts = {};
      if (screenshot) opts.screenshot = `${screenshot} (host instructions)`;
      await this.testCtx.fixture.validateHostInstructions(opts);
    }
    
    if (screenshot) await this.testCtx.fixture.screenshot(`${screenshot} (added to list)`);
  }
  
  async loadRoom(str) {
    const route = (str)
      ? (str.startsWith('http')) ? str : `/${str}`
      : '';
    await this.testCtx.fixture.page.goto(route);
  }
  
  async openHostMenu(name) {
    await this.testCtx.fixture.getUser(name).click();
    return await this.testCtx.fixture.waitForDialog('.user-data-menu');
  }
  
  async openGameMenu() {
    await this.testCtx.fixture.page
      .locator('.top-nav')
      .getByRole('button', { name: 'Menu' })
      .click();
    return await this.testCtx.fixture.waitForDialog('.game-menu');
  }
  
  async readClipboard() {
    await this.testCtx.fixture.ctx.grantPermissions(['clipboard-read']);
    const handle = await this.testCtx.fixture.page.evaluateHandle(() => navigator.clipboard.readText());
    const txt = await handle.jsonValue();
    await handle.dispose();
    return txt;
  }
  
  async removeUser({ screenshot, user }) {
    const menu = await this.testCtx.fixture.openHostMenu(user);
    const btn = this.testCtx.fixture.getRemoveUserBtn(menu, user);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    await expect(this.testCtx.fixture.getUser(user)).not.toBeAttached();
    
    if (screenshot) await this.testCtx.fixture.screenshot(screenshot, '.users-list');
  }
  
  async screenshot(name, loc) {
    const _loc = (typeof loc === 'string') ? this.testCtx.fixture.page.locator(loc) : loc; 
    if (!screenshotNdxs[this.testCtx.fixture.ndxKey]) screenshotNdxs[this.testCtx.fixture.ndxKey] = 1;
    
    const screenshotNdx = screenshotNdxs[this.testCtx.fixture.ndxKey];
    const formattedName = `${`${this.testCtx.fixture.shotNamePrefix}_${pad(screenshotNdx)}__${name}`.toLowerCase().replace(/\s/g, '-')}`;
    const filename = `${PATH__REL_SCREENSHOTS}/${formattedName}.jpg`;
    
    screenshotNdxs[this.testCtx.fixture.ndxKey] += 1;
    
    const el = (_loc) ? _loc : this.testCtx.fixture.page;
    const img = await el.screenshot({
      animations: 'disabled', // stops CSS animations, CSS transitions and Web Animations.
      fullPage: !_loc,
      path: filename,
      quality: 90,
      type: 'jpeg',
    });
    this.testInfo.attach(formattedName, {
      body: img,
      contentType: 'image/jpeg',
    });
  }
  
  async showAnswers() {
    const nav = this.testCtx.fixture.getAnswerNav();
    
    await expect(
      this.testCtx.fixture.getPrevAnswerBtn(),
      "Previous answer button should not be visible"
    ).toHaveClass(/\bhidden\b/);
    await expect(
      this.testCtx.fixture.getNextAnswerBtn(),
      "Next answer button should not be visible"
    ).toHaveClass(/\bhidden\b/);
    await expect(
      this.testCtx.fixture.getPickAnswerBtn(),
      "Pick answer button should be disabled"
    ).toBeDisabled();
    await nav.locator('.show-answer-btn').click();
    await expect(
      this.testCtx.fixture.getPickAnswerBtn(),
      "Pick answer button should be enabled when reviewing answers"
    ).toBeEnabled();
  }
  
  async startWithUsers(users, freshPage) {
    const _users = [...users];
    
    if (freshPage) {
      await this.testCtx.fixture.createPage();
      await this.testCtx.fixture.switchToPage(this.testCtx.fixtures.length);
    }
    
    await this.testCtx.fixture.loadRoom();
    await this.testCtx.fixture.createGame();
    await this.testCtx.fixture.joinGame({ isFirst: true, name: _users.shift() });
    const menuDialog = await this.testCtx.fixture.openGameMenu();
    const gameURL = await this.testCtx.fixture.copyGameURL(menuDialog);
    
    for (let i=0; i<_users.length; i++) {
      const name = _users[i];
      await this.testCtx.fixture.createPage();
      await this.testCtx.fixture.switchToPage(this.testCtx.fixtures.length);
      await this.testCtx.fixture.loadRoom(gameURL);
      await this.testCtx.fixture.joinGame({ name });
    }
  }
  
  async submitWhiteCards({ blackCard, chosenCards, screenshot }) {
    const userCards = this.testCtx.fixture.page.locator('.user-cards');
    const selectMultiple = chosenCards.length > 1;
    
    for (let i=0; i<chosenCards.length; i++) {
      const cardText = (await this.testCtx.fixture.decodeHTML(chosenCards[i]));
      const card = userCards.locator(`.card:has-text("${cardText.replace(/"/g, "\\\"")}")`);
      
      await expect(card, "card should be enabled before selection").toBeEnabled();
      await expect(card).toHaveClass(/\bis--selectable\b/);
      await expect(card).not.toHaveClass(/\bis--selected\b/);
      await card.click();
      await expect(card, "card should be disabled after selection").toBeDisabled();
      await expect(card).not.toHaveClass(/\bis--selectable\b/);
      await expect(card).toHaveClass(/\bis--selected\b/);
      
      const answerCard = this.testCtx.fixture.page
        .locator('.answers-wrapper.displaying-users-cards .card.is--white.is--selectable')
        .nth(i);
      await expect(answerCard).toHaveText(`(white card) ${cardText}`);
      
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
    
    if (blackCard) {
      await this.testCtx.fixture.validateAnswerFormatting(blackCard, chosenCards);
      if (screenshot) await this.testCtx.fixture.screenshot(`${screenshot}--preview-answers`, '.answers');
    }
    
    await this.testCtx.fixture.page.locator('.submit-cards-btn').click();
    await expect(userCards, "User's cards should not be visible after they've submitted answers").not.toBeAttached();
    const localUser = this.testCtx.fixture.getLocalUser('.cards-submitted');
    const animName = await localUser.evaluate((el) => {
      return window.getComputedStyle(el, '::after').getPropertyValue('animation-name');
    });
    await expect(animName).toMatch(/.*showCard$/);
    
    if (screenshot) await this.testCtx.fixture.screenshot(screenshot, '.game-ui');
  }
  
  async swapMaxCards() {
    const SELECTOR__WHITE_CARDS = '.user-cards .card.is--white.is--selectable';
    const SELECTOR__SWAPPABLE = '.is--swappable';
    
    let points = await this.testCtx.fixture.getLocalUserPoints();
    
    await this.testCtx.fixture.screenshot("pre-swap cards");
    
    for (let i=0; i<points; i++) {
      await this.testCtx.fixture.getSwapCardBtn().click();
      
      let card = this.testCtx.fixture.page.locator(`${SELECTOR__WHITE_CARDS}${SELECTOR__SWAPPABLE}`).nth(0);
      const cardText1 = await card.evaluate(el => el.textContent);
      await card.click();
      
      card = this.testCtx.fixture.page.locator(`${SELECTOR__WHITE_CARDS}:not(${SELECTOR__SWAPPABLE})`).nth(0);
      const cardText2 = await card.evaluate(el => el.textContent);
      await expect(cardText2).not.toBe(cardText1);
      
      await this.testCtx.fixture.screenshot("swapped card");
    }
    
    points = await this.testCtx.fixture.getLocalUserPoints();
    await expect(points).toBe(0);
    await expect(this.testCtx.fixture.getSwapCardBtn()).not.toBeAttached();
    await expect(this.testCtx.fixture.getCancelCardSwapBtn()).not.toBeAttached();
    
    await this.testCtx.fixture.screenshot("swapped available points for cards");
  }
  
  async switchToPage(pageNum) {
    this.testCtx.fixture = this.testCtx.fixtures[pageNum - 1];
    await this.testCtx.fixture.page.bringToFront();
    await expect(this.testCtx.fixture.page.locator('body')).toBeAttached();
  }
  
  async validateHostInstructions({ screenshot }) {
    const dialog = await this.testCtx.fixture.waitForDialog('.host-instructions');
    const instructions = dialog.locator('p');
    await expect(instructions.nth(0)).toHaveText("As the Host, you're running the game. In order for others to join, just send them");
    await expect(instructions.nth(1)).toHaveText("When starting a new CAH game it's up to the group to choose the Card Czar. Y'all can do that via the typical Who was the last to poop? question, or by what ever means you choose.");
    await expect(instructions.nth(2)).toHaveText("Once the group's chosen the Czar, you just have to click on that User and choose Make <User> the Czar. Once you do so, the game will start.");
    await this.testCtx.fixture.copyGameURL(dialog);
    await this.testCtx.fixture.copyGameCode(dialog);
    if (screenshot) await this.testCtx.fixture.screenshot(screenshot);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(
      dialog,
      "should've closed Host instructions"
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
      this.testCtx.fixture.getBlackCard(inDialog),
      "black card should have gaps replaced with answer text"
    ).toHaveText(await this.testCtx.fixture.decodeHTML(expected));
  }
  
  async validateCards({ blackCard, whiteCards }) {
    const answers = this.testCtx.fixture.page.locator('.cards .answers');
    const userCards = this.testCtx.fixture.page.locator('.cards .user-cards');
    
    let cards = answers.locator('.card');
    await expect(cards).toHaveCount(1);
    let card = cards.nth(0);
    await expect(card).toHaveClass(/\bis--black\b/);
    await expect(card).toHaveText(`(black card) ${await this.testCtx.fixture.decodeHTML(blackCard)}`);
    
    if (whiteCards) {
      cards = userCards.locator('.card');
      await expect(cards).toHaveCount(10);
      const cardsCount = await cards.count();
      for (let i=0; i<cardsCount; i++) {
        card = cards.nth(i);
        await expect(card).toHaveClass(/\bis--white\b/);
        await expect(card).toHaveText(`(white card) ${await this.testCtx.fixture.decodeHTML(whiteCards[i])}`);
      }
    }
    else {
      const waitingMsg = this.testCtx.fixture.page.locator('.czar-waiting-msg');
      const userNames = await this.testCtx.fixture.page
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
    const dialog = await this.testCtx.fixture.waitForDialog();
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
    await expect(this.testCtx.fixture.page.locator(loc), note).toHaveText(msg);
  }
  
  async validatePointsMsg({ answers, blackCard, points, screenshot, user, winner }) {
    const dialog = await this.testCtx.fixture.waitForDialog('.points-awarded');
    
    if (winner) {
      await expect(this.testCtx.fixture.page.locator('.dialog-wrapper .confetti')).toBeAttached();
      // TODO: check if audio play(ing/ed). Haven't found anything that allows for this check
    }
    
    await expect(dialog.locator('.points-awarded__msg')).toHaveText(`${winner ? 'You' : user} got ${points} point${(points > 1 ? 's' : '')} for`);
    await this.testCtx.fixture.validateAnswerFormatting(blackCard, answers, true);
    if (screenshot) await this.testCtx.fixture.screenshot(screenshot);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeAttached();
  }
  
  async validateSwappable() {
    const SELECTOR__WHITE_CARDS = '.user-cards .card.is--white.is--selectable';
    const SELECTOR__SWAPPABLE = '.is--swappable';
    
    await expect(
      await this.testCtx.fixture.getLocalUserPoints(),
      "should have at least one point for swapping to be enabled"
    ).toBeGreaterThan(0);
    
    const swapBtn = this.testCtx.fixture.getSwapCardBtn();
    await expect(
      swapBtn,
      "ability to swap cards should be enabled"
    ).toBeAttached();
    await swapBtn.click();
    const swappableCards = this.testCtx.fixture.page.locator(`${SELECTOR__WHITE_CARDS}${SELECTOR__SWAPPABLE}`);
    await expect(
      swappableCards,
      "all cards should be swappable"
    ).toHaveCount(10);
    
    const cancelSwapBtn = this.testCtx.fixture.getCancelCardSwapBtn();
    await expect(
      cancelSwapBtn,
      "ability to cancel swapping cards should be enabled"
    ).toBeAttached();
    await cancelSwapBtn.click();
    const unSwappableCards = this.testCtx.fixture.page.locator(`${SELECTOR__WHITE_CARDS}:not(${SELECTOR__SWAPPABLE})`);
    await expect(
      unSwappableCards,
      "all cards should be not be swappable"
    ).toHaveCount(10);
  }
  
  async validateTooltip({ id, msg, note }) {
    await this.testCtx.fixture.page.locator(`button[popovertarget="${id}"]`).click();
    await expect(
      this.testCtx.fixture.page.locator(`[popover][role="tooltip"][id="${id}"]`),
      note
    ).toHaveText(msg);
  }
  
  async valitateUser({ czar, disconnected, host, name, points, screenshot, status }) {
    const userEl = this.testCtx.fixture.getUser(name);
    let userIcon;
    
    if (host) {
      await expect(userEl).toHaveClass(/\bis--host\b/);
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
      await this.testCtx.fixture.waitForAnimations(statusEl);
      await expect(
        await this.testCtx.fixture.getBGColor(statusEl),
        "should display User status color"
      ).toEqual(status);
    }
    
    if (screenshot) await this.testCtx.fixture.screenshot(screenshot, '.users-list');
  }
  
  async valitateUserRemoved({ name, screenshot }) {
    const user = this.testCtx.fixture.getUser(name);
    await expect(user).not.toBeAttached({ timeout: DISCONNECT_TIMEOUT });
    if (screenshot) await this.testCtx.fixture.screenshot(screenshot, this.testCtx.fixture.page.locator('.users-list'));
  }
  
  async validateUserMenu({ btns, screenshot, user }) {
    const menu = await this.testCtx.fixture.openHostMenu(user);
    const cancelBtn = menu.getByRole('button', { name: 'Close' });
    
    for (const [ key, { caption, enabled } ] of Object.entries(btns)) {
      let btnEl;
      
      switch (key) {
        case 'czar': {
          btnEl = this.testCtx.fixture.getAssignCzarBtn(menu, user);
          break;
        }
        case 'mc': {
          btnEl = this.testCtx.fixture.getAssignMCBtn(menu, user);
          break;
        }
        case 'remove': {
          btnEl = this.testCtx.fixture.getRemoveUserBtn(menu, user);
          break;
        }
      }
      
      if (enabled) await expect(btnEl).toBeEnabled();
      else await expect(btnEl).toBeDisabled();
      
      if (caption) await expect(btnEl.locator(' + .help')).toHaveText(caption);
    }
    
    if (screenshot) await this.testCtx.fixture.screenshot(screenshot);
    
    await cancelBtn.click();
    await expect(menu).not.toBeAttached();
  }
  
  async validateUserOrder({ screenshot, userNames }) {
    const users = this.testCtx.fixture.page.locator('.users-list .user.is--connected');
    const usersCount = await users.count();
    
    await expect(usersCount).toEqual(userNames.length);
    
    for (let i=0; i<usersCount; i++) {
      await expect(users.nth(i)).toHaveAttribute('data-name', userNames[i]);
    }
    
    if (screenshot) await this.testCtx.fixture.screenshot(screenshot, this.testCtx.fixture.page.locator('.users-list'));
  }
  
  async validateUserPoints({ screenshot, users }) {
    const usersLoc = this.testCtx.fixture.page.locator('.users-list .user');
    const usersCount = await usersLoc.count();
    
    for (let i=0; i<usersCount; i++) {
      const user = usersLoc.nth(i);
      const uName = await user.locator('.user__name').evaluate((el) => el.textContent);
      await expect(
        user.locator('.user__points'),
        "should display the User's current points"
      ).toHaveText(`${users[uName].points}`);
    }
    
    if (screenshot) await this.testCtx.fixture.screenshot(screenshot, this.testCtx.fixture.page.locator('.users-list'));
  }
  
  async viewNextAnswer() {
    await this.testCtx.fixture.getNextAnswerBtn().click();
  }
  
  async viewPrevAnswer() {
    await this.testCtx.fixture.getPrevAnswerBtn().click();
  }
  
  async waitForDialog(selector) {
    const dialog = this.testCtx.fixture.page.locator('.dialog');
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
    await this.testCtx.fixture.ctx.grantPermissions(['clipboard-write']);
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
    const testCtx = {
      fixture: undefined,
      fixtures: [],
    };
    const game = new GameFixture({ browser, context, page, testCtx, testInfo });
    await use(game);
    
    // [ after test ] ==========================================================
  },
});

export { expect };
