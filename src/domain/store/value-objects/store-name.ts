import { StringRules, StringValue } from '@/shared/kernel/value-objects/string-value'

export class StoreName extends StringValue {
  protected static override rules: StringRules = { fieldName: 'Store Name' }

  static create(aString: string): StoreName {
    this.validate(aString)
    return new StoreName(aString)
  }

  static restore(aString: string): StoreName {
    return new StoreName(aString)
  }
}
