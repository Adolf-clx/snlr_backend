import { CreateCategoryUseCase } from '@/application/category/use-cases/create-category'
import { Body, Controller, HttpCode, Post, UnprocessableEntityException, UsePipes, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { zodToOpenAPI } from 'nestjs-zod'
import { z } from 'zod'
import { ZodRequestValidationPipe } from '../../pipes/zod-request-validation-pipe'

const createCategoryBodySchema = z.object({
  storeId: z.string().uuid().default('00000000-0000-0000-0000-000000000000'),
  name: z.string().min(1),
})
type CreateCategoryBodySchema = z.infer<typeof createCategoryBodySchema>

@Controller('/categories')
@ApiTags('Categories')
export class CreateCategoryController {
  constructor(private readonly createCategory: CreateCategoryUseCase) {}

  @Post()
  @HttpCode(201)
  @CreateCategoryController.swagger()
  @UsePipes(new ZodRequestValidationPipe({ body: createCategoryBodySchema }))
  async handle(@Body() body: CreateCategoryBodySchema) {
    try {
      await this.createCategory.execute({
        storeId: body.storeId,
        name: body.name,
      })
    } catch (error) {
      throw new UnprocessableEntityException(error.message)
    }
  }

  private static swagger() {
    return applyDecorators(
      ApiOperation({
        summary: 'Create new category',
        description: 'This endpoint allows you to create an category.',
      }),
      ApiBody({ schema: zodToOpenAPI(createCategoryBodySchema) }),
      ApiResponse({ status: 201, description: 'Created' }),
      ApiResponse({ status: 400, description: 'Bad Request' }),
      ApiResponse({ status: 422, description: 'Unprocessable Entity' })
    )
  }
}
