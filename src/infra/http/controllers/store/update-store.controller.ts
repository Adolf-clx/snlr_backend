import { UpdateStoreUseCase } from '@/application/store/use-cases/update-store'
import { Body, Controller, HttpCode, Param, Patch, UnprocessableEntityException, UsePipes, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { zodToOpenAPI } from 'nestjs-zod'
import { z } from 'zod'
import { ZodRequestValidationPipe } from '../../pipes/zod-request-validation-pipe'

const updateStoreBodySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  isOpen: z.boolean().optional(),
})
type UpdateStoreBodySchema = z.infer<typeof updateStoreBodySchema>

@Controller('/stores/:storeId')
@ApiTags('Stores')
export class UpdateStoreController {
  constructor(private readonly updateStore: UpdateStoreUseCase) {}

  @Patch()
  @HttpCode(204)
  @UpdateStoreController.swagger()
  @UsePipes(new ZodRequestValidationPipe({ body: updateStoreBodySchema }))
  async handle(@Param('storeId') storeId: string, @Body() body: UpdateStoreBodySchema) {
    try {
      await this.updateStore.execute({ storeId, ...body })
    } catch (error) {
      throw new UnprocessableEntityException(error.message)
    }
  }

  private static swagger() {
    return applyDecorators(
      ApiOperation({
        summary: 'Update store',
        description: 'This endpoint allows you to update a store.',
      }),
      ApiBody({ schema: zodToOpenAPI(updateStoreBodySchema) }),
      ApiResponse({ status: 204, description: 'No Content' }),
      ApiResponse({ status: 400, description: 'Bad Request' }),
      ApiResponse({ status: 422, description: 'Unprocessable Entity' })
    )
  }
}
