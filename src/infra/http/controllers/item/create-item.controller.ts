import { CreateItemUseCase } from '@/application/item/use-cases/create-item'
import { Body, Controller, HttpCode, Post, UnprocessableEntityException, UsePipes, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { zodToOpenAPI } from 'nestjs-zod'
import { z } from 'zod'
import { ZodRequestValidationPipe } from '../../pipes/zod-request-validation-pipe'

const createItemBodySchema = z.object({
  storeId: z.string().uuid().default('00000000-0000-0000-0000-000000000000'),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
})
type CreateItemBodySchema = z.infer<typeof createItemBodySchema>

@Controller('/items')
@ApiTags('Items')
export class CreateItemController {
  constructor(private readonly createItem: CreateItemUseCase) {}

  @Post()
  @HttpCode(201)
  @CreateItemController.swagger()
  @UsePipes(new ZodRequestValidationPipe({ body: createItemBodySchema }))
  async handle(@Body() body: CreateItemBodySchema) {
    try {
      await this.createItem.execute({
        storeId: body.storeId,
        code: body.code,
        name: body.name,
        description: body.description,
        price: body.price,
        categoryId: body.categoryId,
      })
    } catch (error) {
      throw new UnprocessableEntityException(error.message)
    }
  }

  private static swagger() {
    return applyDecorators(
      ApiOperation({
        summary: 'Create new item',
        description: 'This endpoint allows you to create an item.',
      }),
      ApiBody({ schema: zodToOpenAPI(createItemBodySchema) }),
      ApiResponse({ status: 201, description: 'Created' }),
      ApiResponse({ status: 400, description: 'Bad Request' }),
      ApiResponse({ status: 422, description: 'Unprocessable Entity' })
    )
  }
}
