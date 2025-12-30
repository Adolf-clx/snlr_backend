import { StringRules, StringValue } from '@/shared/kernel/value-objects/string-value'

/**
 * 商品名称值对象（Value Object）
 * 
 * 继承自通用的 StringValue 基类，用于封装商品名称字符串，
 * 确保所有商品名称都符合统一的验证规则（如长度、非空等）。
 * 
 * 值对象的核心特性：
 * - 不可变（Immutable）：一旦创建，值无法修改
 * - 相等性基于值而非引用
 * - 自验证：创建时自动校验合法性
 */
export class ItemName extends StringValue {
  /**
   * 覆盖父类的验证规则
   * 
   * 这里可以自定义商品名称的具体约束，例如：
   * - 最小长度、最大长度
   * - 是否允许为空
   * - 是否去除首尾空格
   * - 正则表达式匹配等
   * 
   * 当前示例中仅设置了字段显示名称，用于错误消息更友好
   */
  protected static override rules: StringRules = {
    fieldName: 'Item Name', // 错误消息中显示的字段名，如 “Item Name 不能为空”
    // 可选：添加更多规则示例
    // minLength: 1,
    // maxLength: 100,
    // trim: true,
    // required: true,
    // pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\s-]+$/, // 只允许中英文、数字、空格和短横线
  }

  /**
   * 工厂方法：用于创建新商品名称（适用于新建商品场景）
   * 
   * 会自动调用父类的 validate 方法，根据 rules 配置进行完整验证
   * 如果验证不通过，会抛出异常（通常是 DomainError 或 ValidationError）
   * 
   * @param aString 原始字符串（如用户输入的商品名）
   * @returns ItemName 实例
   * @throws 如果字符串不符合 rules 配置的验证规则
   */
  static create(aString: string): ItemName {
    this.validate(aString) // 触发静态验证
    return new ItemName(aString)
  }

  /**
   * 工厂方法：用于从持久化层恢复商品名称（适用于仓储加载实体场景）
   * 
   * 跳过验证，直接构造实例。
   * 前提是：数据库中存储的数据已经被认为是合法的（已在创建时验证过）
   * 
   * @param aString 来自数据库或其他存储的商品名称字符串
   * @returns ItemName 实例
   */
  static restore(aString: string): ItemName {
    return new ItemName(aString)
  }
}