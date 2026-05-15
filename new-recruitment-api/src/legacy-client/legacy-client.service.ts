import { BadGatewayException, ConflictException, Injectable } from "@nestjs/common";

type LegacyCandidatePayload = {
    firstName: string;
    lastName: string;
    email: string;
};

const DEFAULT_LEGACY_API_URL = "http://localhost:4040";
const DEFAULT_LEGACY_API_KEY = "0194ec39-4437-7c7f-b720-7cd7b2c8d7f4";
const REQUEST_TIMEOUT_MS = 5000;

@Injectable()
export class LegacyClientService {
    private readonly baseUrl = process.env.LEGACY_API_URL ?? DEFAULT_LEGACY_API_URL;
    private readonly apiKey = process.env.LEGACY_API_KEY ?? DEFAULT_LEGACY_API_KEY;

    async createCandidate(payload: LegacyCandidatePayload) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(`${this.baseUrl}/candidates`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "x-api-key": this.apiKey,
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            if (response.status === 409) {
                throw new ConflictException("Candidate already exists in legacy API");
            }

            if (!response.ok) {
                throw new BadGatewayException(`Legacy API returned ${response.status}`);
            }
        } catch (error) {
            if (error instanceof ConflictException || error instanceof BadGatewayException) {
                throw error;
            }

            throw new BadGatewayException("Legacy API is not available");
        } finally {
            clearTimeout(timeout);
        }
    }
}