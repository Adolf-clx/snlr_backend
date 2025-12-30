import { Customer } from '@/domain/customer/customer'

export class CustomerPresenter {
  static toHTTP(customer: Customer) {
    return {
      id: customer.id,
      nickname: customer.nickname,
      phone: customer.phone,
      createdAt: customer.createdAt,
    }
  }
}
