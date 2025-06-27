import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { Auth } from "src/common/decorators/auth.decorator";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { DeleteChatDto } from "./dto/deleteChat.dto";
import { SearchDto } from "src/common/dto/search.dto";

@Auth()
@Controller('chats')
export class ChatController {
    constructor(private chatService: ChatService) { }

    @Get()
    getUserChats(@Query() query: SearchDto) {
        return this.chatService.getUserChats(query);
    }

    @Post()
    createChat(@Body() body: CreateChatDto) {
        return this.chatService.createChat(body);
    }

    @Delete()
    async deleteChats(@Body() body: DeleteChatDto) {
        return await this.chatService.deleteChats(body);
    }
}