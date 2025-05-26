import { UserStatus } from "src/common/enums/userStatus.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ImageEntity } from "./Image.entity";

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => ImageEntity, { onDelete: 'SET NULL' })
    @JoinColumn({
        name: 'avatarId',
        referencedColumnName: 'id',
    })
    avatar: ImageEntity | null;

    @Column()
    displayName: string;

    @Column()
    about: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
    status: UserStatus;

    @Column('timestamp')
    lastSeen: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
