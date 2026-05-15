import { BadGatewayException, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";
import request from "supertest";
import { AppModule } from "../app.module";
import { LegacyClientService } from "../legacy-client/legacy-client.service";
import { PrismaService } from "../prisma/prisma.service";

const testDbPath = join(process.cwd(), "test-create-candidate.db");
const testDatabaseUrl = `file:${testDbPath}`;

describe("Create Candidate", () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let legacyClient: { createCandidate: jest.Mock };

    beforeAll(async () => {
        process.env.DATABASE_URL = testDatabaseUrl;
        removeTestDb();
        execFileSync("npx", ["prisma", "migrate", "deploy"], {
            cwd: process.cwd(),
            env: { ...process.env, DATABASE_URL: testDatabaseUrl },
            stdio: "pipe",
        });

        legacyClient = { createCandidate: jest.fn() };
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LegacyClientService)
            .useValue(legacyClient)
            .compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }));
        await app.init();
        prisma = app.get(PrismaService);
    });

    beforeEach(async () => {
        legacyClient.createCandidate.mockReset();
        legacyClient.createCandidate.mockResolvedValue(undefined);
        await prisma.candidateApplication.deleteMany();
        await prisma.candidate.deleteMany();
        await prisma.jobOffer.deleteMany();
        await prisma.jobOffer.createMany({
            data: [
                { id: 1, title: "Node.js Developer", description: "Backend role" },
                { id: 2, title: "Frontend Developer", description: "UI role" },
            ],
        });
    });

    afterAll(async () => {
        await app.close();
        removeTestDb();
    });

    it("should create a new candidate successfully", async () => {
        const response = await request(app.getHttpServer())
            .post("/candidates")
            .send(createPayload())
            .expect(201);

        expect(response.body.email).toBe("ada@example.com");
        expect(response.body.jobOffers).toHaveLength(2);
        expect(legacyClient.createCandidate).toHaveBeenCalledWith({
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@example.com",
        });

        const savedCandidate = await prisma.candidate.findUnique({ where: { email: "ada@example.com" } });
        expect(savedCandidate).not.toBeNull();
    });

    it("should reject candidate without job offers", async () => {
        await request(app.getHttpServer())
            .post("/candidates")
            .send(createPayload({ jobOfferIds: [] }))
            .expect(400);

        expect(legacyClient.createCandidate).not.toHaveBeenCalled();
    });

    it("should reject duplicate email before calling legacy again", async () => {
        await request(app.getHttpServer())
            .post("/candidates")
            .send(createPayload())
            .expect(201);

        await request(app.getHttpServer())
            .post("/candidates")
            .send(createPayload({ firstName: "Grace" }))
            .expect(409);

        expect(legacyClient.createCandidate).toHaveBeenCalledTimes(1);
    });

    it("should reject invalid payload", async () => {
        await request(app.getHttpServer())
            .post("/candidates")
            .send(createPayload({ email: "wrong", yearsOfExperience: -1 }))
            .expect(400);

        expect(legacyClient.createCandidate).not.toHaveBeenCalled();
    });

    it("should not save candidate when legacy sync fails", async () => {
        legacyClient.createCandidate.mockRejectedValueOnce(new BadGatewayException("Legacy API is not available"));

        await request(app.getHttpServer())
            .post("/candidates")
            .send(createPayload())
            .expect(502);

        expect(await prisma.candidate.count()).toBe(0);
    });

    it("should list candidates by job offer with pagination", async () => {
        await request(app.getHttpServer()).post("/candidates").send(createPayload({ email: "ada@example.com" })).expect(201);
        await request(app.getHttpServer()).post("/candidates").send(createPayload({ email: "grace@example.com", jobOfferIds: [1] })).expect(201);
        await request(app.getHttpServer()).post("/candidates").send(createPayload({ email: "linus@example.com", jobOfferIds: [2] })).expect(201);

        const response = await request(app.getHttpServer())
            .get("/candidates")
            .query({ jobOfferId: 1, page: 1, pageSize: 1 })
            .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.pagination).toEqual({
            page: 1,
            pageSize: 1,
            total: 2,
            totalPages: 2,
            hasNext: true,
        });
    });
});

function createPayload(overrides: Record<string, unknown> = {}) {
    return {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        phone: "+48123123123",
        yearsOfExperience: 3,
        recruiterNotes: "strong backend basics",
        recruitmentStatus: "nowy",
        consentAcceptedAt: "2026-05-15T15:00:00.000Z",
        jobOfferIds: [1, 2],
        ...overrides,
    };
}

function removeTestDb() {
    for (const suffix of ["", "-journal", "-shm", "-wal"]) {
        rmSync(`${testDbPath}${suffix}`, { force: true });
    }
}
