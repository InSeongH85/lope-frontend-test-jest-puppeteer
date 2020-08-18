const timeout = 10000;
const utils = require('../utils/test-utils');
const info = require('../utils/test-info');
const SCREENSHOT_PATH = './screenshot/sysmNotification';
let screenshotCnt = 1;

describe(
  '/sysm/notification/send',
  () => {
    let page
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage();
      await page.setViewport({width:1920 , height: 946});
      await page.goto(info.URL, {waitUntil: 'networkidle0'});
      await utils.moveMenuOfThreeepth(page, "시스템관리", "알림발송", "수동발송");
    }, timeout)

    beforeEach(async() => {
      await page.waitFor(1000);
    })

    afterAll(async () => {
      await page.close();
    })

    it("페이지의 타이틀이 '수동발송' 인지 확인한다.", async() => {
      await page.waitFor(2000);
      const pageTitleElements = await page.$x("//div[@class='ikc-layout-main']//div[@class='ikc-toolbar']//span[@class='ikc-pagename']");
      const pageTitle = pageTitleElements.length > 0 ? await page.evaluate(ele => ele.innerText, pageTitleElements[0]) : "";
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "수동발송여부");
      expect(pageTitle).toBe("수동발송");
    })

    it("우측의 버튼이 5개 있는지 확인한다.(새로고침, 조회...)", async() => {
      const buttons = await page.$x("//div[@class='ikc-layout-main']/md-content[@class='md-default-theme']/section/h2/div[@class='md-subheader-inner']/span[@class='md-subheader-content']/div[@class='ikc-toolbar']/div");
      expect(buttons.length).toBe(5)
    })

    it("개별조회 페이지로 이동한다.", async() => {
      const buttons = await page.$x("//div[@class='ikc-toolbar']/div/button[@aria-label='개별조회']");
      const buttonTitle = buttons.length > 0 ? await page.evaluate(ele => ele.getAttribute("aria-label"), buttons[0]) : "";
      expect(buttonTitle).toBe("개별조회");
      buttons.length > 0 ? buttons[0].click() : new Error("Not Defined 개별조회");
      await page.waitForNavigation();
      const addButton = await page.$x("//form[@name='inquiryForm']/div[@class='ikc-btnswrap']/div/button[@aria-label='추가']");
      expect(addButton.length).toBe(1);
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "개별조회 페이지 이동");
    })

    it("개별조회 페이지의 버튼이 4개 인지 확인한다.", async() => {
      const buttons = await page.$x("//div[@class='ikc-layout-main']/md-content[@class='md-default-theme']/section/h2/div[@class='md-subheader-inner']/span[@class='md-subheader-content']/div[@class='ikc-toolbar']/div");
      expect(buttons.length).toBe(4);
    })

    it("검색조건을 ID 로 선택한다.", async() => {
      // 검색 조건을 클릭
      const CONDITION_XPATH = "//form[@name='inquiryForm']/div[@class='ikc-drop-down-list ikc-required']/span"
      await page.waitForXPath(CONDITION_XPATH).then((conditionHandle) => {
        conditionHandle.evaluate(ele => ele.click())
      }).catch((error) => console.error("Error ConditionList Click  ! " + error))

      // ID 인 것을 클릭
      const CONDITION_ID_XPATH = "//div[@class='k-animation-container']/div/ul[@role='listbox']/li[contains(text(), 'ID')]";
      // const CONDITION_ID_XPATH = "//div[@class='k-animation-container']/div/div[@class='k-list-optionlabel k-state-selected k-state-focused']"
      await page.waitForXPath(CONDITION_ID_XPATH).then((idCondition) => {
        idCondition.evaluate(ele => ele.click());
      }).catch((error) => console.error("Error ID Condition Click : " + error));

      // Invalid Message 가 보이는지 여부
      const CONDITION_INVALID_XPATH = "//form[@name='inquiryForm']/div[@class='ikc-drop-down-list ikc-required']/label/span[@data-for='searchRequirement']";
      const invalidDisplay = await page.$x(CONDITION_INVALID_XPATH);
      const displayCss = await page.evaluate(ele => ele.style.display, invalidDisplay[0]);
      // 검색 조건이 클릭 조차 되지 않았을 시
      expect(displayCss).not.toBeUndefined();
      expect(displayCss.lenth).not.toEqual(0);
      // 검색 조건이 선택 되지 않았을 시 (검색조건을 선택하여 주십시오)
      expect(displayCss).not.toEqual("block");

      const CONDITION_TEXT_XPATH = "//form[@name='inquiryForm']/div[@class='ikc-textbox ikc-required']/input[@name='text'][@ng-model='inquiryManagement.text']";
      await page.waitForXPath(CONDITION_TEXT_XPATH).then((textCondition) => {
        textCondition.evaluate(ele => ele.click());
      })
      // 검색할 ID 넣기
      const SEARCH_TEXT_INPUT = "input[ng-model='inquiryManagement.text']";
      // await page.type("input[ng-model='inquiryManagement.text']", 'inek4gut', {delay: 50});
      await utils.typeTextAfterClearInput(page, SEARCH_TEXT_INPUT, info.SYSM_NOTIFICATION_SEND_USER_ID)
      const ADD_BUTTON_XPATH = "//form[@name='inquiryForm']/div[@class='ikc-btnswrap']/div/button[@type='submit'][@aria-label='추가']";
      await page.waitForXPath(ADD_BUTTON_XPATH).then((addButton) => {
        addButton.evaluate(ele => ele.click());
      })

      // GRID 데이터 체크
      await page.waitFor(1000)
      const GRID_DATA_XPATH = "//div[@kendo-grid][@data-role='grid']/div[@class='k-grid-content']/table[@role='grid']/tbody[@role='rowgroup']/tr/td";
      const gridTd = await page.$x(GRID_DATA_XPATH);
      //검색 결과가 없을 시에는 1개 나온다.
      expect(gridTd.length).not.toBe(1);
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "수동발송에서 이용자 조회 및 추가");
    })

    it("조회된 ID 를 선택한다.", async() => {
      const SELECT_CHECKBOX = "//div[@kendo-grid][@data-role='grid']/div[@class='k-grid-content']/table[@role='grid']/tbody[@role='rowgroup']/tr/td[@role='gridcell']/input[@type='checkbox']"
      await page.waitForXPath(SELECT_CHECKBOX).then((checkBox) => {
        checkBox.evaluate(ele => ele.click());
      }).catch((error) => console.error("Error CHECKBOX Click : " + error))
      const checkBox = await page.$x(SELECT_CHECKBOX);
      const isChecked = await page.evaluate(checkB => checkB.checked, checkBox[0]);
      expect(isChecked).toEqual(true);
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "수동발송에서 이용자 선택");
    })

    it("Ik-Toast 가 열렸을까 ?", async() => {
      const SHOW_TOAST_BOX = "//div[@class='ikc-action-toast ikc-toast-show']";
      const toastBox = await page.$x(SHOW_TOAST_BOX);
      // 선택되었으면 ikc-toast-show / 선택되지 않았다면 ikc-toast-hide
      expect(toastBox.length).toBe(1);
      const SEND_BUTTON = "//div[@class='ikc-action-toast ikc-toast-show']/div/div/button[@type='button'][@class='md-warn md-button md-default-theme']";
      await page.waitForXPath(SEND_BUTTON).then((sendButton) => {
        sendButton.evaluate(ele => ele.click());
      })
    })

    it("알림발송 Modal 창이 열렸는가? ", async() => {
      const CHECK_MODAL = "div.k-widget > div.ikc-modal-window";
      // const IS_SEND_SMS_CHECK_BOX = "//form[@name='sendForm']//div[@class='ikc-check']/label[@for='isSendSms']/input[@name='isSendSms'][@type='checkbox']"
      const IS_SEND_SMS_CHECK_BOX = "form[name='sendForm'] > div.ikc-formgroup > div.ikc-textarea > div.ikc-check > label > input[name='isSendSms']"
      const SEND_BUTTON = "//form[@name='sendForm']/div[@class='ikc-btnswrap']//button[@type='submit']"
      const CONFIRM_BUTTON = "//div[@kendo-window='progressWin']//button[@aria-label='확인']"

      const isNotHidden = await page.$eval(CHECK_MODAL, ele => ele.style.display !== "none");
      // 모달이 표현되었는지 여부확인
      expect(isNotHidden).toEqual(true);

      // SMS 발송여부가 체크되어 있는지 확인, 안되어 있을 시 체크해준다.
      const isChecked = await page.$eval(IS_SEND_SMS_CHECK_BOX, ele => ele.checked !== false);
      if (!isChecked) {
        await page.click(IS_SEND_SMS_CHECK_BOX);
      }
      // 발송버튼
      await page.waitForXPath(SEND_BUTTON).then((sendButton) => {
        sendButton.evaluate(ele => ele.click());
      })

      // 확인버튼
      await page.waitForXPath(CONFIRM_BUTTON).then((confirmButton) => {
        confirmButton.evaluate(ele => ele.click());
      })
      await page.waitFor(2000)
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "수동발송 완료");
    })

    it('이용자정보관리 페이지 이동', async () => {
      await utils.moveMenuOfTwoDepth(page, "이용자관리", "/pat/management")
      const PAGE_NAME="span.md-subheader-content > div.ikc-toolbar > span.ikc-pagename"
      const pageName = await page.waitForSelector(PAGE_NAME)
      const name = await page.evaluate( pageName => pageName.innerText, pageName)
      expect(name).toEqual("이용자정보관리");
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "이용자정보관리-원복")
    })

    it('이용자정보 조회-원복', async () => {
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
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "이용자조회-원복")
    })

    it('이용자정보관리 > 이용자정보 편집 - E-MAIL, PHONE_NO :: 테스트를 위해 변경했던 정보 원복', async() => {
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
      await utils.typeTextAfterClearInput(page, MOBILE_INPUT, info.NOT_MEANING_MOBILE_PHONE)
      await utils.typeTextAfterClearInput(page, EMAIL_INPUT, info.NOT_MEANING_EMAIL)
      await page.click(SAVE_BUTTON)
      await page.waitFor(1000)
      // 핸드폰번호가 변경되었는지 확인한다.
      // TODO EMAIL 은 SELECTOR 을 어찌 써야지...?
      const mobileCompareInfo = await page.waitFor(MOBILE_COMPARE_INFO)
      const afterMobile = await page.evaluate(info => info.innerText, mobileCompareInfo)
      expect(afterMobile).toEqual(info.NOT_MEANING_MOBILE_PHONE)
      screenshotCnt = await utils.takeFullScreenshot(page, screenshotCnt, SCREENSHOT_PATH, "이용자편집-원복")
    })
  },
  timeout
)