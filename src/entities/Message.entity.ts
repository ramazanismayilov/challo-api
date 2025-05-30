import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageStatus } from "src/common/enums/messageStatus.enum";
import { MediaEntity } from "./Media.entity";
import { UserEntity } from "./User.entity";
import { ChatEntity } from "./Chat.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    content: string

    @OneToOne(() => MediaEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'mediaId' })
    media: MediaEntity | null;

    @ManyToOne(() => UserEntity)
    user: UserEntity

    @ManyToOne(() => ChatEntity, (chat) => chat.messages, { onDelete: 'CASCADE' })
    chat: ChatEntity

    @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.SENT })
    status: MessageStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}