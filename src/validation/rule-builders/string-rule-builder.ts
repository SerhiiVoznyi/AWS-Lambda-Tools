import { RuleTyped } from '../types'
import { BaseRuleBuilder } from './base-rule-builder'

export class StringRuleBuilder<
  TModel,
  TPropertyName extends keyof TModel
> extends BaseRuleBuilder<TModel, TPropertyName, string> {

  constructor (
    protected property: TPropertyName,
    protected rules: RuleTyped<TModel, string>[]
  ) {
    super(property, rules)
    this.rules.push((value: unknown) =>
      typeof value === 'string' ? null : { property: String(property), message: `${String(property)} must be a string` }
    )
  }

  required (message = `${String(this.property)} is required`) {
    return this.addRule(
      message,
      v => v != null && v !== ''
    )
  }

  notEmpty (message?: string) {
    return this.addRule(
      message ?? `${String(this.property)} should not be empty`,
      v => v != null && v !== ''
    )
  }

  maxLength (max: number, message?: string) {
    return this.addRule(
      message ?? `${String(this.property)} must be at most ${max} characters long`,
      v => v != null && v.length <= max
    )
  }

  minLength (min: number, message?: string) {
    return this.addRule(
      message ?? `${String(this.property)} must be at least ${min} characters long`,
      v => v != null && v.length >= min
    )
  }
}