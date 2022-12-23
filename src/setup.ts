import { Type } from "@nestjs/common";
import { Test } from "@nestjs/testing";

export function provider<T>(cls: Type<T>): T {
  return createEntity(cls, "provider") as T;
}

export function mockProvider<T>(cls: Type<T>): jest.Mocked<T> {
  return createEntity(cls, "mockProvider") as jest.Mocked<T>;
}

export function controller<T>(cls: Type<T>): T {
  return createEntity(cls, "controller") as T;
}

export async function createTestingModule() {
  const testEnvironment = getTestEnvironment();

  const providers = testEnvironment.entities
    .filter((entity) => entity.type === "provider")
    .map((provider) => provider.cls);

  const mockProviders = testEnvironment.entities
    .filter((entity) => entity.type === "mockProvider")
    .map((provider) => ({
      provide: provider.cls,
      useValue: new Proxy({}, mockingHandler),
    }));

  const controllers = testEnvironment.entities
    .filter((entity) => entity.type === "controller")
    .map((controller) => controller.cls);

  const moduleRef = await Test.createTestingModule({
    providers: [...providers, ...mockProviders],
    controllers,
  }).compile();

  for (const entity of testEnvironment.entities) {
    entity.instance = moduleRef.get(entity.cls);
  }
}

const testEnvironmentsByTestFileName: Map<string, TestEnvironment> = new Map();

interface TestEnvironment {
  entities: Entity[];
}

interface Entity {
  type: EntityType;
  cls: Type<unknown>;
  instance: object | null;
}

type EntityType = "mockProvider" | "provider" | "controller";

function createEntity<T>(cls: Type<T>, type: EntityType): unknown {
  const testEnvironment = getTestEnvironment();

  const entity = {
    type,
    cls,
    instance: null,
  };

  testEnvironment.entities.push(entity);

  return new Proxy(entity, forwardingHandler);
}

const forwardingHandler = {
  get(target: Entity, prop: string, receiver: unknown): unknown {
    if (!target.instance) {
      throw new Error(
        `Getting ${prop} on uninitialized object. Make sure you call createTestingModule first.`
      );
    }

    return Reflect.get(target.instance, prop, receiver);
  },
};

const mockingHandler = {
  get(target: { [key: string]: unknown }, prop: string): unknown {
    if (prop !== "then" && !target[prop]) {
      target[prop] = jest.fn();
    }

    return target[prop];
  },
};

declare global {
  function someFunction(): string;
  // eslint-disable-next-line no-var
  var TEST_FILE_PATH: string;
}

function getTestEnvironment(): TestEnvironment {
  const testFile = global.TEST_FILE_PATH as string;
  const environment = testEnvironmentsByTestFileName.get(testFile);

  if (environment) {
    return environment;
  }

  const newEnvironment = {
    entities: [],
  };
  testEnvironmentsByTestFileName.set(testFile, newEnvironment);
  return newEnvironment;
}
