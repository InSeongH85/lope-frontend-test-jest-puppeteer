const timeout = 10000;
const utils = require('../utils/test-utils');
const info = require('../utils/test-info');
const NETWORK_PRESETS = require("../utils/network-presets");
const SCREENSHOT_PATH = './screenshot/authLogin';
let screenshotCnt = 1;

describe(
  '/auth/login (LoginPage)',
  () => {
    let page
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      // 지정한 Network 속도를 설정한다.
      if (info.NETWORK_PRESET && NETWORK_PRESETS[info.NETWORK_PRESET]) {
        const client = await page.target().createCDPSession()
        await client.send('Network.emulateNetworkConditions', NETWORK_PRESETS[info.NETWORK_PRESET])
      }
      
      await page.setViewport({width:1280 , height: 960});
      await page.goto(info.URL, {waitUntil: 'networkidle0'})
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it('메뉴가 1개 이상이다.', async() => {
      const MENUS_SELECTOR = "div.ikc-gnb-menus > div.ikc-gnb-item > ul > li"
      await page.waitForSelector(MENUS_SELECTOR);;
      const menus = await page.$$(MENUS_SELECTOR);
      expect(menus.length).toBeGreaterThan(1);
    })

    it('로그인 후 사용자 이름이 있어야 한다.', async() => {
      const userName = await page.evaluate(() => {
        const USERNAME_SELECTOR = "div.ikc-userinfo > span.ikc-info > strong"
        return document.querySelector(USERNAME_SELECTOR).innerText;
      });
      expect(userName).not.toBeNull()
      await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "로그인_후")
    })
  },
  timeout
)