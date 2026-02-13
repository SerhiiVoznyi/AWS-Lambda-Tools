 
import { Rule } from '../types'
import { ArrayRuleBuilder } from './array-rule-builder'
import { BooleanRuleBuilder } from './boolean-rule-builder'
import { NumberRuleBuilder } from './number-rule-builder'
import { StringRuleBuilder } from './string-rule-builder'
 

export class RuleBuilder<
  TModel,
  TPropertyName extends keyof TModel
> {
  constructor (
    private readonly property: TPropertyName,
    private readonly rules: Rule<TModel>[]
  ) {}

  string (): StringRuleBuilder<TModel, TPropertyName> {
    return new StringRuleBuilder<TModel, TPropertyName>(
      this.property,
      this.rules
    )
  }

  number (): NumberRuleBuilder<TModel, TPropertyName> {
    return new NumberRuleBuilder<TModel, TPropertyName>(
      this.property,
      this.rules
    )
  }

  boolean (): BooleanRuleBuilder<TModel, TPropertyName> {
    return new BooleanRuleBuilder<TModel, TPropertyName>(
      this.property,
      this.rules
    )
  }

  array (): ArrayRuleBuilder<TModel, TPropertyName> {
    return new ArrayRuleBuilder<TModel, TPropertyName>(
      this.property,
      this.rules
    )
  }
}
