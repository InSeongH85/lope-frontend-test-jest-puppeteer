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
      await page.waitForNavigation();
      const addButton = await page.$x("//form[@name='inquiryForm']/div[@class='ikc-btnswrap']/div/button[@aria-label='추가']")
      expect(addButton.length).toBe(1)
    })

    it("개별조회 페이지의 버튼이 4개 인지 확인한다.", async() => {
      const buttons = await page.$x("//div[@class='ikc-layout-main']/md-content[@class='md-default-theme']/section/h2/div[@class='md-subheader-inner']/span[@class='md-subheader-content']/div[@class='ikc-toolbar']/div");
      expect(buttons.length).toBe(4)
    })

    it("검색조건을 ID 로 선택한다.", async() => {
      const CONDITION_XPATH = "//form[@name='inquiryForm']/div[@class='ikc-drop-down-list ikc-required']/span"
      await page.waitForXPath(CONDITION_XPATH).then((conditionHandle) => {
        conditionHandle.evaluate(ele => ele.click())
      }).catch((error) => console.error("Error ConditionList Click  ! " + error))
      const CONDITION_ID_XPATH = "//div[@class='k-animation-container']/div/ul[@role='listbox']/li[contains(text(), 'ID')]"
      await page.waitForXPath(CONDITION_ID_XPATH).then((idCondition) => {
        idCondition.evaluate(ele => ele.click())
      }).catch((error) => console.error("Error ID Condition Click : " + error))
      const CONDITION_TEXT_XPATH = "//form[@name='inquiryForm']/div[@class='ikc-textbox ikc-required']/input[@name='text'][@ng-model='inquiryManagement.text']"
      await page.waitForXPath(CONDITION_TEXT_XPATH).then((textCondition) => {
        textCondition.evaluate(ele => ele.click())
        textCondition.evaluate(ele => ele.value = 'inek4gut')
      })
      const ADD_BUTTON_XPATH = "//form[@name='inquiryForm']/div[@class='ikc-btnswrap']/div/button[@type='submit'][@aria-label='추가']"
      await page.waitForXPath(ADD_BUTTON_XPATH).then((addButton) => {
        addButton.evaluate(ele => ele.click())
      })

      await page.waitFor(1000)
      const GRID_DATA_XPATH = "//div[@kendo-grid][@data-role='grid']/div[@class='k-grid-content']/table[@role='grid']/tbody[@role='rowgroup']/tr/td"
      const gridTd = await page.$x(GRID_DATA_XPATH)
      console.log("gridTd .length : " + gridTd.length);
      expect(gridTd.length).not.toBe(1)
    })

  },
  timeout
)