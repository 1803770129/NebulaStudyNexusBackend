import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserType } from '@/common/decorators/user-type.decorator';
import { QueryKnowledgePointDto } from './dto/query-knowledge-point.dto';
import { KnowledgePointService } from './knowledge-point.service';

@ApiTags('student-knowledge-points')
@ApiBearerAuth('JWT-auth')
@Controller('student/knowledge-points')
@UserType('student')
export class StudentKnowledgePointController {
  constructor(private readonly kpService: KnowledgePointService) {}

  @Get()
  @ApiOperation({ summary: 'Get knowledge point list for student filters' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  findAll(@Query() query: QueryKnowledgePointDto) {
    return this.kpService.findAll(query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get knowledge point tree for student filters' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  findTree(@Query('categoryId') categoryId?: string) {
    return this.kpService.findTree(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get knowledge point detail for student' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  @ApiResponse({ status: 404, description: 'Knowledge point not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.kpService.findById(id);
  }
}
