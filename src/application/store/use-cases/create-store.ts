import { Store } from '@/domain/store/store'
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { StoreRepository } from '../repositories/store-repository'

interface CreateStoreInput {
  name: string
  code: string
  address: string
  phone: string
  longitude?: number | null
  latitude?: number | null
  isOpen?: boolean
}

@Injectable()
export class CreateStoreUseCase {
  constructor(private readonly storeRepository: StoreRepository) {}

  @Span()
  async execute(input: CreateStoreInput): Promise<void> {
    const existingStore = await this.storeRepository.existsByCode(input.code)
    if (existingStore) throw new Error('Store already exists')
    const store = Store.create(input)
    await this.storeRepository.save(store)
  }
}
