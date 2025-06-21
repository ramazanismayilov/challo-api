import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MediaEntity } from "./Media.entity";
import { UserEntity } from "./User.entity";
import { ChatEntity } from "./Chat.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    text: string

    @ManyToOne(() => MediaEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'mediaId' })
    media: MediaEntity | null;

    @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
    user: UserEntity

    @ManyToOne(() => ChatEntity, (chat) => chat.messages, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'chatId' })
    chat: ChatEntity

    @ManyToMany(() => UserEntity)
    @JoinTable({ name: 'user_deletedMessage' })
    deletedBy: UserEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({select: false})
    updatedAt: Date;
}