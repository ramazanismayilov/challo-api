import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
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
    media?: MediaEntity;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
