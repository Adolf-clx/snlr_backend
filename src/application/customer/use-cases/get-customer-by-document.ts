import { Customer } from '@/domain/customer/customer'
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { CustomerRepository } from '../repositories/customer-repository'

interface GetCustomerByDocumentInput {
  document: string
}

interface GetCustomerByDocumentOutput {
  customer: Customer
}

@Injectable()
export class GetCustomerByDocumentUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  @Span()
  async execute({ document }: GetCustomerByDocumentInput): Promise<GetCustomerByDocumentOutput> {
    const customer = await this.customerRepository.findByPhone(document)
    if (!customer) throw new Error('Customer not found')
    return {
      customer,
    }
  }
}
