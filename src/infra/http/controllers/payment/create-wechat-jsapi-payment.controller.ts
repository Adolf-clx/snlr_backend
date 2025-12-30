import { CreateWeChatJsapiPaymentUseCase } from '@/application/payment/use-cases/create-wechat-jsapi-payment'
import { Body, Controller, HttpCode, Post, UnprocessableEntityException, UsePipes, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { zodToOpenAPI } from 'nestjs-zod'
import { z } from 'zod'
import { ZodRequestValidationPipe } from '../../pipes/zod-request-validation-pipe'
import { PaymentPresenter } from '../../presenters/payment-presenter'

const createWeChatJsapiPaymentBodySchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  openId: z.string().min(1),
})
type CreateWeChatJsapiPaymentBodySchema = z.infer<typeof createWeChatJsapiPaymentBodySchema>

const createWeChatJsapiPaymentResponseSchema = z.object({
  payment: z.object({
    status: z.string(),
    amount: z.number(),
    qrCode: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  params: z.object({
    timeStamp: z.string(),
    nonceStr: z.string(),
    package: z.string(),
    signType: z.string(),
    paySign: z.string(),
  }),
})

@Controller('/payments/wechat/jsapi')
@ApiTags('Payments')
export class CreateWeChatJsapiPaymentController {
  constructor(private readonly createPayment: CreateWeChatJsapiPaymentUseCase) {}

  @Post()
  @HttpCode(201)
  @CreateWeChatJsapiPaymentController.swagger()
  @UsePipes(new ZodRequestValidationPipe({ body: createWeChatJsapiPaymentBodySchema }))
  async handle(@Body() body: CreateWeChatJsapiPaymentBodySchema) {
    try {
      const result = await this.createPayment.execute(body)
      return {
        payment: PaymentPresenter.toHTTP(result.payment),
        params: result.params,
      }
    } catch (error) {
      throw new UnprocessableEntityException(error.message)
    }
  }

  private static swagger() {
    return applyDecorators(
      ApiOperation({
        summary: 'Create WeChat JSAPI payment',
        description: 'Creates a WeChat Mini Program JSAPI payment and returns parameters.',
      }),
      ApiBody({ schema: zodToOpenAPI(createWeChatJsapiPaymentBodySchema) }),
      ApiResponse({ status: 201, description: 'Created', schema: zodToOpenAPI(createWeChatJsapiPaymentResponseSchema) }),
      ApiResponse({ status: 400, description: 'Bad Request' }),
      ApiResponse({ status: 422, description: 'Unprocessable Entity' })
    )
  }
}
