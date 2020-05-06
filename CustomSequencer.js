const Sequencer = require('@jest/test-sequencer').default;
class CustomSequencer extends Sequencer {
  sort(tests) {
    // Test structure information
    // https://github.com/facebook/jest/blob/6b8b1404a1d9254e7d5d90a8934087a9c9899dab/packages/jest-runner/src/types.ts#L17-L21
    const copyTests = Array.from(tests);
    return copyTests.sort((testA, testB) => {
      const numberA = testA.path.split("_")[0];
      const numberB = testB.path.split("_")[0];
      if (numberA > numberB) return -1;
      if (numberA < numberB) return 1;
      return 0;
    });
  }
}

module.exports = CustomSequencer;