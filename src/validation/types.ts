export type ValidationError = {
  property: string
  message: string
}

export type ValidationResult = {
  isValid: boolean
  errors: Array<{property: string, errors: string[]}>
}

export type Rule<TModel> = (value: unknown, model: TModel) => ValidationError | null;

export type RuleTyped<TModel, TValue> = (value: TValue, model: TModel) => ValidationError | null;