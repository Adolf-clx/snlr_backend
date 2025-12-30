import { Module } from '@nestjs/common'

import { CreateCategoryUseCase } from '@/application/category/use-cases/create-category'
import { DeleteCategoryUseCase } from '@/application/category/use-cases/delete-category'
import { FetchCategoriesUseCase } from '@/application/category/use-cases/fetch-categories'
import { RestoreCategoryUseCase } from '@/application/category/use-cases/restore-category'
import { UpdateCategoryUseCase } from '@/application/category/use-cases/update-category'
import { CreateCustomerUseCase } from '@/application/customer/use-cases/create-customer'
import { FetchCustomersUseCase } from '@/application/customer/use-cases/fetch-customers'
import { GetCustomerByDocumentUseCase } from '@/application/customer/use-cases/get-customer-by-document'
import { CreateItemUseCase } from '@/application/item/use-cases/create-item'
import { DeleteItemUseCase } from '@/application/item/use-cases/delete-item'
import { FetchItemsUseCase } from '@/application/item/use-cases/fetch-items'
import { GetItemByIdUseCase } from '@/application/item/use-cases/get-item-by-id'
import { RestoreItemUseCase } from '@/application/item/use-cases/restore-item'
import { UpdateItemUseCase } from '@/application/item/use-cases/update-item'
import { CreateOrderUseCase } from '@/application/order/use-cases/create-order'
import { FetchOrdersUseCase } from '@/application/order/use-cases/fetch-orders'
import { GetOrderByIdUseCase } from '@/application/order/use-cases/get-order-by-id'
import { UpdateOrderItemUseCase } from '@/application/order/use-cases/update-order-item'
import { UpdateOrderStatusUseCase } from '@/application/order/use-cases/update-order-status'
import { CreateStoreUseCase } from '@/application/store/use-cases/create-store'
import { DeleteStoreUseCase } from '@/application/store/use-cases/delete-store'
import { FetchStoresUseCase } from '@/application/store/use-cases/fetch-stores'
import { GetStoreByIdUseCase } from '@/application/store/use-cases/get-store-by-id'
import { RestoreStoreUseCase } from '@/application/store/use-cases/restore-store'
import { UpdateStoreUseCase } from '@/application/store/use-cases/update-store'
import { GetPaymentByOrderIdUseCase } from '@/application/payment/use-cases/get-payment-by-order-id'
import { CreateWeChatJsapiPaymentUseCase } from '@/application/payment/use-cases/create-wechat-jsapi-payment'
import { DatabaseModule } from '../database/database.module'
import { GatewaysModule } from '../gataways/gateways.module'
import { HealthCheckController } from './controllers/app/health-check.controller'
import { CreateCategoryController } from './controllers/category/create-category.controller'
import { DeleteCategoryController } from './controllers/category/delete-category.controller'
import { FetchCategoriesController } from './controllers/category/fetch-categories.controller'
import { RestoreCategoryController } from './controllers/category/restore-category.controller'
import { UpdateCategoryController } from './controllers/category/update-category.controller'
import { CreateCustomerController } from './controllers/customer/create-customer.controller'
import { FetchCustomersController } from './controllers/customer/fetch-customers.controller'
import { GetCustomerByDocumentController } from './controllers/customer/get-customer-by-document.controller'
import { CreateItemController } from './controllers/item/create-item.controller'
import { DeleteItemController } from './controllers/item/delete-item.controller'
import { FetchItemsController } from './controllers/item/fetch-items.controller'
import { GetItemByIdController } from './controllers/item/get-item-by-id.controller'
import { RestoreItemController } from './controllers/item/restore-item.controller'
import { UpdateItemController } from './controllers/item/update-item.controller'
import { CreateOrderController } from './controllers/order/create-order.controller'
import { FetchOrdersController } from './controllers/order/fetch-orders.controller'
import { GetOrderByIdController } from './controllers/order/get-order-by-id.controller'
import { UpdateOrderItemController } from './controllers/order/update-order-items.controller'
import { UpdateOrderStatusController } from './controllers/order/update-order-status.controller'
import { GetPaymentByOrderIdController } from './controllers/payment/get-payment-by-order-id.controller'
import { CreateWeChatJsapiPaymentController } from './controllers/payment/create-wechat-jsapi-payment.controller'
import { PaymentWebhook } from './controllers/payment/payment-webhook.controller'
import { CreateStoreController } from './controllers/store/create-store.controller'
import { DeleteStoreController } from './controllers/store/delete-store.controller'
import { FetchStoresController } from './controllers/store/fetch-stores.controller'
import { GetStoreByIdController } from './controllers/store/get-store-by-id.controller'
import { RestoreStoreController } from './controllers/store/restore-store.controller'
import { UpdateStoreController } from './controllers/store/update-store.controller'

@Module({
  imports: [DatabaseModule, GatewaysModule],
  controllers: [
    // ===== APP
    HealthCheckController,
    // ===== Customer
    CreateCustomerController,
    GetCustomerByDocumentController,
    FetchCustomersController,
    // ===== Category
    CreateCategoryController,
    FetchCategoriesController,
    UpdateCategoryController,
    DeleteCategoryController,
    RestoreCategoryController,
    // ===== Item
    CreateItemController,
    GetItemByIdController,
    FetchItemsController,
    UpdateItemController,
    DeleteItemController,
    RestoreItemController,
    // ===== Order
    CreateOrderController,
    FetchOrdersController,
    GetOrderByIdController,
    UpdateOrderStatusController,
    UpdateOrderItemController,
    // ===== Payment
    GetPaymentByOrderIdController,
    CreateWeChatJsapiPaymentController,
    PaymentWebhook,
    // ===== Store
    CreateStoreController,
    FetchStoresController,
    GetStoreByIdController,
    UpdateStoreController,
    DeleteStoreController,
    RestoreStoreController,
  ],
  providers: [
    // ===== Customer
    CreateCustomerUseCase,
    GetCustomerByDocumentUseCase,
    FetchCustomersUseCase,
    // ===== Category
    CreateCategoryUseCase,
    FetchCategoriesUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    RestoreCategoryUseCase,
    // ===== Item
    CreateItemUseCase,
    GetItemByIdUseCase,
    FetchItemsUseCase,
    UpdateItemUseCase,
    DeleteItemUseCase,
    RestoreItemUseCase,
    // ===== Order
    CreateOrderUseCase,
    FetchOrdersUseCase,
    GetOrderByIdUseCase,
    UpdateOrderStatusUseCase,
    UpdateOrderItemUseCase,
    // ===== Payment
    GetPaymentByOrderIdUseCase,
    CreateWeChatJsapiPaymentUseCase,
    // ===== Store
    CreateStoreUseCase,
    FetchStoresUseCase,
    GetStoreByIdUseCase,
    UpdateStoreUseCase,
    DeleteStoreUseCase,
    RestoreStoreUseCase,
  ],
})
export class HttpModule {}
