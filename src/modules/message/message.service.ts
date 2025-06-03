import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { MessageEntity } from "src/entities/Message.entity";
import { DataSource, Repository } from "typeorm";
import { CreateMessageDto } from "./dto/message.dto";
import { UserEntity } from "src/entities/User.entity";
import { ClsService } from "nestjs-cls";

@Injectable()
export class MessageService {
    private messageRepo: Repository<MessageEntity>

    constructor(
        private cls: ClsService,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.messageRepo = this.dataSource.getRepository(MessageEntity)
    }

    createMessage(chatId: number, params: CreateMessageDto){
        let user = this.cls.get<UserEntity>('user')
    }
}