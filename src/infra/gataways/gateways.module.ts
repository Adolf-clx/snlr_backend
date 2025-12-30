import { PaymentGateway } from '@/application/payment/gateways/payment-gateway'
import { UpdatePaymentStatusUseCase } from '@/application/payment/use-cases/update-payment-status'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { EnvModule } from '../env/env.module'
import { MercadoPagoWebhookHandler } from './payment/mercado-pago/mercado-pago-webhook-handler'
import { MercadoPagoGateway } from './payment/mercado-pago/mercado-pago.gateway'
import { MercadoPagoService } from './payment/mercado-pago/mercado-pago.service'
import { WeChatPayService } from './payment/wechat/wechat-pay.service'
import { WeChatGateway } from './payment/wechat/wechat.gateway'
import { PaymentWebhookRouter } from './payment/webhook/payment-webhook-router'

@Module({
  imports: [DatabaseModule, EnvModule],
  providers: [
    MercadoPagoService,
    WeChatPayService,
    MercadoPagoWebhookHandler,
    PaymentWebhookRouter,
    {
      provide: PaymentGateway,
      useClass: WeChatGateway,
    },
    UpdatePaymentStatusUseCase,
  ],
  exports: [MercadoPagoService, WeChatPayService, PaymentGateway, PaymentWebhookRouter],
})
export class GatewaysModule {}
