import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { MessageEntity } from "src/entities/Message.entity";
import { DataSource, Repository } from "typeorm";
import { CreateMessageDto, UpdateMessageDto } from "./dto/message.dto";
import { UserEntity } from "src/entities/User.entity";
import { ClsService } from "nestjs-cls";
import { ChatEntity } from "src/entities/Chat.entity";
import { MediaEntity } from "src/entities/Media.entity";
import { addHours, format } from 'date-fns';
import { SocketGateway } from "src/libs/socket/socket.gateway";

@Injectable()
export class MessageService {
    private messageRepo: Repository<MessageEntity>
    private chatRepo: Repository<ChatEntity>
    private mediaRepo: Repository<MediaEntity>

    constructor(
        private cls: ClsService,
        private socketGateway: SocketGateway,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.messageRepo = this.dataSource.getRepository(MessageEntity)
        this.chatRepo = this.dataSource.getRepository(ChatEntity)
        this.mediaRepo = this.dataSource.getRepository(MediaEntity)
    }

    async getChatMessages(chatId: number) {
        const user = this.cls.get<UserEntity>('user');

        const chat = await this.chatRepo
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.participants', 'participant')
            .leftJoinAndSelect('participant.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('profile.avatar', 'avatar')
            .where('chat.id = :chatId', { chatId })
            .select([
                'chat.id',
                'participant.id',
                'user.id',
                'user.displayName'
            ])
            .getOne();
        if (!chat) throw new NotFoundException('Chat not found');

        const isParticipant = chat.participants.some(participant => participant.user.id === user.id);
        if (!isParticipant) throw new ForbiddenException();

        const messages = await this.messageRepo.find({
            where: { chat: { id: chatId } },
            relations: ['user', 'media', 'deletedBy'],
            select: {
                user: {
                    id: true,
                    displayName: true
                },
                media: {
                    url: true
                }
            },
            order: { createdAt: 'DESC' },
        });

        const visibleMessages = messages.filter(message => !message.deletedBy?.some(deletedUser => deletedUser.id === user.id));
        const formattedMessages = visibleMessages.map((item) => ({
            text: item.text,
            user: {
                id: item.user.id,
                displayName: item.user.displayName
            },
            media: {
                url: item.media?.url || null
            },
            sendDate: item.createdAt ? format(addHours(new Date(item.createdAt), 4), "yyyy-MM-dd'T'HH:mm") : null
        }));
        return { data: formattedMessages }
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
        chat.lastMessage = savedMessage;
        await this.chatRepo.save(chat);

        this.socketGateway.emitNewMessage(chat.id, {
            id: savedMessage.id,
            text: savedMessage.text,
            user: {
                id: user.id,
                displayName: user.displayName,
            },
            media: media ? {
                id: media.id,
                url: media.url,
            } : null,
            createdAt: savedMessage.createdAt,
        });
        return { message: 'Message created successfully' };
    }

    async updateMessage(chatId: number, messageId: number, params: UpdateMessageDto) {
        const user = this.cls.get<UserEntity>('user');

        const chat = await this.chatRepo.findOne({ where: { id: chatId } });
        if (!chat) throw new NotFoundException('Chat not found');

        const message = await this.messageRepo.findOne({ where: { id: messageId, chat: { id: chatId }, user: { id: user.id } } });
        if (!message) throw new NotFoundException('Message not found');

        let media: MediaEntity | null = null;
        if (params.mediaId) {
            media = await this.mediaRepo.findOne({ where: { id: params.mediaId } });
            if (!media) throw new NotFoundException('Media not found');
        }

        message.text = params.text ?? message.text;
        message.media = media ?? message.media;

        const updatedMessage = await this.messageRepo.save(message);
        const formattedMessage = {
            id: updatedMessage.id,
            text: updatedMessage.text,
            sendDate: format(addHours(new Date(updatedMessage.updatedAt), 4), "yyyy-MM-dd'T'HH:mm"),
            media: updatedMessage.media ?? null,
        };
        return { message: 'Message updated successfully', data: formattedMessage };
    }

    async deleteMessage(chatId: number, messageId: number) {
        const user = this.cls.get<UserEntity>('user');

        const message = await this.messageRepo.findOne({
            where: { id: messageId, chat: { id: chatId } },
            relations: ['deletedBy', 'chat']
        });

        if (!message) throw new NotFoundException('Message not found');

        if (!message.deletedBy) message.deletedBy = [];
        const alreadyDeleted = message.deletedBy.some(u => u.id === user.id);
        if (!alreadyDeleted) {
            message.deletedBy.push(user);
            await this.messageRepo.save(message);
        }

        return { message: 'Message deleted for user' };
    }

    async deleteMessages(chatId: number) {
        const user = this.cls.get<UserEntity>('user');

        const messages = await this.messageRepo.find({
            where: { chat: { id: chatId } },
            relations: ['deletedBy', 'chat']
        });

        for (const message of messages) {
            if (!message.deletedBy) message.deletedBy = [];
            const alreadyDeleted = message.deletedBy.some(u => u.id === user.id);
            if (!alreadyDeleted) {
                message.deletedBy.push(user);
                await this.messageRepo.save(message);
            }
        }

        return { message: 'All messages deleted for user' };
    }
}