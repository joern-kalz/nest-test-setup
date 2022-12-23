import { Controller, Get, Injectable, Query } from "@nestjs/common";
import {
  controller,
  createTestingModule,
  mockProvider,
  provider,
} from "./setup";

@Injectable()
class GreetingService {
  getGreeting() {
    return "hello";
  }
}

@Injectable()
class MessageService {
  constructor(private readonly greetingService: GreetingService) {}
  getGreetingMessage(name: string) {
    return `${this.greetingService.getGreeting()} ${name}`;
  }
}

@Controller()
class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @Get()
  getGreetingMessage(@Query("name") name: string) {
    return this.messageService.getGreetingMessage(name);
  }
}

describe("setup", () => {
  const greetingService = mockProvider(GreetingService);
  provider(MessageService);
  const messageController = controller(MessageController);

  beforeEach(createTestingModule);

  it("should mock GreetingService", () => {
    greetingService.getGreeting.mockReturnValue("hi");
    expect(messageController.getGreetingMessage("world")).toBe("hi world");
  });
});
