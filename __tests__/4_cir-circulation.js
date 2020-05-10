const timeout = 10000;
const utils = require('../utils/test-utils');
const info = require('../utils/test-info');
const SCREENSHOT_PATH = './screenshot/cirCirculation';
let screenshotCnt = 1;

describe(
  '/cir/circulation',
  () => {
    let page
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await page.setViewport({width:1280 , height: 960});
      await page.goto(info.URL, {waitUntil: 'networkidle0'})
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it('이용자정보관리 페이지 이동', async () => {
      await utils.moveMenuOfTwoDepth(page, "대출반납", "/cir/circulation")
      const PAGE_NAME="span.md-subheader-content > div.ikc-toolbar > span.ikc-pagename"
      const pageName = await page.waitForSelector(PAGE_NAME)
      const name = await page.evaluate( pageName => pageName.innerText, pageName)
      expect(name).toEqual("대출반납");
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "대출반납")
    }),

    it('검색유형이 선택되어 있다..', async() => {
      const SEARCH_TYPE_CONDITION = "//form[@name='sideInquiryForm']/div[@class='ikc-drop-down-list']/span[@role='listbox']/select[@kendo-drop-down-list][@name='searchType']";
      await page.waitForXPath(SEARCH_TYPE_CONDITION, 5000);
      const searchType = await page.$x(SEARCH_TYPE_CONDITION);
      const searchTypeSelectIndex = await page.evaluate(type => type.selectedIndex, searchType[0]);
      expect(searchTypeSelectIndex).toBeGreaterThanOrEqual(0);
    }),

    it('조회값에 조회할 ID 를 Type 한 후 조회 한다..', async() => {
      const SEARCH_TEXT = "//form[@name='sideInquiryForm']/div[@class='ikc-textbox']/input[@name='searchWord'][@id='searchWord']";
      await page.waitForXPath(SEARCH_TEXT).then((textCondition) => {
        textCondition.evaluate(ele => ele.click());
      })
      // 검색할 ID 넣기
      const SEARCH_TEXT_INPUT = "input[name='searchWord'][id='searchWord']";
      await utils.typeTextAfterClearInput(page, SEARCH_TEXT_INPUT, info.CIR_CIRCULATION_SEARCH_USER);

      // 조회버튼 클릭
      const SEARCH_BUTTON_XPATH = "//form[@name='sideInquiryForm']/div[@class='ikc-btnswrap']/div/button[@type='submit'][@aria-label='조회']";
      await page.waitForXPath(SEARCH_BUTTON_XPATH).then((searchButton) => {
        searchButton.evaluate(ele => ele.click());
      });

      const SEARCH_LIST = $x("//section[@class='ikc-guide ikc-guide-closed']/div/div[@class='ikc-list-item']")[0].innerText;
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "대출반납 화면에서 이용자 조회");
      await page.waitFor(3000);

    }) 

  },
  timeout
)