import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ChatEntity } from "src/entities/Chat.entity";
import { DataSource, Repository } from "typeorm";
import { CreateChatDto } from "./dto/create-chat.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/entities/User.entity";
import { ChatParticipantEntity } from "src/entities/Participiant.entity";
import { MessageService } from "../message/message.service";

@Injectable()
export class ChatService {
    private chatRepo: Repository<ChatEntity>
    private userRepo: Repository<UserEntity>
    private chatParticipantRepo: Repository<ChatParticipantEntity>

    constructor(
        private cls: ClsService,
        private messageService: MessageService,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.chatRepo = this.dataSource.getRepository(ChatEntity)
        this.userRepo = this.dataSource.getRepository(UserEntity)
        this.chatParticipantRepo = this.dataSource.getRepository(ChatParticipantEntity)
    }

    async createChat(params: CreateChatDto) {
        let currentUser = this.cls.get<UserEntity>('user')
        if (params.userId === currentUser.id) throw new BadRequestException('You cannot send message to yourself');

        const targetUser = await this.userRepo.findOne({ where: { id: params.userId } });
        if (!targetUser) throw new NotFoundException('User not found');

        const existingChat = await this.chatRepo
            .createQueryBuilder('chat')
            .innerJoin('chat.participants', 'participant')
            .where('participant.userId IN (:...userIds)', { userIds: [currentUser.id, targetUser.id] })
            .groupBy('chat.id')
            .having('COUNT(DISTINCT participant.userId) = 2') 
            .getOne();

        if (existingChat) throw new ConflictException('Chat already exists');

        const chat = this.chatRepo.create();
        await this.chatRepo.save(chat);

        const participants = [
            this.chatParticipantRepo.create({ user: currentUser, chat, unreadMessageCount: 0 }),
            this.chatParticipantRepo.create({ user: targetUser, chat, unreadMessageCount: 1 }),
        ];
        await this.chatParticipantRepo.save(participants);

        const messageDto = {
            content: params.message,
            mediaId: (params as any).mediaId
        };

        const { savedMessage } = await this.messageService.createMessage(chat.id, messageDto);

        chat.lastMessage = savedMessage;
        await this.chatRepo.save(chat);

        return { message: 'Chat is created', chat };

    }
}