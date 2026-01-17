import { RuleTyped } from '../types'

export abstract class BaseRuleBuilder<
  TModel,
  TPropertyName extends keyof TModel,
  TValue
> {
  constructor (
    protected readonly property: TPropertyName,
    protected readonly rules: RuleTyped<TModel, TValue>[]
  ) {}

  protected addRule (
    message: string,
    predicate: (value: TValue, model: TModel) => boolean
  ): this {
    this.rules.push((value, model: TModel) =>
      predicate(value, model)
        ? null
        : {
          property: String(this.property),
          message
        }
    )
    return this
  }
}