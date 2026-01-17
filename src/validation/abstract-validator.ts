import { RuleBuilder } from './rule-builders/rule-builder'
import { Rule, ValidationResult } from './types'

export abstract class AbstractValidator<TModel> {
  private _rules = new Map<keyof TModel, Rule<TModel>[]>()
  
  public validate (model: TModel): ValidationResult {
    const errorMap = new Map<string, string[]>()

    for (const [property, rules] of this._rules.entries()) {
      const value = model[property]

      for (const rule of rules) {
        const error = rule(value, model)
        if (error == null) { continue }
        if (!errorMap.has(error.property)) {
          errorMap.set(error.property, [])
        }
       errorMap.get(error.property)!.push(error.message)
      }
    }

    return {
      isValid: errorMap.size === 0,
      errors: Array.from(errorMap.entries()).map(
        ([property, errors]) => ({ property, errors })
      )
    }
  }
  
  protected ruleFor<PropertyName extends keyof TModel> (property: PropertyName): RuleBuilder<TModel, PropertyName> {
    if (!this._rules.has(property)) {
      this._rules.set(property, [])
    }
    return new RuleBuilder(property, this._rules.get(property)!)
  }
}
