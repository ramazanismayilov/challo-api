import { Global, Module } from "@nestjs/common";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { GatewayModule } from "src/libs/socket/socket.module";

@Global()
@Module({
    imports: [GatewayModule],
    controllers: [MessageController],
    providers: [MessageService],
    exports: [MessageService]
})
export class MessageModule { }