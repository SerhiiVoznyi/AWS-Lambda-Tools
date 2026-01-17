 
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

  string () {
    return new StringRuleBuilder<TModel, TPropertyName>(
      this.property,
      this.rules
    )
  }

  number () {
    return new NumberRuleBuilder<TModel, TPropertyName>(
      this.property,
      this.rules
    )
  }

  boolean () {
    return new BooleanRuleBuilder<TModel, TPropertyName>(
      this.property,
      this.rules
    )
  }

  array () {
    return new ArrayRuleBuilder<TModel, TPropertyName>(
      this.property,
      this.rules
    )
  }
}
