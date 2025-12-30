import { PaymentStatus } from '@/domain/payment/value-objects/payment-status'

export interface CreatePIXPaymentOutput {
  externalId: string
  qrCode: string
  qrCodeBase64: string
  status: string
}

export interface CreateWeChatJsapiPaymentOutput {
  externalId: string
  status: string
  params: {
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }
}

export abstract class PaymentGateway {
  abstract createPIXPayment(orderId: string, amount: number): Promise<CreatePIXPaymentOutput>
  abstract getPaymentStatusByExternalId(externalId: string): Promise<PaymentStatus>
  abstract createWeChatJsapiPayment(orderId: string, amount: number, openId: string): Promise<CreateWeChatJsapiPaymentOutput>
}
