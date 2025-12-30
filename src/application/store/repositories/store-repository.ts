import { Store } from '@/domain/store/store'
import { FetchStoresSearchParams } from '../@types/fetch-stores-search-filters'

export abstract class StoreRepository {
  abstract existsByCode(code: string): Promise<boolean>
  abstract findById(id: string): Promise<Store | null>
  abstract findMany(params: FetchStoresSearchParams): Promise<Store[]>
  abstract save(store: Store): Promise<void>
  abstract update(store: Store): Promise<void>
  abstract delete(store: Store): Promise<void>
}
