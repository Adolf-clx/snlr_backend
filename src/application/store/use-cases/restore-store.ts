import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { StoreRepository } from '../repositories/store-repository'

interface RestoreStoreInput {
  storeId: string
}

@Injectable()
export class RestoreStoreUseCase {
  constructor(private readonly storeRepository: StoreRepository) {}

  @Span()
  async execute({ storeId }: RestoreStoreInput): Promise<void> {
    const store = await this.storeRepository.findById(storeId)
    if (!store) throw new Error('Store not found')
    store.restore()
    await this.storeRepository.update(store)
  }
}
