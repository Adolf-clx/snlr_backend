import { Customer } from '@/domain/customer/customer'
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { CustomerRepository } from '../repositories/customer-repository'

interface CreateCustomerInput {
  nickname: string
  phone: string
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  @Span()
  async execute(input: CreateCustomerInput): Promise<void> {
    const customerExistsByPhone = await this.customerRepository.existsByPhone(input.phone)
    if (customerExistsByPhone) throw new Error('Customer with this phone already exists')
    const customer = Customer.create(input)
    await this.customerRepository.save(customer)
  }
}
