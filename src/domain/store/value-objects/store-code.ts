import { StringRules, StringValue } from '@/shared/kernel/value-objects/string-value'

export class StoreCode extends StringValue {
  protected static override rules: StringRules = { fieldName: 'Store Code' }

  static create(aString: string): StoreCode {
    this.validate(aString)
    return new StoreCode(aString)
  }

  static restore(aString: string): StoreCode {
    return new StoreCode(aString)
  }
}
