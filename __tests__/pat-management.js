const timeout = 10000
const fs = require('fs');
const SCREENSHOT_PATH = './screenshot';
let screenshotCnt = 1;

describe(
  '/pat/management (Patron Management)',
  () => {
    let page
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await page.setViewport({width:1280 , height: 960});
      await page.goto('http://ulibrary.inek.kr/solars', {waitUntil: 'networkidle0'})
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it('이용자정보관리 페이지 이동', async () => {
      await moveMenuOfTwoDepth(page, "이용자관리", "/pat/management")
      await page.waitFor(1000)
      const PAGE_NAME="span.md-subheader-content > div.ikc-toolbar > span.ikc-pagename"
      const pageName = await page.waitFor(PAGE_NAME)
      const name = await page.evaluate( pageName => pageName.innerText, pageName)
      expect(name).toEqual("이용자정보관리");
      await takeFullScreenshot(page, "이용자정보관리")
    })

    it('이용자정보 조회', async () => {
      const INQUIRY_SELECTOR = "form[name='sideInquiryForm'] > div.ikc-textbox.ikc-required > input[name='searchWord']"
      const SUBMIT_SELECTOR = "form[name='sideInquiryForm'] > div.ikc-btnswrap > div > button[type='submit']"
      const USERLIST_SELECTOR = "md-content.ikc-listwrap > md-content.ikc-list-group > section.ikc-guide > div.ikc-list > div.ikc-list-item > a.ikc-list-item-title"
      const USER_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > h2 > div.md-subheader-inner > span > div.ikc-toolbar > h2.ikc-main-toolbar-header > strong"

      await page.waitFor(500)
      await page.click(INQUIRY_SELECTOR)
      await page.type(INQUIRY_SELECTOR, "아이네크", {delay: 100})
      await page.click(SUBMIT_SELECTOR)
      await page.waitFor(1000)
      await page.click(USERLIST_SELECTOR)
      await page.waitFor(1000)
      const userName = await page.waitFor(USER_SELECTOR)
      const definedName = await page.evaluate( info => info.innerText, userName)
      await page.waitFor(1000)
      expect(definedName).not.toBeNull()
      await takeFullScreenshot(page, "이용자조회")
    })

    it('이용자정보관리 > 이용자정보 편집 - E-MAIL, PHONE_NO', async() => {
      const MOBILE_NO = "01022223333"
      const EMAIL = "admin@inek.co.kr"
      const EDIT_BUTTON = "span.md-subheader-content > div.ikc-toolbar > div > button > i.fa.fa-pencil"
      const CHECK_MODAL = "div.k-widget > div.ikc-modal-window"
      const MOBILE_INPUT = "form[name='editForm'] > div.ikc-textbox > input[name='mobilePhoneNo']"
      const EMAIL_INPUT = "form[name='editForm'] > div.ikc-textbox > input[name='email']"
      const SAVE_BUTTON = "form[name='editForm'] > div[layout='row'] > div > button[type='submit']"
      const MOBILE_COMPARE_INFO = "div.ikc-layout-main.open-side > md-content > section > header > div.ikc-main-moreinfo.ikc-userinfo-img > ul > li > span > strong[ng-bind='patron.mobilePhoneNo"

      await page.click(EDIT_BUTTON)
      await page.waitFor(1000)
      const isNotHidden = await page.$eval(CHECK_MODAL, ele => ele.parentElement.style.display !== "none");
      // 모달이 표현되었는지 여부확인
      expect(isNotHidden).toEqual(true)
      page.waitFor(1000)
      // 핸드폰, EMAIL ELEMENT 존재 여부 확인하기
      // 핸드폰 , EMAIL 수정
      await typeTextAfterClearInput(page, MOBILE_INPUT, MOBILE_NO)
      await typeTextAfterClearInput(page, EMAIL_INPUT, EMAIL)
      await page.click(SAVE_BUTTON)
      await page.waitFor(1000)
      // 핸드폰번호가 변경되었는지 확인한다.
      // TODO EMAIL 은 SELECTOR 을 어찌 써야지...?
      const mobileCompareInfo = await page.waitFor(MOBILE_COMPARE_INFO)
      const afterMobile = await page.evaluate(info => info.innerText, mobileCompareInfo)
      expect(afterMobile).toEqual(MOBILE_NO)
      await takeFullScreenshot(page, "이용자편집")
    })

    it('이용자정보관리 > 대출중내역 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await getNgIncludeHtml(page, ".ik-tab-charge", INFO_HTML_SELECTOR)
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.charge.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(200)
      const gridHeaderLength = await getGridHeaderLength(page, "chargeList")
      expect(gridHeaderLength).toBeGreaterThan(1);
      await takeFullScreenshot(page, "대출중내역")
    })

    it('이용자정보관리 > 제재내역 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await getNgIncludeHtml(page, ".ik-tab-block", INFO_HTML_SELECTOR)
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.block.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(200)
      const gridHeaderLength = await getGridHeaderLength(page, "blockList")
      expect(gridHeaderLength).toBeGreaterThan(1);
      await takeFullScreenshot(page, "제재내역")
    })

    it('이용자정보관리 > 부도이력 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await getNgIncludeHtml(page, ".ik-tab-noshow", INFO_HTML_SELECTOR)
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.noshow.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(200)
      const gridHeaderLength = await getGridHeaderLength(page, "noShowList")
      expect(gridHeaderLength).toBeGreaterThan(1);
      await takeFullScreenshot(page, "부도이력")
    })

    it('이용자정보관리 > 다중신분정보 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await getNgIncludeHtml(page, ".ik-tab-multipatrontype", INFO_HTML_SELECTOR)
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.multipatrontype.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(200)
      const gridHeaderLength = await getGridHeaderLength(page, "multiPatronTypeList")
      expect(gridHeaderLength).toBeGreaterThan(1);
      await takeFullScreenshot(page, "다중신분정보")
    })

    it('이용자정보관리 > 부가정보 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await getNgIncludeHtml(page, ".ik-tab-additioninfo", INFO_HTML_SELECTOR)
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.additioninfo.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(200)
      const gridHeaderLength = await getGridHeaderLength(page, "patronAdditionInfo")
      expect(gridHeaderLength).toBeGreaterThan(1);
      await takeFullScreenshot(page, "부가정보")
    })

    it('이용자정보관리 > 람/변경이력 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await getNgIncludeHtml(page, ".ik-tab-patronlog", INFO_HTML_SELECTOR)
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.patronlog.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(200)
      const gridHeaderLength = await getGridHeaderLength(page, "patronLog")
      expect(gridHeaderLength).toBeGreaterThan(1);
      await takeFullScreenshot(page, "열람\\변경이력")
    })
  },
  timeout
)

