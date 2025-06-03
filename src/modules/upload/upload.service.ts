import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { Media } from "../../common/enums/media.enum";
import { MediaEntity } from "../../entities/Media.entity";
import { CloudinaryService } from "../../libs/cloudinary/cloudinary.service";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UploadService {
    private mediaRepo: Repository<MediaEntity>;

    constructor(
        private cloudinaryService: CloudinaryService,
        @InjectDataSource() private dataSoruce: DataSource,
    ) {
        this.mediaRepo = this.dataSoruce.getRepository(MediaEntity);
    }

    async getMedias() {
        const medias = await this.mediaRepo.find({ order: { id: 'ASC' } })
        if (medias.length === 0) throw new NotFoundException('Medias not found');

        return medias
    }

    async uploadMedias(files: Express.Multer.File[]) {
        try {
            const uploadedMedias: MediaEntity[] = [];

            for (const file of files) {
                const result = await this.cloudinaryService.uploadFile(file);
                if (!result?.url) continue;

                const isVideo = file.mimetype.startsWith('video/');
                const mediaType = isVideo ? Media.VIDEO : Media.IMAGE;

                const media = this.mediaRepo.create({ url: result.url, type: mediaType });
                await media.save();
                uploadedMedias.push(media);
            }

            if (!uploadedMedias.length) throw new BadRequestException('No medias were uploaded successfully');

            return uploadedMedias;
        } catch (err) {
            console.log(err);
            throw new BadRequestException('Something went wrong');
        }
    }

    async deletemedia(id: string) {
        if (!isUUID(id)) throw new BadRequestException('Media id type is wrong');

        const media = await this.mediaRepo.findOne({ where: { id } });
        if (!media) throw new NotFoundException('Media not found');

        await this.mediaRepo.remove(media);
        return { message: "Media deleted successfully" };
    }
}