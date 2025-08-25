import {
  DISCONNECT_TIMEOUT,
  WS__MSG__CARDS_DEALT,
} from '@src/constants'; // eslint-disable-line n/no-missing-import
import BaseFixture, { createTest, expect } from './BaseFixture';

export const STATUS__ACTIVE = '#27cfb6';
export const STATUS__DEFAULT = '#393939';
export const STATUS__DISCONNECTED = '#ffff00';
const transformAnswerText = (txt) => txt.trim().replace(/\.$/, '');

export class AppFixture extends BaseFixture {
  constructor({ browser, context, page, testCtx, testInfo }) {
    super({ browser, context, page, testCtx, testInfo, useWS: true });
    
    page.wsMsgs = {};
    page.on('websocket', (ws) => {
      ws.on('framereceived', ({ payload }) => {
        const { data, type } = JSON.parse(payload);
        if (type !== 'pong') page.wsMsgs[type] = data;
      });
    });
  }
  
  static chooseCards(cards, name, required) {
    return cards[name].filter((card, ndx) => (ndx + 1) <= required);
  }
  
  async assignCzar({ from: userAName, to: userBName }) {
    if (userAName) await this.verifyUser({ czar: true, name: userAName, status: STATUS__ACTIVE });
    await this.verifyUser({ czar: false, name: userBName, status: STATUS__DEFAULT });
    
    const menu = await this.openHostMenu(userBName);
    const btn = this.getAssignCzarBtn(menu, userBName);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    if (userAName) await this.verifyUser({ czar: false, name: userAName, status: STATUS__DEFAULT });
    await this.verifyUser({ czar: true, name: userBName, status: STATUS__ACTIVE });
  }
  
  async assignMC({ from: userAName, to: userBName }) {
    await this.verifyUser({ host: true, name: userAName });
    await this.verifyUser({ host: false, name: userBName });
    
    const menu = await this.openHostMenu(userBName);
    const btn = this.getAssignMCBtn(menu, userBName);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    await this.verifyUser({ host: false, name: userAName });
    await this.verifyUser({ host: true, name: userBName });
  }
  
  async closePage(pageNum, { waitForUserRemoval } = {}) {
    await super.closePage(pageNum);
    
    if (waitForUserRemoval) {
      const user = this.getUser(waitForUserRemoval);
      await expect(
        user,
        `'${waitForUserRemoval}' should be removed after disconnect`
      ).not.toBeAttached({ timeout: DISCONNECT_TIMEOUT + 1000 });
    }
  }
  
  async closePointsAwarded() {
    const dialog = await this.waitForDialog('.points-awarded');
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeAttached();
  }
  
  async copyGameCode(el) {
    await el.locator('.copyable-item.for--code').click();
    const gameCode = await this.readClipboard();
    await expect(
      gameCode,
      'should copy the room code to the clipboard'
    ).toEqual(this.getRoomCode());
    return gameCode;
  }
  
  async copyGameURL(el) {
    await el.locator('.copyable-item.for--url').click();
    const gameURL = await this.readClipboard();
    expect(
      gameURL,
      "should copy the room's URL to the clipboard"
    ).toMatch(new RegExp(`https://.*:3000/${this.getRoomCode()}`));
    return gameURL;
  }
  
  async createGame({ screenshots } = {}) {
    await this.waitForDialog();
    const { createBtn } = await this.verifyGameEntry();
    if (screenshots) await this.screenshot('game entry');
    
    const { pathname: oldPath } = this.getURLParts();
    const navPromise = this.fx.page.waitForNavigation();
    await createBtn.click();
    await navPromise;
    const { pathname: newPath } = this.getURLParts();
    expect(oldPath).not.toEqual(newPath);
    if (screenshots) await this.screenshot('new room created');
  }
  
  async decodeHTML(rawTxt) {
    // NOTE: There are cards with HTML entities (`A gerbil named &quot;Gerbil&quot;.`),
    // so when comparing the raw WS data against what's in the DOM, errors will
    // occur unless decoded.
    return await this.fx.page.evaluate((str) => {
      const el = document.createElement('div');
      el.innerHTML = str;
      return el.textContent;
    }, rawTxt);
  }
  
