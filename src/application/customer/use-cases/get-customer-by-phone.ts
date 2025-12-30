import { Customer } from '@/domain/customer/customer'
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { CustomerRepository } from '../repositories/customer-repository'

interface GetCustomerByPhoneInput {
  phone: string
}

interface GetCustomerByPhoneOutput {
  customer: Customer
}

@Injectable()
export class GetCustomerByPhoneUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  @Span()
  async execute({ phone }: GetCustomerByPhoneInput): Promise<GetCustomerByPhoneOutput> {
    const customer = await this.customerRepository.findByPhone(phone)
    if (!customer) throw new Error('Customer not found')
    return {
      customer,
    }
  }
}
