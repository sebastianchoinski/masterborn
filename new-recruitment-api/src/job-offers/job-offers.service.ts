import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ListJobOffersQueryDto } from "./dto/list-job-offers-query.dto";

@Injectable()
export class JobOffersService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: ListJobOffersQueryDto) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;

        const [offers, total] = await Promise.all([
            this.prisma.jobOffer.findMany({
                skip,
                take: pageSize,
                orderBy: { id: "asc" },
            }),
            this.prisma.jobOffer.count(),
        ]);

        return {
            data: offers,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
                hasNext: skip + offers.length < total,
            },
        };
    }
}