  async findCzar() {
    return await this
      .getEl('.users-list .user.is--czar .user__name')
      .textContent();
  }
  
  getAnswerNav() {
    return this.getEl('.black-card-wrapper .card.is--black + nav');
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
    return this.getEl(`${par} .card.is--black .card__text`);
  }
  
  async getBlackCardAnswers() {
    return await this.getBlackCard()
      .locator('.answer')
      .evaluateAll((els) => els.map(el => el.textContent));
  }
  
  getCardsNav() {
    return this.getEl('.cards-nav');
  }
  
  getCancelCardSwapBtn() {
    return this.getCardsNav().getByRole('button', { name: 'Cancel Card Swap' });
  }
  
  getDealtCards() {
    const {
      room: { blackCard, requiredWhiteCardsCount, users },
    } = this.fx.page.wsMsgs[WS__MSG__CARDS_DEALT];
    
    return {
      blackCard,
      required: requiredWhiteCardsCount,
      whiteCards: users.reduce((obj, { cards, name }) => {
        obj[name] = cards.map(({ text }) => text);
        return obj;
      }, {}),
    };
  }
  
  async getJoinDialog() {
    return await this.waitForDialog('.join-form');
  }
  
  getLocalUser(extraSelector = '') {
    return this.getEl(`.user.is--local${extraSelector}`);
  }
  
  async getLocalUserPoints() {
    const localUser = this.getLocalUser();
    return +(await localUser.locator('.user__points').textContent());
  }
  
  getNextAnswerBtn() {
    return this.getAnswerNav().locator('.next-btn');
  }
  
  async getOrderedUsers(otherUsers, users) {
    const answers = await this.getBlackCardAnswers();
    
    // NOTE: The order of answers is shuffled server-side before the Czar
    // chooses, so find the User associated with the current first choice since
    // the test always picks the first, and return the remaining items for
    // notification validation.
    const { chosen, rest } = otherUsers.reduce((obj, uName) => {
      const { chosenCards } = users[uName];
      if (transformAnswerText(chosenCards[0]) === answers[0]) obj.chosen = uName;
      else obj.rest.push(uName);
      return obj;
    }, { rest: [] });
    
    return [chosen, ...rest];
  }
  
  getPickAnswerBtn() {
    return this.getAnswerNav().locator('.pick-answer-btn');
  }
  
  getPrevAnswerBtn() {
    return this.getAnswerNav().locator('.prev-btn');
  }
  
  getRemoveUserBtn(menu, user) {
    return menu.getByRole('button', { name: `Remove ${user} from game` });
  }
  
