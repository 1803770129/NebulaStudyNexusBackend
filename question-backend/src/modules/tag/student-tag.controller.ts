import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserType } from '@/common/decorators/user-type.decorator';
import { TagService } from './tag.service';

@ApiTags('student-tags')
@ApiBearerAuth('JWT-auth')
@Controller('student/tags')
@UserType('student')
export class StudentTagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiOperation({ summary: 'Get tag list for student filters' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag detail for student' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagService.findById(id);
  }
}
