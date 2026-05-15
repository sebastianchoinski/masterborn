export const RECRUITMENT_STATUSES = [
    "nowy",
    "w trakcie rozmów",
    "zaakceptowany",
    "odrzucony",
] as const;

export type RecruitmentStatus = typeof RECRUITMENT_STATUSES[number];