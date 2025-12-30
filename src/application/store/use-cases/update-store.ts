import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { StoreRepository } from '../repositories/store-repository'

interface UpdateStoreInput {
  storeId: string
  name?: string
  address?: string
  phone?: string
  isOpen?: boolean
}

@Injectable()
export class UpdateStoreUseCase {
  constructor(private readonly storeRepository: StoreRepository) {}

  @Span()
  async execute(input: UpdateStoreInput): Promise<void> {
    const store = await this.storeRepository.findById(input.storeId)
    if (!store) throw new Error('Store not found')

    if (input.name) store.name = input.name
    if (input.address) store.address = input.address
    if (input.phone) store.phone = input.phone
    if (input.isOpen !== undefined) store.isOpen = input.isOpen

    await this.storeRepository.update(store)
  }
}
