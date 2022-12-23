import { EnvironmentContext, JestEnvironmentConfig } from "@jest/environment";
import TestEnvironment from "jest-environment-node";

export class CustomJestEnvironment extends TestEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    this.global.TEST_FILE_PATH = context.testPath;
  }
}
