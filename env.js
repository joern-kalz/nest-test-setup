const NodeEnvironment = require("jest-environment-node");

class CustomNodeEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.TEST_FILE_PATH = context.testPath;
  }
}

module.exports = CustomNodeEnvironment;
