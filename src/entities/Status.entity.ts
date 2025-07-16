import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { MediaEntity } from './Media.entity';
import { UserEntity } from './User.entity';

@Entity('status')
export class StatusEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.statuses, { onDelete: 'CASCADE' })
    user: UserEntity;

    @Column({ nullable: true })
    text?: string;

    @OneToOne(() => MediaEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'mediaId' })
    media?: MediaEntity | null;

    @ManyToMany(() => UserEntity, { cascade: true })
    @JoinTable({ name: 'status_views' })
    viewers: UserEntity[];

    @Column({ default: 0 })
    viewCount: number

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @CreateDateColumn({ select: false })
    createdAt: Date;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;
}
