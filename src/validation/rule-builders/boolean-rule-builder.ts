import { BaseRuleBuilder } from './base-rule-builder'

export class BooleanRuleBuilder<
  TModel,
  TPropertyName extends keyof TModel
> extends BaseRuleBuilder<TModel, TPropertyName, boolean> {

  isTrue (message = 'must be true') {
    return this.addRule(message, v => v === true)
  }
}