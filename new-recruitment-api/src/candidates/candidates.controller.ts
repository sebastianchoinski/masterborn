import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CandidatesService } from "./candidates.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { ListCandidatesQueryDto } from "./dto/list-candidates-query.dto";

@Controller("candidates")
export class CandidatesController {
    constructor(private readonly candidatesService: CandidatesService) {}

    @Post()
    create(@Body() dto: CreateCandidateDto) {
        return this.candidatesService.create(dto);
    }

    @Get()
    findAll(@Query() query: ListCandidatesQueryDto) {
        return this.candidatesService.findAll(query);
    }
}