import { AbstractValidator } from '../abstract-validator'

// Mock
type Model = {
  name?: string
  email?: string
  age?: number
}

class TestValidator extends AbstractValidator<Model> { 
  constructor () {
    super()
    this.ruleFor('age').number().required().min(10).max(100)
    this.ruleFor('name').string().required().minLength(1).maxLength(255)
  }
}

//Tests
describe('validation', () => {
  test('should first', () => { 
    const validator = new TestValidator() 
    const x = validator.validate({ })
    expect(x.errors).toStrictEqual({})
  })
})
