import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { MessageEntity } from "src/entities/Message.entity";
import { DataSource, Repository } from "typeorm";
import { CreateMessageDto } from "./dto/message.dto";
import { UserEntity } from "src/entities/User.entity";
import { ClsService } from "nestjs-cls";
import { ChatEntity } from "src/entities/Chat.entity";
import { MediaEntity } from "src/entities/Media.entity";
import { ChatParticipantEntity } from "src/entities/Participiant.entity";

@Injectable()
export class MessageService {
    private messageRepo: Repository<MessageEntity>
    private chatRepo: Repository<ChatEntity>
    private chatParticipantRepo: Repository<ChatParticipantEntity>
    private mediaRepo: Repository<MediaEntity>

    constructor(
        private cls: ClsService,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.messageRepo = this.dataSource.getRepository(MessageEntity)
        this.chatRepo = this.dataSource.getRepository(ChatEntity)
        this.chatParticipantRepo = this.dataSource.getRepository(ChatParticipantEntity)
        this.mediaRepo = this.dataSource.getRepository(MediaEntity)
    }

    async chatMessages(chatId: number) {
        const user = this.cls.get<UserEntity>('user');

        const chat = await this.chatRepo.findOne({
            where: { id: chatId },
            relations: ['participants', 'participants.user'], 
        });

        if (!chat) throw new NotFoundException('Chat not found');

        const isParticipant = chat.participants.some(participant => participant.user.id === user.id);
        if (!isParticipant) throw new ForbiddenException();

        const messages = await this.messageRepo.find({
            where: { chat: { id: chatId } },
            relations: ['user', 'media'],
            order: { createdAt: 'DESC' },
        });
        return { messages }
    }

    async createMessage(chatId: number, params: CreateMessageDto) {
        let user = this.cls.get<UserEntity>('user')
        let chat = await this.chatRepo.findOne({ where: { id: chatId }, relations: ['participants', 'participants.user'] })
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
        await Promise.all(
            chat.participants.map(async (participant) => {
                if (participant.user.id !== user.id) {
                    participant.unreadMessageCount += 1;
                    await this.chatParticipantRepo.save(participant);
                }
            })
        );
        chat.lastMessage = savedMessage;
        await this.chatRepo.save(chat);
        return { message: 'Message created successfully', savedMessage };
    }
}