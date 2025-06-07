import { Global, Module } from "@nestjs/common";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";

@Global()
@Module({
    imports: [],
    controllers: [MessageController],
    providers: [MessageService],
    exports: [MessageService]
})
export class MessageModule { }