/**
 * 메뉴를 이동한다.
 * @param class: Page
 * @param string: parentLabel
 * @param string: childHref
 */
async function moveMenuOfTwoDepth(page, parentLabel, childHref) {
	await page.click('div.ikc-gnb-menus > div.ikc-gnb-item > ul > li > button[aria-label="' + parentLabel + '"]');
	await page.click('div.ikc-gnb-menus > div.ikc-gnb-item > ul > li > ul > li > a[href="#' + childHref + '"]');
}

/**
 * 스크린 샷을 찍는다.
 */
async function takeFullScreenshot(page, fileName) {
  await page.waitFor(1000)
	await fs.promises.mkdir(SCREENSHOT_PATH, { recursive: true })
	await page.screenshot({ path: SCREENSHOT_PATH + '/' + screenshotCnt++ + "_" + fileName + ".png", fullPage: true });
}


/**
 * Grid 의 Header 길이를 가져온다.
 * @param {*} targetHeaderSelector
 */
async function getGridHeaderLength(page, targetHeaderSelector) {
  let GRID_HEADER = "div[options='options.TARGET'] > div.k-grid-header > div.k-grid-header-wrap > table > thead > tr > th"
  GRID_HEADER = GRID_HEADER.replace(/TARGET/gi, targetHeaderSelector)
  await page.waitForSelector(GRID_HEADER);;
  const gridHeaders = await page.$$(GRID_HEADER);
  return gridHeaders.length
}

/**
 *
 * @param {*} targetTabstripSelector
 */
async function getNgIncludeHtml(page, targetTabstripSelector, infoHtmlSelector) {
  let INFO_TABSTRIP = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > ul > li"
  INFO_TABSTRIP += targetTabstripSelector
  await page.click(INFO_TABSTRIP)
  await page.waitFor(200)
  const infoHtmlName = await page.$(infoHtmlSelector)
  const infoHtml = await page.evaluate( info => info.getAttribute("ng-include") , infoHtmlName)
  return infoHtml
}

/**
 * INPUT SELECTOR 에 typeText 를 입력한다.
 * @param {puppeteer#Page} page
 * @param {CSSSelector string} inputSelector
 * @param {string} typeText
 */
async function typeTextAfterClearInput(page, inputSelector, typeText) {
  const elementHandle = await page.$(inputSelector);
  await elementHandle.click();
  await elementHandle.focus();
  // click three times to select all
  await elementHandle.click({clickCount: 3});
  await elementHandle.press('Backspace');
  await elementHandle.type(typeText, {delay: 30});
}