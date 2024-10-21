import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import { test as base, expect } from '@playwright/test';
import { WS__MSG__CARDS_DEALT } from '@src/constants';

const PATH__REL_SCREENSHOTS = 'artifacts/screenshots';
const PATH__ABS_SCREENSHOTS = `/e2e/${PATH__REL_SCREENSHOTS}`;
export const STATUS__ACTIVE = '#27cfb6';
export const STATUS__DEFAULT = '#393939';
const exec = promisify(_exec);
const pad = (num) => `${num}`.padStart(2, '0');
const screenshotNdxs = {};

const genShotKeys = (testInfo) => {
  const testFileKey = testInfo.titlePath[0].replace(/\.test\.js$/, '');
  const testNameKey = `[${testInfo.titlePath[1]}][${testInfo.titlePath[2]}]`;
  
  return { testFileKey, testNameKey }; 
};
const genShotPrefix = ({ testFileKey, testNameKey }) => {
  return `${testFileKey}/${testNameKey}`.toLowerCase().replace(/\s/g, '-');
};

class GameFixture {
  constructor({ context, page, testInfo }) {
    this.ctx = context;
    this.currPage = page;
    this.pages = [page];
    
    const { testFileKey, testNameKey } = genShotKeys(testInfo);
    this.testFileKey = testFileKey;
    this.testNameKey = testNameKey;
    this.ndxKey = `${this.testFileKey}_${this.testNameKey}`;
    this.shotNamePrefix = genShotPrefix({ testFileKey, testNameKey });
    
    delete screenshotNdxs[this.ndxKey];
    
    this.addSocketListener(page);
  }
  
  async addSocketListener(page) {
    page.wsMsgs = {};
    page.on('websocket', (ws) => {
      ws.on('framereceived', ({ payload }) => {
        const { data, type } = JSON.parse(payload);
        if (type !== 'pong') page.wsMsgs[type] = data;
      });
    });
  }
  
  async assignCzar({ from: userAName, to: userBName }) {
    await this.valitateUser({ czar: false, name: userBName, status: STATUS__DEFAULT });
    
    const menu = await this.openAdminMenu(userBName);
    const btn = this.getAssignCzarBtn(menu, userBName);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    await this.valitateUser({ czar: true, name: userBName, status: STATUS__ACTIVE });
    
    // TODO check `from`, then click, verify from not assigned
  }
  
  async assignMC({ from: userAName, to: userBName }) {
    await this.valitateUser({ admin: true, name: userAName });
    await this.valitateUser({ admin: false, name: userBName });
    
    const menu = await this.openAdminMenu(userBName);
    const btn = this.getAssignMCBtn(menu, userBName);
    
    await btn.click();
    await expect(menu).not.toBeAttached();
    await this.valitateUser({ admin: false, name: userAName });
    await this.valitateUser({ admin: true, name: userBName });
  }
  
  async copyGameCode(el) {
    await el.locator('.copyable-item.for--code').click();
    const gameCode = await this.readClipboard();
    await expect(
      gameCode,
      "should copy the room code to the clipboard"
    ).toEqual(this.getRoomCode());
    return gameCode;
  }
  
  async copyGameURL(el) {
    await el.locator('.copyable-item.for--url').click();
    const gameURL = await this.readClipboard();
    await expect(
      gameURL,
      "should copy the room's URL to the clipboard"
    ).toEqual(`https://cahbox:3000/${this.getRoomCode()}`);
    return gameURL;
  }
  
  async createGame() {
    await this.waitForDialog();
    const { createBtn } = await this.validateGameEntry();
    await this.screenshot('game entry');
    
    const { pathname: oldPath } = this.getURLParts();
    const navPromise = this.currPage.waitForNavigation();
    await createBtn.click();
    await navPromise;
    const { pathname: newPath } = this.getURLParts();
    expect(oldPath).not.toEqual(newPath);
    await this.screenshot('new room created');
  }
  
