import { CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./Message.entity";
import { UserEntity } from "./User.entity";

@Entity('chat')
export class ChatEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToMany(() => UserEntity)
    @JoinTable({ name: 'chat_participants' })
    participants: UserEntity[];

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