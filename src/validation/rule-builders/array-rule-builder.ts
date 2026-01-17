import { BaseRuleBuilder } from './base-rule-builder'

export class ArrayRuleBuilder<
  TModel,
  TPropertyName extends keyof TModel
> extends BaseRuleBuilder<TModel, TPropertyName, Array<unknown>> {

  minLength (min: number, message?: string) {
    return this.addRule(
      message ?? `must have at least ${min} items`,
      v => Array.isArray(v) && v.length >= min
    )
  }
}