# @joern.kalz/nest-test-setup

Convenient setup of testing modules for [Nest](https://nestjs.com/) applications.

## Motivation

Setting up a testing module including mocks in a Nest applications usually requires some boilerplate code. 

This package provides a concise way for defining a testing modules.

## Installation

```sh
npm i -D @joern.kalz/nest-test-setup
```

or

```sh
yarn add -D @joern.kalz/nest-test-setup
```

In the `jest` section of your `package.json` change the entry `testEnvironment` to:

```json
"testEnvironment": "../node_modules/@joern.kalz/nest-test-setup/env.js"
```

## Usage

### Unit Testing Controllers

With a controller depending on a service

```typescript
// my.controller.ts

@Controller()
export class MyController {
  constructor(private readonly myService: MyService) {}
  @Get()
  getGreeting(): string {
    return this.myService.getGreetingText();
  }
}

// my.service.ts

@Injectable()
export class MyService {
  getGreetingText(): string {
    return "Hello!";
  }
}
```

You can test `MyController` with

```typescript
import {
  controller,
  createTestingModule,
  mockProvider,
} from "@joern.kalz/nest-test-setup";

describe("setup", () => {
  const myController = controller(AppController);
  const myServiceMock = mockProvider(AppService);
  beforeEach(createTestingModule);

  it("should create test module", () => {
    myServiceMock.getGreeting.mockReturnValue("Hello world");
    expect(myController.getHello()).toBe("Hello world");
  });
});
```

### Unit Testing Services

With a service depending on another service

```typescript
// my.service.ts

@Injectable()
export class MyService {
  constructor(private readonly myOtherService: MyOtherService) {}
  getGreetingText(): string {
    return `Hello ${this.myOtherService.getName()}`;
  }
}

// my.other.service.ts

@Injectable()
export class MyOtherService {
  getName(): string {
    return "all";
  }
}
```

You can test `MyService` with

```typescript
import {
  createTestingModule,
  mockProvider,
  provider,
} from "@joern.kalz/nest-test-setup";

describe("setup", () => {
  const myService = provider(MyService);
  const myOtherServiceMock = mockProvider(MyOtherService);
  beforeEach(createTestingModule);

  it("should create test module", () => {
    myOtherServiceMock.getName.mockReturnValue("world");
    expect(myService.getGreetingText()).toBe("Hello world");
  });
});
```

## Contribute

Contributions welcome!
