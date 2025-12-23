import { PrismaClient, PricingUnit } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 创建总店
  const mainStore = await prisma.store.upsert({
    where: { code: 'ST001' },
    update: {},
    create: {
      name: '招牌卤肉总店',
      code: 'ST001',
      address: '美食街1号',
      phone: '13800138000',
      isOpen: true,
    },
  });

  // 2. 创建商品分类
  const category = await prisma.category.create({
    data: {
      name: '招牌卤味',
      storeId: mainStore.id,
    },
  });

  // 3. 创建基础商品 (固定份额)
  await prisma.item.createMany({
    data: [
      {
        name: '五香猪蹄 (个)',
        code: 'P001',
        price: 2500, // 25.00元
        unit: PricingUnit.PIECE,
        storeId: mainStore.id,
        categoryId: category.id,
        specification: '约300g/个',
        stock: 100,
      },
      {
        name: '招牌卤排骨 (份)',
        code: 'P002',
        price: 4800, // 48.00元
        unit: PricingUnit.PIECE,
        storeId: mainStore.id,
        categoryId: category.id,
        specification: '精排/约500g',
        stock: 50,
      },
    ],
  });

  console.log('✅ 卤肉连锁店基础数据初始化完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });