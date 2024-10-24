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
    await currFixture.valitateUser({ czar: false, name: userBName, status: STATUS__DEFAULT });
    
    const menu = await currFixture.openAdminMenu(userBName);
    const btn = currFixture.getAssignCzarBtn(menu, userBName);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    await currFixture.valitateUser({ czar: true, name: userBName, status: STATUS__ACTIVE });
    
    // TODO check `from`, then click, verify from not assigned
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
  
  async closePage() {
    // TODO
    // // Gracefully close up everything
    // await context.close();
    // await browser.close();
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
  
  async getBGColor(loc) {
    return await loc.evaluate((el) => {
      const rgb = window.getComputedStyle(el).getPropertyValue('background-color');
      return `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;
    });
  }
  
  getAssignCzarBtn(menu, user) {
    return menu.getByRole('button', { name: `Make ${user} the Czar` });
  }
  
  getAssignMCBtn(menu, user) {
    return menu.getByRole('button', { name: `Make ${user} the MC` });
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
  
  async startWithUsers(users) {
    const _users = [...users];
    
    await currFixture.loadRoom();
    await currFixture.createGame();
    await currFixture.joinGame({ isFirst: true, name: _users.shift() });
    const menuDialog = await currFixture.openGameMenu();
    const gameURL = await currFixture.copyGameURL(menuDialog);
    
    for (let i=0; i<_users.length; i++) {
      const name = _users[i];
      await currFixture.createPage();
      await currFixture.switchToPage(2);
      await currFixture.loadRoom(gameURL);
      await currFixture.joinGame({ name });
    }
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
  
  async validateCards({ blackCard, whiteCards }) {
    const answers = currFixture.page.locator('.cards .answers');
    const userCards = currFixture.page.locator('.cards .user-cards');
    
    let cards = answers.locator('.card');
    await expect(cards).toHaveCount(1);
    let card = cards.nth(0);
    await expect(card).toHaveClass(/is--black/);
    await expect(card).toHaveText( await currFixture.decodeHTML(blackCard) );
    
    if (whiteCards) {
      cards = userCards.locator('.card');
      await expect(cards).toHaveCount(10);
      const cardsCount = await cards.count();
      for (let i=0; i<cardsCount; i++) {
        card = cards.nth(i);
        await expect(card).toHaveClass(/is--white/);
        await expect(card).toHaveText( await currFixture.decodeHTML(whiteCards[i]) );
      }
    }
    else {
      const waitingMsg = currFixture.page.locator('.czar-waiting-msg');
      const [ userA, userB ] = await currFixture.page
        .locator('.users-list .user:not(.is--czar)')
        .evaluateAll(els => els.map((el) => el.dataset.name));
      await expect(waitingMsg).toHaveText(`Waiting for ${userA}, and ${userB} to submit their answers.`);
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
  
  async validateTooltip({ id, msg, note }) {
    await currFixture.page.locator(`button[popovertarget="${id}"]`).click();
    await expect(
      currFixture.page.locator(`[popover][role="tooltip"][id="${id}"]`),
      note
    ).toHaveText(msg);
  }
  
  async valitateUser({ admin, czar, disconnected, name, points, status }) {
    const userEl = currFixture.getUser(name);
    let userIcon;
    
    if (admin) {
      await expect(userEl).toHaveClass(/is--admin/);
      userIcon = 'ui-icon__star';
    }
    else if (czar) {
      await expect(userEl).toHaveClass(/is--czar/);
      userIcon = 'ui-icon__crown';
    }
    
    if (disconnected) {
      await expect(userEl).not.toHaveClass(/is--connected/, { timeout: 5000 });
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
  }
  
  async valitateUserRemoved({ name, screenshot }) {
    const user = currFixture.getUser(name);
    await expect(user).not.toBeAttached({ timeout: DISCONNECT_TIMEOUT });
    if (screenshot) currFixture.screenshot(screenshot, currFixture.page.locator('.users-list'));
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
    const users = currFixture.page.locator('.users-list .user');
    const usersCount = await users.count();
    
    await expect(usersCount).toEqual(userNames.length);
    
    for (let i=0; i<usersCount; i++) {
      await expect(users.nth(i)).toHaveAttribute('data-name', userNames[i]);
    }
    
    if (screenshot) await currFixture.screenshot(screenshot, currFixture.page.locator('.users-list'));
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
