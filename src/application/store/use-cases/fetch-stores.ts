import { Store } from '@/domain/store/store'
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { FetchStoresSearchParams } from '../@types/fetch-stores-search-filters'
import { StoreRepository } from '../repositories/store-repository'

@Injectable()
export class FetchStoresUseCase {
  constructor(private readonly storeRepository: StoreRepository) {}

  @Span()
  async execute(params: FetchStoresSearchParams): Promise<Store[]> {
    return this.storeRepository.findMany(params)
  }
}
