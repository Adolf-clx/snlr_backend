import { GetStoreByIdUseCase } from '@/application/store/use-cases/get-store-by-id'
import { Controller, Get, HttpCode, NotFoundException, Param, applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { zodToOpenAPI } from 'nestjs-zod'
import { z } from 'zod'
import { StorePresenter } from '../../presenters/store-presenter'

const getStoreByIdResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  address: z.string(),
  phone: z.string(),
  longitude: z.number().nullable(),
  latitude: z.number().nullable(),
  isOpen: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
})

@Controller('/stores/:storeId')
@ApiTags('Stores')
export class GetStoreByIdController {
  constructor(private readonly getStoreById: GetStoreByIdUseCase) {}

  @Get()
  @HttpCode(200)
  @GetStoreByIdController.swagger()
  async handle(@Param('storeId') storeId: string) {
    try {
      const store = await this.getStoreById.execute({ storeId })
      return StorePresenter.toHTTP(store)
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }

  private static swagger() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get store by ID',
        description: 'This endpoint allows you to get a store by its ID.',
      }),
      ApiResponse({ status: 200, description: 'OK', schema: zodToOpenAPI(getStoreByIdResponseSchema) }),
      ApiResponse({ status: 404, description: 'Not Found' })
    )
  }
}
