import tracingService from '@/infra/observability/tracing/tracing'

import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { Logger } from 'nestjs-pino'
import { patchNestJsSwagger } from 'nestjs-zod'
import { AppModule } from './app.module'
import { EnvService } from './infra/env/env.service'

async function bootstrap() {
  tracingService.start()

  const app = await NestFactory.create(AppModule, {
    logger: false,
  })

  app.useLogger(app.get(Logger))

  const config = new DocumentBuilder()
    .setTitle('Swift Meal')
    .setDescription('NestJS Project')
    .setVersion('1.0')
    .addTag('App', 'General app and health endpoints')
    .addTag('Customers', 'Operations for customer data')
    .addTag('Categories', 'Endpoints managing categories')
    .addTag('Items', 'Manage product items and their details')
    .addTag('Orders', 'Create and manage orders')
    .addTag('Payments', 'Payment processing endpoints')
    .addTag('Stores', 'Store management endpoints')
    .build()
  patchNestJsSwagger()
  const documentFactory = SwaggerModule.createDocument(app, config)
  app.use(
    '/docs',
    apiReference({
      spec: { content: documentFactory },
      theme: 'kepler',
    })
  )

  const configService = app.get(EnvService)
  const port = configService.get('PORT') || 3333
  await app.listen(port, '0.0.0.0')
}
bootstrap()
