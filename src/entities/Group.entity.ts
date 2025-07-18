import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MediaEntity } from "./Media.entity";
import { UserEntity } from "./User.entity";
import { ChatEntity } from "./Chat.entity";

@Entity('group')
export class GroupEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ type: 'text', nullable: true })
    description?: string;

    @OneToOne(() => MediaEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'imageId' })
    image: MediaEntity | null;

    @ManyToOne(() => UserEntity, (user) => user.createdGroups, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: 'creatorId' })
    creator: UserEntity;

    @ManyToMany(() => UserEntity)
    @JoinTable({ name: 'group_admins' })
    admins: UserEntity[];

    @ManyToMany(() => UserEntity, (user) => user.groups, { cascade: true })
    @JoinTable({ name: 'group_members' })
    members: UserEntity[];

    @OneToOne(() => ChatEntity, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chatId' })
    chat: ChatEntity;

    @CreateDateColumn({ select: false })
    createdAt: Date;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;
}