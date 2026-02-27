import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserType } from '@/common/decorators/user-type.decorator';
import { CategoryService } from './category.service';

@ApiTags('student-categories')
@ApiBearerAuth('JWT-auth')
@Controller('student/categories')
@UserType('student')
export class StudentCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get category list for student filters' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree for student filters' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  findTree() {
    return this.categoryService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category detail for student' })
  @ApiResponse({ status: 200, description: 'Fetched successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findById(id);
  }
}
