import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { StatusEntity } from "src/entities/Status.entity";
import { DataSource, MoreThan, Not, Repository } from "typeorm";
import { CreateStatusDto } from "./dto/status.dto";
import { UserEntity } from "src/entities/User.entity";
import { MediaEntity } from "src/entities/Media.entity";

@Injectable()
export class StatusService {
    private statusRepo: Repository<StatusEntity>
    private userRepo: Repository<UserEntity>
    private mediaRepo: Repository<MediaEntity>

    constructor(
        private cls: ClsService,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.statusRepo = this.dataSource.getRepository(StatusEntity)
        this.userRepo = this.dataSource.getRepository(UserEntity)
        this.mediaRepo = this.dataSource.getRepository(MediaEntity)
    }

    async getAllStatuses() {
        let statuses = await this.statusRepo.find({ relations: ['media', 'user', 'user.profile', 'user.profile.avatar'] })
        if (!statuses) throw new NotFoundException('Status not found')

        const result = statuses.map((status) => ({
            id: status.id,
            text: status.text ? status.text : null,
            viewCount: status.viewCount,
            createdAt: status.createdAt,
            expiresAt: status.expiresAt,
            user: {
                id: status.user.id,
                avatar: status.user.profile.avatar?.url || null,
                displayName: status.user.displayName,
            },
            media: status.media ? status.media.url : null,
        }));

        return { data: result }
    }

    async getStatusesForViewer() {
        const currentUser = this.cls.get<UserEntity>('user');

        const statuses = await this.statusRepo.find({
            where: {
                user: Not(currentUser.id),
                expiresAt: MoreThan(new Date()),
            },
            relations: ['media', 'user', 'user.profile', 'user.profile.avatar'],
            order: { createdAt: 'DESC' },
        });

        if (!statuses.length) throw new NotFoundException('Not Found');

        const result = statuses.map((status) => ({
            id: status.id,
            text: status.text ? status.text : null,
            createdAt: status.createdAt,
            user: {
                id: status.user.id,
                avatar: status.user.profile.avatar?.url || null,
                displayName: status.user.displayName,
            },
            media: status.media ? status.media.url : null,
        }));

        return { data: result };
    }

    async createStatus(params: CreateStatusDto) {
        const currentUser = this.cls.get<UserEntity>('user');
        const user = await this.userRepo.findOne({ where: { id: currentUser.id } });
        if (!user) throw new NotFoundException('User not found');

        if (!params.text && !params.mediaId) throw new BadRequestException('You must send at least one of text or media');

        let media: MediaEntity | null = null;
        if (params.mediaId) {
            media = await this.mediaRepo.findOne({ where: { id: params.mediaId } });
            if (!media) throw new NotFoundException('Media not found');
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const status = this.statusRepo.create({
            user,
            text: params.text,
            media,
            expiresAt,
        });
        const savedStatus = await this.statusRepo.save(status);
        return {
            message: "Status created successfully",
            data: {
                id: savedStatus.id,
                text: savedStatus.text,
                expiresAt: savedStatus.expiresAt,
                viewCount: savedStatus.viewCount,
                user: {
                    displayName: user.displayName,
                    email: user.email,
                },
                media: media
                    ? {
                        id: media.id,
                        type: media.type,
                        url: media.url,
                    }
                    : null,
            },
        };
    }

    async getUserStatuses(userId: number) { }
    async getStatusById(statusId: number) { }
    async getStatusViewers(statusId: number) { }
    async updateStatus(id: number, params: any) { }
    async deleteStatus(statusId: number) { }
}