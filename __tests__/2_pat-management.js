const timeout = 10000
const fs = require('fs');
const utils = require('../utils/test-utils');
const info = require('../utils/test-info');
const SCREENSHOT_PATH = './screenshot/patManagement';
let screenshotCnt = 1;

describe(
  '/pat/management (Patron Management)',
  () => {
    let page
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await page.setViewport({width:1920 , height: 1080});
      await page.goto(info.URL, {waitUntil: 'networkidle0'})
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it('이용자정보관리 페이지 이동', async () => {
      await utils.moveMenuOfTwoDepth(page, "이용자관리", "/pat/management")
      const PAGE_NAME="span.md-subheader-content > div.ikc-toolbar > span.ikc-pagename"
      const pageName = await page.waitForSelector(PAGE_NAME)
      const name = await page.evaluate( pageName => pageName.innerText, pageName)
      expect(name).toEqual("이용자정보관리");
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "이용자정보관리")
    })

    it('이용자정보 조회', async () => {
      const INQUIRY_SELECTOR = "form[name='sideInquiryForm'] > div.ikc-textbox.ikc-required > input[name='searchWord']"
      const SUBMIT_SELECTOR = "form[name='sideInquiryForm'] > div.ikc-btnswrap > div > button[type='submit']"
      const USERLIST_SELECTOR = "md-content.ikc-listwrap > md-content.ikc-list-group > section.ikc-guide > div.ikc-list > div.ikc-list-item > a.ikc-list-item-title"
      const USER_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > h2 > div.md-subheader-inner > span > div.ikc-toolbar > h2.ikc-main-toolbar-header > strong"

      await page.click(INQUIRY_SELECTOR)
      await page.type(INQUIRY_SELECTOR, "아이네크", {delay: 50})
      await page.click(SUBMIT_SELECTOR)
      await page.waitFor(1000)
      await page.click(USERLIST_SELECTOR)
      await page.waitFor(500)
      const userName = await page.waitFor(USER_SELECTOR)
      const definedName = await page.evaluate( info => info.innerText, userName)
      await page.waitFor(1000)
      expect(definedName).not.toBeNull()
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "이용자조회")
    })

    it('이용자정보관리 > 이용자정보 편집 - E-MAIL, PHONE_NO', async() => {
      const EDIT_BUTTON = "span.md-subheader-content > div.ikc-toolbar > div > button > i.fa.fa-pencil"
      const CHECK_MODAL = "div.k-widget > div.ikc-modal-window"
      const MOBILE_INPUT = "form[name='editForm'] > div.ikc-textbox > input[name='mobilePhoneNo']"
      const EMAIL_INPUT = "form[name='editForm'] > div.ikc-textbox > input[name='email']"
      const SAVE_BUTTON = "form[name='editForm'] > div[layout='row'] > div > button[type='submit']"
      const MOBILE_COMPARE_INFO = "div.ikc-layout-main.open-side > md-content > section > header > div.ikc-main-moreinfo.ikc-userinfo-img > ul > li > span > strong[ng-bind='patron.mobilePhoneNo']"

      await page.click(EDIT_BUTTON)
      await page.waitFor(500)
      const isNotHidden = await page.$eval(CHECK_MODAL, ele => ele.parentElement.style.display !== "none");
      // 모달이 표현되었는지 여부확인
      expect(isNotHidden).toEqual(true)
      await page.waitFor(500)
      // 핸드폰, EMAIL ELEMENT 존재 여부 확인하기
      // 핸드폰 , EMAIL 수정
      await utils.typeTextAfterClearInput(page, MOBILE_INPUT, info.CHANGE_MOBILE_PHONE)
      await utils.typeTextAfterClearInput(page, EMAIL_INPUT, info.CHANGE_EMAIL)
      await page.click(SAVE_BUTTON)
      await page.waitFor(1000)
      // 핸드폰번호가 변경되었는지 확인한다.
      // TODO EMAIL 은 SELECTOR 을 어찌 써야지...?
      const mobileCompareInfo = await page.waitFor(MOBILE_COMPARE_INFO)
      const afterMobile = await page.evaluate(info => info.innerText, mobileCompareInfo)
      console.log("AfterMobile : " + afterMobile);
      console.log("info.CHANGE_MOBILE_PHONE : " + info.CHANGE_MOBILE_PHONE);
      expect(afterMobile).toEqual(info.CHANGE_MOBILE_PHONE)
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "이용자편집")
    })

    it('이용자정보관리 > 대출중내역 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await utils.getNgIncludeHtml(page, ".ik-tab-charge")
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.charge.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(500)
      const gridHeaderLength = await utils.getGridHeaderLength(page, "chargeList")
      expect(gridHeaderLength).toBeGreaterThan(1);
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "대출중내역")
    })

    it('이용자정보관리 > 제재내역 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await utils.getNgIncludeHtml(page, ".ik-tab-block")
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.block.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(500)
      const gridHeaderLength = await utils.getGridHeaderLength(page, "blockList")
      expect(gridHeaderLength).toBeGreaterThan(1);
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "제재내역")
    })

    it('이용자정보관리 > 부도이력 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await utils.getNgIncludeHtml(page, ".ik-tab-noshow")
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.noshow.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(500)
      const gridHeaderLength = await utils.getGridHeaderLength(page, "noShowList")
      expect(gridHeaderLength).toBeGreaterThan(1);
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "부도이력")
    })

    it('이용자정보관리 > 다중신분정보 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await utils.getNgIncludeHtml(page, ".ik-tab-multipatrontype")
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.multipatrontype.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(500)
      const gridHeaderLength = await utils.getGridHeaderLength(page, "multiPatronTypeList")
      expect(gridHeaderLength).toBeGreaterThan(1);
      screenshotCnt =  await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "다중신분정보")
    })

    it('이용자정보관리 > 부가정보 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await utils.getNgIncludeHtml(page, ".ik-tab-additioninfo")
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.additioninfo.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(500)
      const gridHeaderLength = await utils.getGridHeaderLength(page, "patronAdditionInfo")
      expect(gridHeaderLength).toBeGreaterThan(1);
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "부가정보")
    })

    it('이용자정보관리 > 열람/변경이력 페이지가 보이는가', async() => {
      const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
      const infoHtml = await utils.getNgIncludeHtml(page, ".ik-tab-patronlog")
      expect(infoHtml).toEqual(" 'modules/pat/management/views/st.detail.patronlog.tab.html' ")

      const isNotHidden = await page.$eval(INFO_HTML_SELECTOR, ele => ele.parentElement.style.display !== "none");
      expect(isNotHidden).toEqual(true)

      await page.waitFor(500)
      const gridHeaderLength = await utils.getGridHeaderLength(page, "patronLog")
      expect(gridHeaderLength).toBeGreaterThan(1);
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "열람변경이력")
    })
  },
  timeout
)