  async createPage() {
    const newPage = await this.ctx.newPage();
    this.pages.push(newPage);
    this.addSocketListener(newPage);
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
    return this.getURLParts().pathname.replace(/^\//, '');
  }
  
  getSocketMsg(type) {
    let payload = this.currPage.wsMsgs[type];
    
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
    return new URL(this.currPage.url());
  }
  
  getUser(name) {
    return this.currPage.locator(`.users-list .user[data-name="${name}"]`);
  }
  
  async joinGame({ name, screenshot }) {
    const dialog = await this.waitForDialog('.join-form');
    await dialog.getByLabel('Enter Username').fill(name);
    
    if (screenshot) await this.screenshot(`${screenshot} 01`);
    
    await dialog.getByRole('button', { name: 'Join Game' }).click();
    await expect(
      dialog.locator('.join-form'),
      "should've closed Join Game dialog"
    ).not.toBeAttached();
    
    if (screenshot) await this.screenshot(`${screenshot} 02`);
  }
  
  async loadRoom(str) {
    const route = (str)
      ? (str.startsWith('http')) ? str : `/${str}`
      : '';
    await this.currPage.goto(route);
  }
  
  async openAdminMenu(name) {
    await this.getUser(name).click();
    return await this.waitForDialog('.user-data-menu');
  }
  
  async openGameMenu() {
    await this.currPage
      .locator('.top-nav')
      .getByRole('button', { name: 'Menu' })
      .click();
    return await this.waitForDialog('.game-menu');
  }
  
  async readClipboard() {
    await this.ctx.grantPermissions(['clipboard-read']);
    const handle = await this.currPage.evaluateHandle(() => navigator.clipboard.readText());
    const txt = await handle.jsonValue();
    await handle.dispose();
    return txt;
  }
  
  async screenshot(name) {
    // delete old screenshots for current test file
    if (!screenshotNdxs[this.ndxKey]) {
      // await test.step(`Remove old screenshots for "${namePrefix}"`, async () => {
      //   await exec(`rm -rf ${PATH__ABS_SCREENSHOTS}/${namePrefix}*`);
      // });
      
      screenshotNdxs[this.ndxKey] = 1;
    }
    
    const screenshotNdx = screenshotNdxs[this.ndxKey];
    const filename = `${PATH__REL_SCREENSHOTS}/${`${this.shotNamePrefix}_${pad(screenshotNdx)}__${name}`.toLowerCase().replace(/\s/g, '-')}.jpg`;
    
    screenshotNdxs[this.ndxKey] += 1;
    
    await this.currPage.screenshot({
      animations: 'disabled', // stops CSS animations, CSS transitions and Web Animations.
      fullPage: true,
      path: filename,
      quality: 90,
      type: 'jpeg',
    });
  }
  
  async switchToPage(pageNum) {
    this.currPage = this.pages[pageNum - 1];
    await this.currPage.bringToFront();
    await expect(this.currPage.locator('body')).toBeAttached();
  }
  
  async validateAdminInstructions({ screenshot }) {
    const dialog = await this.waitForDialog('.admin-instructions');
    const instructions = dialog.locator('p');
    await expect(instructions.nth(0)).toHaveText("Congrats! You're the MC, so you're running the game. In order for others to join, just send them");
    await expect(instructions.nth(1)).toHaveText("When starting a new CAH game it's up to the group to choose the Card Czar. Y'all can do that via the typical Who was the last to poop? question, or by what ever means you choose.");
    await expect(instructions.nth(2)).toHaveText("Once the group's chosen the Czar, you just have to click on that User and choose Make <User> the Czar. Once you do so, the game will start.");
    await this.copyGameURL(dialog);
    await this.copyGameCode(dialog);
    if (screenshot) await this.screenshot(screenshot);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(
      dialog,
      "should've closed Admin instructions"
    ).not.toBeAttached();
  }
  
  async validateCards({ blackCard, whiteCards }) {
    const answers = this.currPage.locator('.cards .answers');
    const userCards = this.currPage.locator('.cards .user-cards');
    
    let cards = answers.locator('.card');
    await expect(cards).toHaveCount(1);
    let card = cards.nth(0);
    await expect(card).toHaveClass(/is--black/);
    await expect(card).toHaveText(blackCard);
    
    if (whiteCards) {
      cards = userCards.locator('.card');
      await expect(cards).toHaveCount(10);
      const cardsCount = await cards.count();
      for (let i=0; i<cardsCount; i++) {
        card = cards.nth(i);
        await expect(card).toHaveClass(/is--white/);
        await expect(card).toHaveText(whiteCards[i]);
      }
    }
    else {
      const waitingMsg = this.currPage.locator('.czar-waiting-msg');
      const [ userA, userB ] = await this.currPage
        .locator('.users-list .user:not(.is--czar)')
        .evaluateAll(els => els.map((el) => el.dataset.name));
      await expect(waitingMsg).toHaveText(`Waiting for ${userA}, and ${userB} to submit their answers.`);
      await expect(userCards).not.toBeAttached();
    }
  }
  
  async validateGameEntry() {
    const dialog = await this.waitForDialog();
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
    await expect(this.currPage.locator(loc), note).toHaveText(msg);
  }
  
  async validateTooltip({ id, msg, note }) {
    await this.currPage.locator(`button[popovertarget="${id}"]`).click();
    await expect(
      this.currPage.locator(`[popover][role="tooltip"][id="${id}"]`),
      note
    ).toHaveText(msg);
  }
  
  async valitateUser({ admin, czar, name, points, status }) {
    const userEl = this.getUser(name);
    let userIcon;
    
    if (admin) {
      await expect(userEl).toHaveClass(/is--admin/);
      userIcon = 'ui-icon__star';
    }
    else if (czar) {
      await expect(userEl).toHaveClass(/is--czar/);
      userIcon = 'ui-icon__crown';
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
      const statusEl = userEl.locator('.user__status-indicator');
      await this.waitForAnimations(statusEl);
      await expect(
        await this.getBGColor(statusEl),
        "should display User status color"
      ).toEqual(status);
    }
  }
  
  async validateUserMenu({ btns, screenshot, user }) {
    const menu = await this.openAdminMenu(user);
    const cancelBtn = menu.getByRole('button', { name: 'Cancel' });
    
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
  
  async waitForDialog(selector) {
    const dialog = this.currPage.locator('.dialog');
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
    await this.ctx.grantPermissions(['clipboard-write']);
  }
}

export const test = base.extend({
  // forEachTest: [async ({}, use, testInfo) => {
  //   // [ beforeEach test ] =====================================================
  //   console.log('[PW][auto] beforeEach');
    
  //   // delete old screenshots for current test file
  //   const rmPath = `${PATH__ABS_SCREENSHOTS}/${genShotPrefix(genShotKeys(testInfo))}`;
  //   await test.step(`Remove old screenshots for "${rmPath}"`, async () => {
  //     await exec(`rm -rf "${rmPath}"*`); // without quotes, the brackets get misinterpreted
  //   });
    
  //   // [ test ] ================================================================
  //   await use();
    
  //   // [ afterEach test ] ======================================================
  // }, { auto: true }],  // automatically starts for every test.
  
  game: async ({ context, page }, use, testInfo) => {
    // [ before test ] =========================================================
    const rmPath = `${PATH__ABS_SCREENSHOTS}/${genShotPrefix(genShotKeys(testInfo))}`;
    await test.step(`Remove old screenshots for "${rmPath}"`, async () => {
      await exec(`rm -rf "${rmPath}"*`); // without quotes, the brackets get misinterpreted
    });
    
    // [ test ] ================================================================
    const game = new GameFixture({ context, page, testInfo });
    await use(game);
    
    // [ after test ] ==========================================================
  },
});

// test.beforeEach(() => {
//   console.log('[auto] beforeEach');
// });

export { expect };
