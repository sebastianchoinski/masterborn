import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { LegacyClientService } from "../legacy-client/legacy-client.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { ListCandidatesQueryDto } from "./dto/list-candidates-query.dto";

const candidateInclude = Prisma.validator<Prisma.CandidateDefaultArgs>()({
    include: {
        applications: {
            include: { jobOffer: true },
            orderBy: { jobOfferId: "asc" },
        },
    },
});

type CandidateWithApplications = Prisma.CandidateGetPayload<typeof candidateInclude>;

@Injectable()
export class CandidatesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly legacyClient: LegacyClientService,
    ) {}

    async create(dto: CreateCandidateDto) {
        const jobOfferIds = [...new Set(dto.jobOfferIds)];

        await this.assertEmailIsFree(dto.email);
        await this.assertJobOffersExist(jobOfferIds);
        await this.legacyClient.createCandidate({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
        });

        try {
            const candidate = await this.prisma.candidate.create({
                data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email,
                    phone: dto.phone,
                    yearsOfExperience: dto.yearsOfExperience,
                    recruiterNotes: dto.recruiterNotes,
                    recruitmentStatus: dto.recruitmentStatus,
                    consentAcceptedAt: new Date(dto.consentAcceptedAt),
                    applications: {
                        create: jobOfferIds.map((jobOfferId) => ({
                            jobOffer: { connect: { id: jobOfferId } },
                        })),
                    },
                },
                ...candidateInclude,
            });

            return this.toResponse(candidate);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new ConflictException("Candidate with this email already exists");
            }

            throw error;
        }
    }

    async findAll(query: ListCandidatesQueryDto) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where: Prisma.CandidateWhereInput = query.jobOfferId
            ? { applications: { some: { jobOfferId: query.jobOfferId } } }
            : {};

        const [candidates, total] = await Promise.all([
            this.prisma.candidate.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: "desc" },
                ...candidateInclude,
            }),
            this.prisma.candidate.count({ where }),
        ]);

        return {
            data: candidates.map((candidate) => this.toResponse(candidate)),
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
                hasNext: skip + candidates.length < total,
            },
        };
    }

    private async assertEmailIsFree(email: string) {
        const candidate = await this.prisma.candidate.findUnique({ where: { email } });

        if (candidate) {
            throw new ConflictException("Candidate with this email already exists");
        }
    }

    private async assertJobOffersExist(jobOfferIds: number[]) {
        const offers = await this.prisma.jobOffer.findMany({
            where: { id: { in: jobOfferIds } },
            select: { id: true },
        });
        const existingIds = new Set(offers.map((offer) => offer.id));
        const missingIds = jobOfferIds.filter((id) => !existingIds.has(id));

        if (missingIds.length > 0) {
            throw new BadRequestException(`Job offers not found: ${missingIds.join(", ")}`);
        }
    }

    private toResponse(candidate: CandidateWithApplications) {
        return {
            id: candidate.id,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            phone: candidate.phone,
            yearsOfExperience: candidate.yearsOfExperience,
            recruiterNotes: candidate.recruiterNotes,
            recruitmentStatus: candidate.recruitmentStatus,
            consentAcceptedAt: candidate.consentAcceptedAt.toISOString(),
            createdAt: candidate.createdAt.toISOString(),
            jobOffers: candidate.applications.map((application) => ({
                id: application.jobOffer.id,
                title: application.jobOffer.title,
            })),
        };
    }
}