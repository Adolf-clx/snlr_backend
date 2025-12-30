import { RestoreStoreUseCase } from '@/application/store/use-cases/restore-store'
import { Controller, HttpCode, Param, Patch, UnprocessableEntityException, applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Controller('/stores/:storeId/restore')
@ApiTags('Stores')
export class RestoreStoreController {
  constructor(private readonly restoreStore: RestoreStoreUseCase) {}

  @Patch()
  @HttpCode(204)
  @RestoreStoreController.swagger()
  async handle(@Param('storeId') storeId: string) {
    try {
      await this.restoreStore.execute({ storeId })
    } catch (error) {
      throw new UnprocessableEntityException(error.message)
    }
  }

  private static swagger() {
    return applyDecorators(
      ApiOperation({
        summary: 'Restore store',
        description: 'This endpoint allows you to restore a deleted store.',
      }),
      ApiResponse({ status: 204, description: 'No Content' }),
      ApiResponse({ status: 422, description: 'Unprocessable Entity' })
    )
  }
}
