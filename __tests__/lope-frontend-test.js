const timeout = 50000
const USERID = 'id4solars';
const PASSWORD = 'djfwnrzh23!';

describe(
  '/auth/login (LoginPage)',
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

    it('loginFailedResult 에 데이터가 있다면 로그인 실패이다.', async () => {
      await page.waitFor('input[name=userId]');
      await page.type('input[name=userId]', USERID);
      await page.waitFor(500);
      await page.type('input[name=password]', PASSWORD);
      await page.waitFor(500);
      await page.click('button[aria-label=로그인]');
      await page.waitFor(3000);
      const loginFailedResult = await page.evaluate(() => {
        const LOGIN_FAILED_SELECTOR = "div.ikc-message-subject > span[ng-bind-html]"
        return document.querySelector(LOGIN_FAILED_SELECTOR).innerHTML;
      });
      expect(loginFailedResult).toEqual("");
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
    })
  },
  timeout
)

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
      const FIRST_MENU='div.ikc-gnb-menus > div.ikc-gnb-item > ul > li > button[aria-label="이용자관리"]'
      const CHILD_MENU='div.ikc-gnb-menus > div.ikc-gnb-item > ul > li > ul > li > a[href="#/pat/management"]'
      const PAGE_NAME='span.md-subheader-content > div.ikc-toolbar > span.ikc-pagename'
      await page.waitFor(500)
      await page.click(FIRST_MENU)
      await page.waitFor(500)
      await page.click(CHILD_MENU)
      await page.waitFor(2000)
      const pageName = await page.waitFor(PAGE_NAME)
      const name = await page.evaluate( pageName => pageName.innerText, pageName)
      expect(name).toEqual("이용자정보관리");
    }),

    it('이용자정보 조회', async () => {
      const INQUIRY_SELECTOR = "form[name='sideInquiryForm'] > div.ikc-textbox.ikc-required > input[name='searchWord']"
      const SUBMIT_SELECTOR = "form[name='sideInquiryForm'] > div.ikc-btnswrap > div > button[type='submit']"
      const USERLIST_SELECTOR = "md-content.ikc-listwrap > md-content.ikc-list-group > section.ikc-guide > div.ikc-list > div.ikc-list-item > a.ikc-list-item-title"
      const USER_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > h2 > div.md-subheader-inner > span > div.ikc-toolbar > h2.ikc-main-toolbar-header > strong"

      await page.waitFor(500)
      await page.click(INQUIRY_SELECTOR)
      await page.type(INQUIRY_SELECTOR, "아이네크")
      await page.click(SUBMIT_SELECTOR)
      await page.waitFor(1000)
      await page.click(USERLIST_SELECTOR)
      await page.waitFor(1000)
      const userName = await page.waitFor(USER_SELECTOR)
      const definedName = await page.evaluate( userName => userName.innerText, userName)
      await page.waitFor(1000)
      expect(definedName).not.toBeNull()
    }),

    it('이용자정보 편집 - E-MAIL, PHONE_NO', async() => {
      const MOBILE_NO = "01066547618"
      const EMAIL = "tanbbang03@inek.co.kr"
      const EDIT_BUTTON = "span.md-subheader-content > div.ikc-toolbar > div > button > i.fa.fa-pencil"
      const CHECK_MODAL = "div.k-widget > div.ikc-modal-window"
      const MOBILE_INPUT = "form[name='editForm'] > div.ikc-textbox > input[name='mobilePhoneNo']"
      const EMAIL_INPUT = "form[name='editForm'] > div.ikc-textbox > input[name='email']"
      const SAVE_BUTTON = "form[name='editForm'] > div[layout='row'] > div > button[type='submit']"

      await page.click(EDIT_BUTTON)
      await page.waitFor(1000)
      //TODO MODAL 여부 확인하기
      const isNotHidden = await page.$eval(CHECK_MODAL, ele => ele.parentElement.style.display !== "none");
      // 모달이 표현되었는지 여부확인
      expect(isNotHidden).toEqual(true)
      page.waitFor(1000)
      // 핸드폰, EMAIL ELEMENT 존재 여부 확인하기 
      // 핸드폰 , EMAIL 수정
      // await page.click(MOBILE_INPUT)
      // await page.type(MOBILE_INPUT, MOBILE_NO)
      // await page.waitFor(2000);
      // await page.click(EMAIL_INPUT)
      // await page.type(EMAIL_INPUT, EMAIL)
      // await page.waitFor(2000);
      // await page.click(SAVE_BUTTON)
      // await page.waitFor(2000);
    })
  },
  timeout
)



async function isLocatorReady(element, page) {
  const isVisibleHandle = await page.evaluateHandle((e) => 
{
    const style = window.getComputedStyle(e);
    return (style && style.display !== 'none' && 
    style.visibility !== 'hidden' && style.opacity !== '0');
 }, element);
  var visible = await isVisibleHandle.jsonValue();
  const box = await element.boxModel();
  if (visible && box) {
    return true;
  }
  return false;
}