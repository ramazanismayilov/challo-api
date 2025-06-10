import { Body, Controller, Get, Post } from "@nestjs/common";
import { Auth } from "src/common/decorators/auth.decorator";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";

@Auth()
@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) { }

    @Get()
    getUserChats() {
        return this.chatService.getUserChats();
    }

    @Post()
    createChat(@Body() body: CreateChatDto) {
        return this.chatService.createChat(body);
    }
}