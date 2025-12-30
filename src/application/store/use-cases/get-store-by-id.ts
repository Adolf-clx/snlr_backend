import { Store } from '@/domain/store/store'
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { StoreRepository } from '../repositories/store-repository'

interface GetStoreByIdInput {
  storeId: string
}

@Injectable()
export class GetStoreByIdUseCase {
  constructor(private readonly storeRepository: StoreRepository) {}

  @Span()
  async execute({ storeId }: GetStoreByIdInput): Promise<Store> {
    const store = await this.storeRepository.findById(storeId)
    if (!store) throw new Error('Store not found')
    return store
  }
}
