import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { PaymentGateway } from '../gateways/payment-gateway'
import { PaymentRepository } from '../repositories/payment-repository'
import { Payment } from '@/domain/payment/payment'

interface CreateWeChatJsapiPaymentInput {
  orderId: string
  amount: number
  openId: string
}

interface CreateWeChatJsapiPaymentOutput {
  payment: Payment
  params: {
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }
}

@Injectable()
export class CreateWeChatJsapiPaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository, private readonly paymentGateway: PaymentGateway) {}

  @Span()
  async execute({ orderId, amount, openId }: CreateWeChatJsapiPaymentInput): Promise<CreateWeChatJsapiPaymentOutput> {
    const { externalId, status, params } = await this.paymentGateway.createWeChatJsapiPayment(orderId, amount, openId)
    const payment = Payment.create({
      orderId,
      amount,
      qrCode: '',
      externalId,
      status: status,
    })
    await this.paymentRepository.save(payment)
    return {
      payment,
      params,
    }
  }
}
