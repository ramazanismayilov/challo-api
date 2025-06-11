import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MessageService } from "./message.service";
import { Auth } from "src/common/decorators/auth.decorator";
import { CreateMessageDto, UpdateMessageDto } from "./dto/message.dto";
@Auth()
@Controller('chat/:chatId/messages')
export class MessageController {
    constructor(private messageService: MessageService) { }

    @Get()
    getChatMessages(@Param('chatId') chatId: number) {
        return this.messageService.getChatMessages(chatId);
    }

    @Post()
    createMessage(@Param('chatId') chatId: number, @Body() body: CreateMessageDto) {
        return this.messageService.createMessage(chatId, body);
    }

    @Post(':messageId')
    updateMessage(@Param('chatId') chatId: number, @Param('messageId') messageId: number, @Body() body: UpdateMessageDto) {
        return this.messageService.updateMessage(chatId, messageId, body);
    }
}