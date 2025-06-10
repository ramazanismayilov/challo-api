import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "src/common/enums/role.enum";
import { ProfileEntity } from "./Profile.entity";
import { GroupEntity } from "./Group.entity";
import { StatusEntity } from "./Status.entity";
import { ChatParticipantEntity } from "./Participiant.entity";

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    displayName: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true, nullable: true, type: 'varchar', select: false })
    pendingEmail?: string | null

    @Column({ select: false })
    password: string;

    @Column({ default: false, select: false })
    isVerified: boolean

    @Column({ type: 'int', nullable: true, select: false })
    otpCode: number | null;

    @Column({ type: 'timestamp', nullable: true, select: false })
    otpExpiredAt: Date | null;

    @Column({ type: 'varchar', nullable: true, select: false })
    refreshToken: string | null;

    @Column({ type: 'timestamp', nullable: true, select: false })
    refreshTokenDate: Date | null;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER, select: false })
    role: UserRole;

    @OneToOne(() => ProfileEntity, profile => profile.user, { cascade: true })
    profile: ProfileEntity;

    @OneToMany(() => GroupEntity, (chat) => chat.creator)
    createdGroups: GroupEntity[];

    @ManyToMany(() => GroupEntity, (chat) => chat.members)
    groups: GroupEntity[];

    @OneToMany(() => StatusEntity, (status) => status.user)
    statuses: StatusEntity[];

    @OneToMany(() => ChatParticipantEntity, (participantMeta) => participantMeta.user)
    chatParticipants: ChatParticipantEntity[];

    @CreateDateColumn({ select: false })
    createdAt: Date;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;
}
