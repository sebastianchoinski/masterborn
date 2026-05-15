## Recruitment API

The repository contains two services:

- `legacy-api` - old Express API used only for compatibility when a candidate is created.
- `new-recruitment-api` - NestJS + Prisma API for candidate management.

The legacy API is not changed by the new application. The new API calls it during candidate creation and only saves the candidate locally after the legacy call succeeds.

## Requirements

- Node.js 20+
- Docker and Docker Compose
- Make, optional but useful for shortcuts

## Run with Docker

```bash
make up
```

This starts:

- legacy API on `http://localhost:4040`
- new recruitment API on `http://localhost:3000`

The new API container runs Prisma migrations and seed data on startup. SQLite data is stored in a Docker volume.

## Local Development

```bash
make install
cd new-recruitment-api
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Start the legacy API in another terminal when testing the full create flow:

```bash
docker compose up legacy-api
```

## Useful Commands

```bash
make test
make build
make migrate
make seed
make down
```

## API Examples

List job offers:

```bash
curl http://localhost:3000/job-offers
```

Create candidate:

```bash
curl -X POST http://localhost:3000/candidates \
  -H "content-type: application/json" \
  -d '{
    "firstName": "Ada",
    "lastName": "Lovelace",
    "email": "ada@example.com",
    "phone": "+48123123123",
    "yearsOfExperience": 3,
    "recruiterNotes": "strong backend basics",
    "recruitmentStatus": "nowy",
    "consentAcceptedAt": "2026-05-15T15:00:00.000Z",
    "jobOfferIds": [1, 2]
  }'
```

List candidates for one job offer:

```bash
curl "http://localhost:3000/candidates?jobOfferId=1&page=1&pageSize=20"
```

## Candidate Rules

- Candidate email is unique in the new API.
- Candidate must be assigned to at least one job offer.
- Supported recruitment statuses are `nowy`, `w trakcie rozmów`, `zaakceptowany`, and `odrzucony`.
- If the legacy API returns an error, including its random `504`, the new API returns an error and does not save the candidate locally.

## Tests

The test suite covers candidate creation, validation, duplicate email, missing job offers, legacy failure, and paginated listing.

```bash
make test
```
