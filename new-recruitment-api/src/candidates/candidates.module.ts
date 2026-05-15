import { Module } from "@nestjs/common";
import { LegacyClientModule } from "../legacy-client/legacy-client.module";
import { CandidatesController } from "./candidates.controller";
import { CandidatesService } from "./candidates.service";

@Module({
    imports: [LegacyClientModule],
    controllers: [CandidatesController],
    providers: [CandidatesService],
})
export class CandidatesModule {}