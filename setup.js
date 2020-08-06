const chalk = require('chalk')
const puppeteer = require('puppeteer')
const fs = require('fs')
const mkdirp = require('mkdirp')
const os = require('os')
const path = require('path')
const info = require('./utils/test-info.js')

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

module.exports = async function() {
  console.log(chalk.green('Setup Puppeteer'))
  const browser = await puppeteer.launch({
    headless: true,
    devtools: false,
    defaultViewport: { width: 2000, height: 1600 },
    ignoreHTTPSErrors: true
  })
  // This global is not available inside tests but only in global teardown
  global.__BROWSER_GLOBAL__ = browser
  // Instead, we expose the connection details via file system to be used in tests
  mkdirp.sync(DIR)
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())

  console.log("INFO = URL : " + info.URL);
  // 로그인 처리
  let page = await global.__BROWSER_GLOBAL__.newPage()
  await page.setViewport({width: 1920, height: 1080})
  await page.goto(info.URL, {waitUntil: 'networkidle0'})
  await page.waitFor('input[name=userId]');
  await page.type('input[name=userId]', info.USERID, {delay: 50});
  await page.type('input[name=password]', info.PASSWORD, {delay: 50});
  await page.click('button[aria-label=로그인]');
  await page.waitFor(2000);
  const loginFailedResult = await page.evaluate(() => {
    const LOGIN_FAILED_SELECTOR = "div.ikc-message-subject > span[ng-bind-html]"
    return document.querySelector(LOGIN_FAILED_SELECTOR).innerHTML;
  });
  if (loginFailedResult.length > 0) {
    console.log(chalk.red(loginFailedResult));
  }
  await page.close()
}
