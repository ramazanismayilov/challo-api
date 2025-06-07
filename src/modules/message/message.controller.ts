import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MessageService } from "./message.service";
import { Auth } from "src/common/decorators/auth.decorator";
import { CreateMessageDto } from "./dto/message.dto";
@Auth()
@Controller('chat/:chatId/message')
export class MessageController {
    constructor(private messageService: MessageService) { }

    @Get()
    chatMessages(@Param('chatId') chatId: number) {
        return this.messageService.chatMessages(chatId);
    }

    @Post()
    createMessage(@Param('chatId') chatId: number, @Body() body: CreateMessageDto) {
        return this.messageService.createMessage(chatId, body);
    }
}