import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { MessageEntity } from "src/entities/Message.entity";
import { DataSource, Repository } from "typeorm";
import { CreateMessageDto } from "./dto/message.dto";
import { UserEntity } from "src/entities/User.entity";
import { ClsService } from "nestjs-cls";
import { ChatEntity } from "src/entities/Chat.entity";
import { MediaEntity } from "src/entities/Media.entity";

@Injectable()
export class MessageService {
    private messageRepo: Repository<MessageEntity>
    private chatRepo: Repository<ChatEntity>
    private mediaRepo: Repository<MediaEntity>

    constructor(
        private cls: ClsService,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.messageRepo = this.dataSource.getRepository(MessageEntity)
        this.chatRepo = this.dataSource.getRepository(ChatEntity)
        this.mediaRepo = this.dataSource.getRepository(MediaEntity)
    }

    async chatMessages(chatId: number) {
        let user = this.cls.get<UserEntity>('user')
        let chat = await this.chatRepo.findOne({ where: { id: chatId }, relations: ['participants', 'messages'] })
        if (!chat) throw new NotFoundException('Chat not found')

        let checkParticipant = chat.participants.some((participant) => participant.id === user.id);
        if (!checkParticipant) throw new ForbiddenException();
    }

    async createMessage(chatId: number, params: CreateMessageDto) {
        let user = this.cls.get<UserEntity>('user')
        let chat = await this.chatRepo.findOne({ where: { id: chatId }, relations: ['participants', 'participants.user', 'messages'] })
        if (!chat) throw new NotFoundException('Chat not found')

        let checkParticipant = chat.participants.some((participant) => participant.user.id === user.id);
        if (!checkParticipant) throw new ForbiddenException();

        let media: MediaEntity | null = null;
        if (params.mediaId) {
            media = await this.mediaRepo.findOne({ where: { id: params.mediaId } })
            if (!media) throw new NotFoundException('Media not found')
        }

        const newMessage = this.messageRepo.create({
            text: params.text,
            user,
            chat,
            media
        });

        const savedMessage = await this.messageRepo.save(newMessage);
        return { messsage: 'Message created successfully', savedMessage };
    }
}