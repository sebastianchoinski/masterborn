import { Module } from "@nestjs/common";
import { CandidatesModule } from "./candidates/candidates.module";
import { JobOffersModule } from "./job-offers/job-offers.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
    imports: [PrismaModule, CandidatesModule, JobOffersModule],
})
export class AppModule {}