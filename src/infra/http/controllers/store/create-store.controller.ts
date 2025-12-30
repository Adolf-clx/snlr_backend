import { CreateStoreUseCase } from '@/application/store/use-cases/create-store'
import { Body, Controller, HttpCode, Post, UnprocessableEntityException, UsePipes, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { zodToOpenAPI } from 'nestjs-zod'
import { z } from 'zod'
import { ZodRequestValidationPipe } from '../../pipes/zod-request-validation-pipe'

const createStoreBodySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  longitude: z.number().optional().nullable(),
  latitude: z.number().optional().nullable(),
  isOpen: z.boolean().optional(),
})
type CreateStoreBodySchema = z.infer<typeof createStoreBodySchema>

@Controller('/stores')
@ApiTags('Stores')
export class CreateStoreController {
  constructor(private readonly createStore: CreateStoreUseCase) {}

  @Post()
  @HttpCode(201)
  @CreateStoreController.swagger()
  @UsePipes(new ZodRequestValidationPipe({ body: createStoreBodySchema }))
  async handle(@Body() body: CreateStoreBodySchema) {
    try {
      await this.createStore.execute(body)
    } catch (error) {
      throw new UnprocessableEntityException(error.message)
    }
  }

  private static swagger() {
    return applyDecorators(
      ApiOperation({
        summary: 'Create new store',
        description: 'This endpoint allows you to create a store.',
      }),
      ApiBody({ schema: zodToOpenAPI(createStoreBodySchema) }),
      ApiResponse({ status: 201, description: 'Created' }),
      ApiResponse({ status: 400, description: 'Bad Request' }),
      ApiResponse({ status: 422, description: 'Unprocessable Entity' })
    )
  }
}
