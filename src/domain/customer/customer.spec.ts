import { Customer } from './customer'

// 辅助函数：生成有效的创建属性
const makeValidProps = () => ({
  nickname: 'John Doe',
  phone: '11999999999',
})

/**
 * Customer 实体单元测试
 * 
 * 验证 Customer 实体的创建和恢复逻辑是否正确
 * 覆盖场景：
 * - 使用 create() 工厂方法新建客户（默认 createdAt）
 * - 使用 restore() 工厂方法从持久化数据恢复客户（指定 ID 和 createdAt）
 */
describe('Customer Entity', () => {
  /**
   * 成功场景：使用 create() 创建一个新客户
   * 验证属性正确赋值，createdAt 自动生成
   */
  it('should create a customer with valid properties', () => {
    const props = makeValidProps()

    // 执行创建（不传 ID，使用自动生成）
    const customer = Customer.create(props)

    // 断言：基本属性正确
    expect(customer.nickname).toBe(props.nickname)
    expect(customer.phone).toBe(props.phone)

    // 断言：createdAt 自动设置为 Date 对象
    expect(customer.createdAt).toBeDefined()
    expect(customer.createdAt).toBeInstanceOf(Date)

    // 断言：ID 自动生成（不是 undefined 或 null）
    expect(customer.id).toBeDefined()
    expect(customer.id.toString()).toMatch(/^cus_/ ) // 假设 UniqueEntityID 前缀为 cus_，根据实际调整
  })

  /**
   * 成功场景：使用 restore() 从持久化数据恢复客户
   * 常用于 Repository 将数据库记录映射回领域实体
   */
  it('should restore a customer from persisted data', () => {
    const baseProps = makeValidProps()
    const fixedDate = new Date('2025-01-01T00:00:00Z')
    const customerId = 'customer-1'

    // 执行恢复（必须提供 ID 和完整的 props）
    const customer = Customer.restore(
      {
        ...baseProps,
        createdAt: fixedDate,
      },
      customerId
    )

    // 断言：ID 被正确恢复
    expect(customer.id.toString()).toBe(customerId)

    // 断言：属性正确赋值
    expect(customer.nickname).toBe(baseProps.nickname)
    expect(customer.phone).toBe(baseProps.phone)

    // 断言：createdAt 使用提供的固定时间
    expect(customer.createdAt).toBe(fixedDate)
    expect(customer.createdAt.getTime()).toBe(fixedDate.getTime())
  })

  /**
   * 可选扩展测试：验证 create() 时自定义 ID
   */
  it('should create a customer with custom ID when provided', () => {
    const props = makeValidProps()
    const customId = 'custom-customer-999'

    const customer = Customer.create(props, customId)

    expect(customer.id.toString()).toBe(customId)
    expect(customer.nickname).toBe(props.nickname)
    expect(customer.phone).toBe(props.phone)
  })

  /**
   * 可选扩展测试：验证 createdAt 默认值为当前时间（大致检查）
   */
  it('should set createdAt to current time by default in create()', () => {
    const before = new Date()
    const props = makeValidProps()

    const customer = Customer.create(props)

    const after = new Date()

    expect(customer.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(customer.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})