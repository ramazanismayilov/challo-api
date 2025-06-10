import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { ChatEntity } from "./Chat.entity";

@Entity('chat_participant')
export class ChatParticipantEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, user => user.chatParticipants)
    user: UserEntity;

    @ManyToOne(() => ChatEntity, chat => chat.participants, { onDelete: 'CASCADE' })
    chat: ChatEntity;

    @Column({ default: 0 })
    unreadMessageCount: number;

    @CreateDateColumn({ select: false })
    createdAt: Date;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;
}
