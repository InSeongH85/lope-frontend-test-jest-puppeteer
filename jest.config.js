module.exports = {
  testURL: "http://plibrary.inek.kr/solars",
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  testEnvironment: './puppeteer_environment.js',
  testSequencer: './CustomSequencer.js',
  testTimeout: 50000
}
