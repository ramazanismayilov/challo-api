import { CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./Message.entity";
import { ChatParticipantEntity } from "./Participiant.entity";
import { GroupEntity } from "./Group.entity";

@Entity('chat')
export class ChatEntity {
    @PrimaryGeneratedColumn()
    id: number

    @OneToMany(() => ChatParticipantEntity, (participants) => participants.chat)
    participants: ChatParticipantEntity[];

    @OneToOne(() => GroupEntity)
    group: GroupEntity;

    @OneToMany(() => MessageEntity, (message) => message.chat, { cascade: true })
    messages: MessageEntity[];

    @OneToOne(() => MessageEntity, { nullable: true })
    @JoinColumn({ name: 'lastMessageId' })
    lastMessage: MessageEntity | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}