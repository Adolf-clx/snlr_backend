import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { StoreRepository } from '../repositories/store-repository'

interface DeleteStoreInput {
  storeId: string
}

@Injectable()
export class DeleteStoreUseCase {
  constructor(private readonly storeRepository: StoreRepository) {}

  @Span()
  async execute({ storeId }: DeleteStoreInput): Promise<void> {
    const store = await this.storeRepository.findById(storeId)
    if (!store) throw new Error('Store not found')
    store.deactivate()
    await this.storeRepository.delete(store)
  }
}
