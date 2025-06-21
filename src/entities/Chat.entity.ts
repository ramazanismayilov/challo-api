import { CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./Message.entity";
import { ChatParticipantEntity } from "./Participiant.entity";
import { GroupEntity } from "./Group.entity";
import { UserEntity } from "./User.entity";

@Entity('chat')
export class ChatEntity {
    @PrimaryGeneratedColumn()
    id: number

    @OneToMany(() => ChatParticipantEntity, (participants) => participants.chat)
    participants: ChatParticipantEntity[];

    @OneToOne(() => GroupEntity, { nullable: true })
    group?: GroupEntity;

    @OneToMany(() => MessageEntity, (message) => message.chat, { cascade: true })
    messages: MessageEntity[];

    @OneToOne(() => MessageEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'lastMessageId' })
    lastMessage: MessageEntity | null;

    @ManyToMany(() => UserEntity)
    @JoinTable({ name: 'user_deletedChats' })
    deletedBy: UserEntity[];

    @CreateDateColumn({ select: false })
    createdAt: Date;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;
}