import { Controller, Get, Query } from "@nestjs/common";
import { ListJobOffersQueryDto } from "./dto/list-job-offers-query.dto";
import { JobOffersService } from "./job-offers.service";

@Controller("job-offers")
export class JobOffersController {
    constructor(private readonly jobOffersService: JobOffersService) {}

    @Get()
    findAll(@Query() query: ListJobOffersQueryDto) {
        return this.jobOffersService.findAll(query);
    }
}