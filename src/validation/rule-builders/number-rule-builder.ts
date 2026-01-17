import { RuleTyped } from '../types'
import { BaseRuleBuilder } from './base-rule-builder'

export class NumberRuleBuilder<
  TModel,
  TPropertyName extends keyof TModel
> extends BaseRuleBuilder<TModel, TPropertyName, number> {

  constructor (
    protected property: TPropertyName,
    protected rules: RuleTyped<TModel, number>[]
  ) {
    super(property, rules)
    this.rules.push((value) =>
      typeof value === 'number' ? null : { property: String(property), message: `${String(property)} must be a number` }
    )
  }

  required (message = `${String(this.property)} is required`) {
    return this.addRule(
      message,
      v => !Number.isNaN(v)
    )
  }

  min (min: number, message?: string) {
    return this.addRule(
      message ?? `${String(this.property)} must be >= ${min}`,
      v => v >= min
    )
  }

  max (max: number, message?: string) {
    return this.addRule(
      message ?? `${String(this.property)} must be <= ${max}`,
      v => v <= max
    )
  }
}