module.exports = {
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  testEnvironment: './puppeteer_environment.js',
  testTimeout: 50000,
  reporters: [
    "default",
    [
      "jest-stare",
      {
        "resultDir": "results/jest-stare",
        "reportTitle": "jest-stare!",
        "additionalResultsProcessors": [
          "jest-junit"
        ],
        "coverageLink": "../../coverage/lcov-report/index.html",
        "jestStareConfigJson": "jest-stare.json",
        "jestGlobalConfigJson": "globalStuff.json"
      }
    ]
  ]
}
