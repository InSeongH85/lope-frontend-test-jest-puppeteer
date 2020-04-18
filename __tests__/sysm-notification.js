const timeout = 10000;
const utils = require('../utils/test-utils');
const SCREENSHOT_PATH = './screenshot/authLogin';
let screenshotCnt = 1;

describe(
  '/sysm/notification/send',
  () => {
    let page
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await page.setViewport({width:1280 , height: 960});
      await page.goto('http://ulibrary.inek.kr/solars', {waitUntil: 'networkidle0'})
      await utils.moveMenuOfThreeepth(page, "시스템관리", "알림발송", "수동발송")
    }, timeout)

    beforeEach(async() => {
      await page.waitFor(2000)
    })

    afterAll(async () => {
      await page.close()
    })

    it("페이지의 타이틀이 '수동발송' 인지 확인한다.", async() => {
      const pageTitleElements = await page.$x("//div[@class='ikc-layout-main']//div[@class='ikc-toolbar']//span[@class='ikc-pagename']")
      const pageTitle = pageTitleElements.length > 0 ? await page.evaluate(ele => ele.innerText, pageTitleElements[0]) : ""
      expect(pageTitle).toBe("수동발송")
    })

    it("우측의 버튼이 5개 있는지 확인한다.(새로고침, 조회...)", async() => {
      const buttons = await page.$x("//div[@class='ikc-layout-main']/md-content[@class='md-default-theme']/section/h2/div[@class='md-subheader-inner']/span[@class='md-subheader-content']/div[@class='ikc-toolbar']/div");
      expect(buttons.length).toBe(5)
    })

    it("개별조회 페이지로 이동한다.", async() => {
      const buttons = await page.$x("//div[@class='ikc-toolbar']/div/button[@aria-label='개별조회']")
      const buttonTitle = buttons.length > 0 ? await page.evaluate(ele => ele.getAttribute("aria-label"), buttons[0]) : ""
      expect(buttonTitle).toBe("개별조회")
      buttons.length > 0 ? buttons[0].click() : new Error("Not Defined 개별조회");
      await page.waitFor(500)
      const addButton = await page.$x("//form[@name='inquiryForm']/div[@class='ikc-btnswrap']/div/button[@aria-label='추가']")
      expect(addButton.length).toBe(1)
    })

    it("개별조회 페이지의 버튼이 4개 인지 확인한다.", async() => {
      const buttons = await page.$x("//div[@class='ikc-layout-main']/md-content[@class='md-default-theme']/section/h2/div[@class='md-subheader-inner']/span[@class='md-subheader-content']/div[@class='ikc-toolbar']/div");
      expect(buttons.length).toBe(4)
    })

    // it("검색조건을 ID 로 선택한다.", async() => {
    //   const INQUIRY_CONDITION = "//form[@name='inquiryForm']/div[@class='ikc-drop-down-list ikc-required']/span[@class='k-widget k-dropdown k-header k-invalid']"
    //   const condition = await page.$x(INQUIRY_CONDITION)
    //   condition.length > 0 ? condition[0].click() : new Error("Not Defined 조회조건")
    //   const selectList = await page.$x("//div[@class='k-animation-container']/div[@class='k-list-container k-popup k-group k-reset ikc-inverse']/ul/li")
    //   const idSelect = selectList.length > 0 ? await page.evaluate(ele => ele.innerText === 'ID', selectList[0]) : new Error("Not Defined SelectList 'ID'")
    //   await page.$eval(idSelect, elem => elem.click());

    //   await page.waitFor(5000)
    // })

  },
  timeout
)