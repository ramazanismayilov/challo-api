import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { ChatEntity } from "./Chat.entity";

@Entity('chat_participant')
export class ChatParticipantEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, user => user.chatParticipants, {onDelete: 'CASCADE'})
    user: UserEntity;

    @ManyToOne(() => ChatEntity, chat => chat.participants, { onDelete: 'CASCADE' })
    chat: ChatEntity;

    @CreateDateColumn({ select: false })
    createdAt: Date;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;
}