  getRoomCode() {
    return this.getURLParts().pathname.replace(/^\//, '');
  }
  
  getSwapCardBtn() {
    return this.getCardsNav().getByRole('button', { name: 'Swap Card' });
  }
  
  getURLParts() {
    return new URL(this.fx.page.url());
  }
  
  getUser(name) {
    return this.getEl(`.users-list .user[data-name="${name}"]`);
  }
  
  async joinGame({ isFirst, name, screenshot }) {
    const dialog = await this.getJoinDialog();
    await dialog.getByLabel('Enter Username').fill(name);
    
    if (screenshot) await this.screenshot(`${screenshot} (name entered)`);
    
    await dialog.getByRole('button', { name: 'Join Game' }).click();
    await expect(
      dialog.locator('.join-form'),
      "should've closed Join Game dialog"
    ).not.toBeAttached();
    
    if (isFirst) {
      const opts = {};
      if (screenshot) opts.screenshot = `${screenshot} (host instructions)`;
      await this.verifyHostInstructions(opts);
    }
    
    if (screenshot) await this.screenshot(`${screenshot} (added to list)`);
  }
  
  async loadRoom(str) {
    const route = (str)
      ? (str.startsWith('http')) ? str : `/${str}`
      : '';
    await this.fx.page.goto(route);
    await expect(this.getEl('body')).toContainClass('route-loaded');
  }
  
  async openHostMenu(name) {
    await this.getUser(name).click();
    return await this.waitForDialog('.user-data-menu');
  }
  
  async openGameMenu() {
    await this.getEl('.top-nav')
      .getByRole('button', { name: 'Menu' })
      .click();
    return await this.waitForDialog('.game-menu');
  }
  
  async removeUser({ screenshot, user }) {
    const menu = await this.openHostMenu(user);
    const btn = this.getRemoveUserBtn(menu, user);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    await expect(this.getUser(user)).not.toBeAttached();
    
    if (screenshot) await this.screenshot(screenshot, '.users-list');
  }
  
  async showAnswers() {
    const nav = this.getAnswerNav();
    
    await expect(
      this.getPrevAnswerBtn(),
      'Previous answer button should not be visible'
    ).toHaveClass(/\bhidden\b/);
    await expect(
      this.getNextAnswerBtn(),
      'Next answer button should not be visible'
    ).toHaveClass(/\bhidden\b/);
    await expect(
      this.getPickAnswerBtn(),
      'Pick answer button should be disabled'
    ).toBeDisabled();
    await nav.locator('.show-answer-btn').click();
    await expect(
      this.getPickAnswerBtn(),
      'Pick answer button should be enabled when reviewing answers'
    ).toBeEnabled();
  }
  
  async startWithUsers(users, freshPage) {
    const _users = [...users];
    
    if (freshPage) {
      await this.createPage();
      await this.switchToPage(this.testCtx.fixtures.length);
    }
    
    await this.loadRoom();
    await this.createGame();
    await this.joinGame({ isFirst: true, name: _users.shift() });
    const menuDialog = await this.openGameMenu();
    const gameURL = await this.copyGameURL(menuDialog);
    
    for (let i=0; i<_users.length; i++) {
      const name = _users[i];
      await this.createPage();
      await this.switchToPage(this.testCtx.fixtures.length);
      await this.loadRoom(gameURL);
      await this.joinGame({ name });
    }
  }
  
  async submitWhiteCards({ blackCard, chosenCards, screenshot }) {
    const userCards = this.getEl('.user-cards');
    const selectMultiple = chosenCards.length > 1;
    
    for (let i=0; i<chosenCards.length; i++) {
      const cardText = (await this.decodeHTML(chosenCards[i]));
      const card = userCards.locator(`.card:has-text("${cardText.replace(/"/g, '\\"')}")`);
      
      await expect(card, 'card should be enabled before selection').toBeEnabled();
      await expect(card).toContainClass('is--selectable');
      await expect(card).not.toContainClass('is--selected');
      await card.click();
      await expect(card, 'card should be disabled after selection').toBeDisabled();
      await expect(card).not.toContainClass('is--selectable');
      await expect(card).toContainClass('is--selected');
      
      const answerCard = this
        .getEl('.answers-wrapper.displaying-users-cards .card.is--white.is--selectable')
        .nth(i);
      await expect(answerCard).toHaveText(`(white card) ${cardText}`);
      
      if (selectMultiple) {
        if (i < chosenCards.length - 1) {
          await expect(
            userCards,
            'cards should still be selectable when all required cards have not been selected'
          ).not.toContainClass('disabled');
        }
        else {
          await expect(
            userCards,
            'no cards should be selectable after required cards selected'
          ).toContainClass('disabled');
        }
      }
      else {
        await expect(
          userCards,
          'no cards should be selectable after required cards selected'
        ).toContainClass('disabled');
      }
    }
    
    if (blackCard) {
      await this.verifyAnswerFormatting(blackCard, chosenCards);
      if (screenshot) await this.screenshot(`${screenshot}--preview-answers`, '.answers');
    }
    
    await this.getEl('.submit-cards-btn').click();
    await expect(userCards, "User's cards should not be visible after they've submitted answers").not.toBeAttached();
    const localUser = this.getLocalUser('.cards-submitted');
    const animName = await localUser.evaluate((el) => {
      return window.getComputedStyle(el, '::after').getPropertyValue('animation-name');
    });
    await expect(animName).toMatch(/.*showCard$/);
    
    if (screenshot) await this.screenshot(screenshot, '.game-ui');
  }
  
  async swapMaxCards() {
    const SELECTOR__WHITE_CARDS = '.user-cards .card.is--white.is--selectable';
    const SELECTOR__SWAPPABLE = '.is--swappable';
    
    let points = await this.getLocalUserPoints();
    
    await this.screenshot('pre-swap cards');
    
    for (let i=0; i<points; i++) {
      await this.getSwapCardBtn().click();
      
      let card = this.getEl(`${SELECTOR__WHITE_CARDS}${SELECTOR__SWAPPABLE}`).nth(0);
      const cardText1 = await card.textContent();
      await card.click();
      
      card = this.getEl(`${SELECTOR__WHITE_CARDS}:not(${SELECTOR__SWAPPABLE})`).nth(0);
      await expect(card).not.toHaveText(cardText1);
      
      await this.screenshot('swapped card');
    }
    
    points = await this.getLocalUserPoints();
    await expect(points).toBe(0);
    await expect(this.getSwapCardBtn()).not.toBeAttached();
    await expect(this.getCancelCardSwapBtn()).not.toBeAttached();
    
    await this.screenshot('swapped available points for cards');
  }
  
  async verifyHostInstructions({ screenshot }) {
    const dialog = await this.waitForDialog('.host-instructions');
    const instructions = dialog.locator('p');
    await expect(instructions.nth(0)).toHaveText("As the Host, you're running the game. In order for others to join, just send them");
    await expect(instructions.nth(1)).toHaveText("When starting a new CAH game it's up to the group to choose the Card Czar. Y'all can do that via the typical Who was the last to poop? question, or by what ever means you choose.");
    await expect(instructions.nth(2)).toHaveText("Once the group's chosen the Czar, you just have to click on that User and choose Make <User> the Czar. Once you do so, the game will start.");
    await this.copyGameURL(dialog);
    await this.copyGameCode(dialog);
    if (screenshot) await this.screenshot(screenshot);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(
      dialog,
      "should've closed Host instructions"
    ).not.toBeAttached();
  }
  
  async verifyAnswerFormatting(blackCard, answers, inDialog = false) {
    let ndx = 0;
    const expected = blackCard.replaceAll('__________', () => {
      const a = transformAnswerText(answers[ndx]);
      ndx += 1;
      return a;
    });
    
    await expect(
      this.getBlackCard(inDialog),
      'black card should have gaps replaced with answer text'
    ).toHaveText(await this.decodeHTML(expected));
  }
  
  async verifyCards({ blackCard, whiteCards }) {
    const answers = this.getEl('.cards .answers');
    const userCards = this.getEl('.cards .user-cards');
    
    let cards = answers.locator('.card');
    await expect(cards).toHaveCount(1);
    let card = cards.nth(0);
    await expect(card).toContainClass('is--black');
    await expect(card).toHaveText(`(black card) ${await this.decodeHTML(blackCard)}`);
    
    if (whiteCards) {
      cards = userCards.locator('.card');
      await expect(cards).toHaveCount(10);
      for (const [ ndx, card ] of (await cards.all()).entries()) {
        await expect(card).toContainClass('is--white');
        await expect(card).toHaveText(`(white card) ${await this.decodeHTML(whiteCards[ndx])}`);
      }
    }
    else {
      const waitingMsg = this.getEl('.czar-waiting-msg');
      const userNames = await this
        .getEl('.users-list .user:not(.is--czar):not(.cards-submitted)')
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
  
  async verifyGameEntry() {
    const dialog = await this.waitForDialog();
    const rows = dialog.locator('.row');
    const codeRow = rows.nth(0);
    const codeLabel = codeRow.locator('label');
    const codeInput = codeLabel.locator('input');
    const codeBtn = codeRow.locator('button');
    const createRow = rows.nth(1);
    const createLabel = await createRow.evaluate(el => el.childNodes[0].textContent); // text node
    const createBtn = createRow.locator('button');
    
    await expect(
      async () => {
        await expect(rows).toHaveCount(2);
        
        await expect(codeLabel).toContainText('Enter code');
        await expect(codeInput).toHaveValue('');
        await expect(codeBtn).toHaveText('Go');
        
        expect(createLabel).toContain('Or');
        await expect(createBtn).toHaveText('Create Game');
      },
      'should provide User with options to enter a new room code or create a new one'
    ).toPass({ timeout: 1000 });
    
    return { codeBtn, codeInput, createBtn };
  }
  
  async verifyPendingMsg({ loc, msg, note }) {
    await expect(this.getEl(loc), note).toHaveText(msg);
  }
  
  async verifyPointsMsg({ answers, blackCard, points, screenshot, user, winner }) {
    const dialog = await this.waitForDialog('.points-awarded');
    
    if (winner) {
      await expect(this.getEl('.dialog-wrapper .confetti')).toBeAttached();
      // TODO: check if audio play(ing/ed). Haven't found anything that allows for this check
    }
    
    await expect(dialog.locator('.points-awarded__msg')).toHaveText(`${winner ? 'You' : user} got ${points} point${(points > 1 ? 's' : '')} for`);
    await this.verifyAnswerFormatting(blackCard, answers, true);
    if (screenshot) await this.screenshot(screenshot);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeAttached();
  }
  
  async verifySubmittedAnswers(otherUsers) {
    await expect(
      this.getPrevAnswerBtn(),
      "'View previous answer' button should be disabled at start"
    ).toBeDisabled();
    await expect(
      this.getNextAnswerBtn(),
      "'View next answer' button should be enabled at start"
    ).toBeEnabled();
    
    // advance to the last submitted answer
    for (let i=0; i<otherUsers.length; i++) {
      if (i < otherUsers.length - 1) await this.viewNextAnswer();
    }
    
    await expect(
      this.getPrevAnswerBtn(),
      "'View previous answer' button should be enabled at end"
    ).toBeEnabled();
    await expect(
      this.getNextAnswerBtn(),
      "'View next answer' button should be disabled at end"
    ).toBeDisabled();
    
    // back to the first answer
    for (let i=0; i<otherUsers.length; i++) {
      if (i < otherUsers.length - 1) await this.viewPrevAnswer();
    }
    
    await expect(
      this.getPrevAnswerBtn(),
      "'View previous answer' button should be disabled"
    ).toBeDisabled();
    await expect(
      this.getNextAnswerBtn(),
      "'View next answer' button should be enabled"
    ).toBeEnabled();
  }
  
  async verifySwappable() {
    const SELECTOR__WHITE_CARDS = '.user-cards .card.is--white.is--selectable';
    const SELECTOR__SWAPPABLE = '.is--swappable';
    
    await expect(
      await this.getLocalUserPoints(),
      'should have at least one point for swapping to be enabled'
    ).toBeGreaterThan(0);
    
    const swapBtn = this.getSwapCardBtn();
    await expect(
      swapBtn,
      'ability to swap cards should be enabled'
    ).toBeAttached();
    await swapBtn.click();
    const swappableCards = this.getEl(`${SELECTOR__WHITE_CARDS}${SELECTOR__SWAPPABLE}`);
    await expect(
      swappableCards,
      'all cards should be swappable'
    ).toHaveCount(10);
    
    const cancelSwapBtn = this.getCancelCardSwapBtn();
    await expect(
      cancelSwapBtn,
      'ability to cancel swapping cards should be enabled'
    ).toBeAttached();
    await cancelSwapBtn.click();
    const unSwappableCards = this.getEl(`${SELECTOR__WHITE_CARDS}:not(${SELECTOR__SWAPPABLE})`);
    await expect(
      unSwappableCards,
      'all cards should be not be swappable'
    ).toHaveCount(10);
  }
  
  async verifyTooltip({ id, msg, note }) {
    await this.getEl(`button[popovertarget="${id}"]`).click();
    await expect(
      this.getEl(`[popover][role="tooltip"][id="${id}"]`),
      note
    ).toHaveText(msg);
  }
  
  async verifyUser({ czar, disconnected, host, name, points, screenshot, status }) {
    const userEl = this.getUser(name);
    let userIcon;
    
    if (host) {
      await expect(userEl).toContainClass('is--host');
      userIcon = 'ui-icon__star';
    }
    else if (czar) {
      await expect(userEl).toContainClass('is--czar');
      userIcon = 'ui-icon__crown';
    }
    
    if (disconnected) {
      await expect(userEl).not.toContainClass('is--connected', { timeout: 5000 });
      await expect(
        userEl.locator('.disconnect-indicator'),
        'should display animated icon that informs users when disconnected user will be removed'
      ).toBeAttached();
    }
    
    if (userIcon) {
      await expect(
        // NOTE: using `xlink:href` isn't valid, but `*|href` is.
        userEl.locator(`.user__icon .icon use[*|href="#${userIcon}"]`),
        'should display correct icon'
      ).toBeAttached();
    }
    
    if (name) {
      await expect(
        userEl.locator('.user__name'),
        'should display sanitized User name'
      ).toHaveText(name);
    }
    
    if (points) {
      await expect(
        userEl.locator('.user__points'),
        'should display starting points'
      ).toHaveText(points);
    }
    
    if (status) {
      const statusEl = (disconnected) ? userEl : userEl.locator('.user__status-indicator');
      await this.waitForAnimations(statusEl);
      await expect(async () => {
        const statusColor = await this.getBGColor(statusEl);
        expect(
          statusColor,
          'should display User status color'
        ).toEqual(status);
      }).toPass({ timeout: 3000 });
    }
    
    if (screenshot) await this.screenshot(screenshot, '.users-list');
  }
  
  async verifyUserRemoved({ name, screenshot }) {
    const user = this.getUser(name);
    await expect(user).not.toBeAttached({ timeout: DISCONNECT_TIMEOUT });
    if (screenshot) await this.screenshot(screenshot, this.getEl('.users-list'));
  }
  
  async verifyUserMenu({ btns, screenshot, user }) {
    const menu = await this.openHostMenu(user);
    const cancelBtn = menu.getByRole('button', { name: 'Close' });
    
    for (const [ key, { caption, enabled } ] of Object.entries(btns)) {
      let btnEl;
      
      switch (key) {
        case 'czar': {
          btnEl = this.getAssignCzarBtn(menu, user);
          break;
        }
        case 'mc': {
          btnEl = this.getAssignMCBtn(menu, user);
          break;
        }
        case 'remove': {
          btnEl = this.getRemoveUserBtn(menu, user);
          break;
        }
      }
      
      if (enabled) await expect(btnEl).toBeEnabled();
      else await expect(btnEl).toBeDisabled();
      
      if (caption) await expect(btnEl.locator(' + .help')).toHaveText(caption);
    }
    
    if (screenshot) await this.screenshot(screenshot);
    
    await cancelBtn.click();
    await expect(menu).not.toBeAttached();
  }
  
  async verifyUserOrder({ screenshot, userNames }) {
    const users = this.getEl('.users-list .user.is--connected');
    
    await expect(users).toHaveCount(userNames.length);
    
    for (const [ ndx, user ] of (await users.all()).entries()) {
      await expect(user).toHaveAttribute('data-name', userNames[ndx]);
    }
    
    if (screenshot) await this.screenshot(screenshot, this.getEl('.users-list'));
  }
  
  async verifyUserPoints({ screenshot, users }) {
    const usersLoc = this.getEl('.users-list .user');
    const userEls = await usersLoc.all();
    
    for (const user of userEls) {
      const uName = await user.locator('.user__name').textContent();
      await expect(
        user.locator('.user__points'),
        "should display the User's current points"
      ).toHaveText(`${users[uName].points}`);
    }
    
    if (screenshot) await this.screenshot(screenshot, this.getEl('.users-list'));
  }
  
  async viewNextAnswer() {
    await this.getNextAnswerBtn().click();
  }
  
  async viewPrevAnswer() {
    await this.getPrevAnswerBtn().click();
  }
}

export const test = createTest({ FxClass: AppFixture, fxKey: 'app' });
export { expect };
