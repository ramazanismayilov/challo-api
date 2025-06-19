import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
  getRoot(): string {
    return 'NestJS API is running!';
  }
}
