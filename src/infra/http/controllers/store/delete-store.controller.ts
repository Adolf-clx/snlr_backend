import { DeleteStoreUseCase } from '@/application/store/use-cases/delete-store'
import { Controller, Delete, HttpCode, Param, UnprocessableEntityException, applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Controller('/stores/:storeId')
@ApiTags('Stores')
export class DeleteStoreController {
  constructor(private readonly deleteStore: DeleteStoreUseCase) {}

  @Delete()
  @HttpCode(204)
  @DeleteStoreController.swagger()
  async handle(@Param('storeId') storeId: string) {
    try {
      await this.deleteStore.execute({ storeId })
    } catch (error) {
      throw new UnprocessableEntityException(error.message)
    }
  }

  private static swagger() {
    return applyDecorators(
      ApiOperation({
        summary: 'Delete store',
        description: 'This endpoint allows you to delete (deactivate) a store.',
      }),
      ApiResponse({ status: 204, description: 'No Content' }),
      ApiResponse({ status: 422, description: 'Unprocessable Entity' })
    )
  }
}
