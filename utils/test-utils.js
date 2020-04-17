const fs = require('fs');
module.exports = {
  /**
   * 스크린 샷을 찍는다.
   */
  takeFullScreenshot: async function (page, screenshotCnt, filePath, fileName) {
    await page.waitFor(1000)
    await fs.promises.mkdir(filePath, { recursive: true })
    await page.screenshot({ path: filePath + '/' + screenshotCnt++ + "_" + fileName + ".png", fullPage: true });
    return screenshotCnt
  },

  /**
   * 2Depth 메뉴를 이동한다.
   */
  moveMenuOfTwoDepth: async function (page, parentLabel, childHref) {
    const PARENT_MENU = 'div.ikc-gnb-menus > div.ikc-gnb-item > ul > li > button[aria-label="' + parentLabel + '"]'
    const CHILD_MENU = 'div.ikc-gnb-menus > div.ikc-gnb-item > ul > li > ul > li > a[href="#' + childHref + '"]'
    await page.waitForSelector(PARENT_MENU);
    await page.$eval(PARENT_MENU, elem => elem.click());
    await page.waitFor(200);
    const isShow = await page.$eval(PARENT_MENU, ele => ele.parentElement.classList.contains("ikc-active"));
    expect(isShow).toEqual(true)
    await page.waitForSelector(CHILD_MENU);
    await page.$eval(CHILD_MENU, elem => elem.click());
    await page.waitFor(1000);
  },

  /**
   * 3Depth 메뉴를 이동한다.
   */
  moveMenuOfThreeepth: async function (page, grandParentLabel, parentLabel, childLabel) {
    const GRAND_PARENT_MENU = "//div[@class='ikc-gnb-menus']//div[@class='ikc-gnb-item']//ul//li//span[contains(text(), '" + grandParentLabel + "')]"
    const PARENT_MENU = "//li[@class='ikc-active']//span[contains(text(), '" +parentLabel+ "')]"
    const CHILD_MENU = '//div[@class="ikc-gnb-menus"]//div[@class="ikc-gnb-item"]//ul//li[@class="ikc-active"]//ul//li//a[contains(text(), "' + childLabel + '")]'
    const grandParentMenu = await page.$x(GRAND_PARENT_MENU)
    grandParentMenu.length > 0 ? await grandParentMenu[0].click() : new Error("GrandParent NotFound");
    await page.waitFor(500)
    const parentMenu = await page.$x(PARENT_MENU)
    parentMenu.length > 0 ? await parentMenu[0].click() : new Error("ParentMenu NotFound");
    await page.waitFor(500)
    const childMenu = await page.$x(CHILD_MENU)
    childMenu.length > 0 ? await childMenu[0].click() : new Error("ChildMenu NotFound");
  },

  /**
   * Grid 의 Header 길이를 가져온다.
   */
  getGridHeaderLength: async function (page, targetHeaderSelector) {
    let GRID_HEADER = "div[options='options.TARGET'] > div.k-grid-header > div.k-grid-header-wrap > table > thead > tr > th"
    GRID_HEADER = GRID_HEADER.replace(/TARGET/gi, targetHeaderSelector)
    await page.waitForSelector(GRID_HEADER);;
    const gridHeaders = await page.$$(GRID_HEADER);
    return gridHeaders.length
  },

  /**
   * ng-include 에 있는 html 을 들고온다.
   */
  getNgIncludeHtml: async function (page, targetTabstripSelector) {
    const INFO_HTML_SELECTOR = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > div.k-state-active > div"
    let INFO_TABSTRIP = "div.ikc-layout-main.open-side > md-content > section > div.k-tabstrip-wrapper > div[kendo-tab-strip] > ul > li"
    INFO_TABSTRIP += targetTabstripSelector
    await page.click(INFO_TABSTRIP)
    await page.waitFor(200)
    const infoHtmlName = await page.$(INFO_HTML_SELECTOR)
    const infoHtml = await page.evaluate( info => info.getAttribute("ng-include") , infoHtmlName)
    return infoHtml
  },

  /**
   * INPUT SELECTOR 에 입력되어 있는 값을 삭제 후 typeText 를 입력한다.
   */
  typeTextAfterClearInput: async function (page, inputSelector, typeText) {
    await page.waitForSelector(inputSelector);
    const elementHandle = await page.$(inputSelector);
    await elementHandle.click();
    await elementHandle.focus();
    // click three times to select all
    await elementHandle.click({clickCount: 3});
    await elementHandle.press('Backspace');
    await elementHandle.type(typeText, {delay: 50});
    await page.waitFor(1000);
  }

};
