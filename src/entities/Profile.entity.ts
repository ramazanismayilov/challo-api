import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserStatus } from "src/common/enums/userStatus.enum";
import { MediaEntity } from "./Media.entity";
import { UserEntity } from "./User.entity";

@Entity('profile')
export class ProfileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserEntity, user => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: UserEntity;

    @OneToOne(() => MediaEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'avatarId' })
    avatar: MediaEntity | null;

    @Column({ nullable: true })
    about: string;

    @Column('timestamp')
    lastSeen: Date;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
    status: UserStatus;

    @CreateDateColumn({ select: false })
    createdAt: Date;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;
}
