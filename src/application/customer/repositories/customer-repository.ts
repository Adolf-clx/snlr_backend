import { Customer } from '@/domain/customer/customer'
import { FetchCustomersSearchParams } from '../@types/fetch-custormers-search-filters'

export abstract class CustomerRepository {
  abstract existsByPhone(phone: string): Promise<boolean>
  abstract findMany(params: FetchCustomersSearchParams): Promise<Customer[]>
  abstract findById(id: string): Promise<Customer | null>
  abstract findByPhone(phone: string): Promise<Customer | null>
  abstract save(customer: Customer): Promise<void>
  abstract count(params: FetchCustomersSearchParams): Promise<number>
}
