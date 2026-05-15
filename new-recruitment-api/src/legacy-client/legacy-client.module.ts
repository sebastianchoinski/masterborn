import { Module } from "@nestjs/common";
import { LegacyClientService } from "./legacy-client.service";

@Module({
    providers: [LegacyClientService],
    exports: [LegacyClientService],
})
export class LegacyClientModule {}