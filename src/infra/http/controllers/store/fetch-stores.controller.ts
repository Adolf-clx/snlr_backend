import { StoreStatus } from '@/application/store/@types/fetch-stores-search-filters'
import { FetchStoresUseCase } from '@/application/store/use-cases/fetch-stores'
import { Controller, Get, HttpCode, Query, UsePipes, applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { zodToOpenAPI } from 'nestjs-zod'
import { z } from 'zod'
import { ApiQueryFromZod } from '../../decorators/api-query-from-zod.decorator'
import { ZodRequestValidationPipe } from '../../pipes/zod-request-validation-pipe'
import { StorePresenter } from '../../presenters/store-presenter'

const fetchStoresQuerySchema = z.object({
  status: z.nativeEnum(StoreStatus).optional().default(StoreStatus.ACTIVE),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
})
type FetchStoresQuerySchema = z.infer<typeof fetchStoresQuerySchema>

const fetchStoresResponseSchema = z.object({
  stores: z.array(
    z.object({
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
  ),
})

@Controller('/stores')
@ApiTags('Stores')
export class FetchStoresController {
  constructor(private readonly fetchStores: FetchStoresUseCase) {}

  @Get()
  @HttpCode(200)
  @FetchStoresController.swagger()
  @UsePipes(new ZodRequestValidationPipe({ query: fetchStoresQuerySchema }))
  async handle(@Query() query: FetchStoresQuerySchema) {
    const stores = await this.fetchStores.execute(query)
    return {
      stores: stores.map(StorePresenter.toHTTP),
    }
  }

  private static swagger() {
    return applyDecorators(
      ApiOperation({
        summary: 'Fetch all stores',
        description: 'This endpoint allows you to get all stores.',
      }),
      ApiQueryFromZod(fetchStoresQuerySchema),
      ApiResponse({ status: 200, description: 'OK', schema: zodToOpenAPI(fetchStoresResponseSchema) })
    )
  }
}
