const { Schema } = require('./schema');

describe('StringValidator', () => {
  it('validates required string', () => {
    const validator = Schema.string();
    expect(validator.validate('abc')).toEqual({ valid: true });
    expect(validator.validate(123).valid).toBe(false);
    expect(validator.validate(undefined).valid).toBe(false);
  });
  it('validates minLength and maxLength', () => {
    const validator = Schema.string().minLength(2).maxLength(4);
    expect(validator.validate('a').valid).toBe(false);
    expect(validator.validate('ab').valid).toBe(true);
    expect(validator.validate('abcd').valid).toBe(true);
    expect(validator.validate('abcde').valid).toBe(false);
  });
  it('validates pattern', () => {
    const validator = Schema.string().pattern(/^a/);
    expect(validator.validate('abc').valid).toBe(true);
    expect(validator.validate('xbc').valid).toBe(false);
  });
  it('supports optional', () => {
    const validator = Schema.string().optional();
    expect(validator.validate(undefined).valid).toBe(true);
    expect(validator.validate(null).valid).toBe(true);
  });
  it('supports withMessage', () => {
    const validator = Schema.string().minLength(3).withMessage('Too short');
    expect(validator.validate('a')).toEqual({ valid: false, errors: ['Too short'] });
  });
});

describe('NumberValidator', () => {
  it('validates required number', () => {
    const validator = Schema.number();
    expect(validator.validate(5)).toEqual({ valid: true });
    expect(validator.validate('5').valid).toBe(false);
    expect(validator.validate(undefined).valid).toBe(false);
  });
  it('validates min and max', () => {
    const validator = Schema.number().min(2).max(4);
    expect(validator.validate(1).valid).toBe(false);
    expect(validator.validate(2).valid).toBe(true);
    expect(validator.validate(4).valid).toBe(true);
    expect(validator.validate(5).valid).toBe(false);
  });
  it('validates integer', () => {
    const validator = Schema.number().integer();
    expect(validator.validate(2).valid).toBe(true);
    expect(validator.validate(2.5).valid).toBe(false);
  });
  it('supports optional', () => {
    const validator = Schema.number().optional();
    expect(validator.validate(undefined).valid).toBe(true);
    expect(validator.validate(null).valid).toBe(true);
  });
  it('supports withMessage', () => {
    const validator = Schema.number().min(10).withMessage('Too small');
    expect(validator.validate(5)).toEqual({ valid: false, errors: ['Too small'] });
  });
});

describe('BooleanValidator', () => {
  it('validates required boolean', () => {
    const validator = Schema.boolean();
    expect(validator.validate(true)).toEqual({ valid: true });
    expect(validator.validate(false)).toEqual({ valid: true });
    expect(validator.validate('true').valid).toBe(false);
    expect(validator.validate(undefined).valid).toBe(false);
  });
  it('supports optional', () => {
    const validator = Schema.boolean().optional();
    expect(validator.validate(undefined).valid).toBe(true);
    expect(validator.validate(null).valid).toBe(true);
  });
  it('supports withMessage', () => {
    const validator = Schema.boolean().withMessage('Not bool');
    expect(validator.validate('yes')).toEqual({ valid: false, errors: ['Not bool'] });
  });
});

describe('DateValidator', () => {
  it('validates required date', () => {
    const validator = Schema.date();
    expect(validator.validate(new Date())).toEqual({ valid: true });
    expect(validator.validate('2020-01-01').valid).toBe(false);
    expect(validator.validate(undefined).valid).toBe(false);
  });
  it('supports optional', () => {
    const validator = Schema.date().optional();
    expect(validator.validate(undefined).valid).toBe(true);
    expect(validator.validate(null).valid).toBe(true);
  });
  it('supports withMessage', () => {
    const validator = Schema.date().withMessage('Not date');
    expect(validator.validate('2020-01-01')).toEqual({ valid: false, errors: ['Not date'] });
  });
});

describe('ObjectValidator', () => {
  it('validates object with schema', () => {
    const validator = Schema.object({
      name: Schema.string().minLength(2),
      age: Schema.number().min(0).optional(),
      isActive: Schema.boolean(),
    });
    expect(validator.validate({ name: 'Al', isActive: true })).toEqual({ valid: true });
    const result = validator.validate({ name: 'A', isActive: 'yes' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('name');
    expect(result.errors).toHaveProperty('isActive');
  });
  it('supports optional', () => {
    const validator = Schema.object({ foo: Schema.string() }).optional();
    expect(validator.validate(undefined).valid).toBe(true);
    expect(validator.validate(null).valid).toBe(true);
  });
  it('supports withMessage', () => {
    const validator = Schema.object({ foo: Schema.string() }).withMessage('Not obj');
    expect(validator.validate('str')).toEqual({ valid: false, errors: ['Not obj'] });
  });
  it('validates nested objects', () => {
    const validator = Schema.object({
      user: Schema.object({
        name: Schema.string().minLength(2),
      }),
    });
    expect(validator.validate({ user: { name: 'Al' } })).toEqual({ valid: true });
    expect(validator.validate({ user: { name: 'A' } }).valid).toBe(false);
  });
});

describe('ArrayValidator', () => {
  it('validates array of items', () => {
    const validator = Schema.array(Schema.string().minLength(2));
    expect(validator.validate(['dev', 'ai'])).toEqual({ valid: true });
    const result = validator.validate(['d', 123]);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('0');
    expect(result.errors).toHaveProperty('1');
  });
  it('supports optional', () => {
    const validator = Schema.array(Schema.string()).optional();
    expect(validator.validate(undefined).valid).toBe(true);
    expect(validator.validate(null).valid).toBe(true);
  });
  it('supports withMessage', () => {
    const validator = Schema.array(Schema.string()).withMessage('Not arr');
    expect(validator.validate('str')).toEqual({ valid: false, errors: ['Not arr'] });
  });
  it('validates array of objects', () => {
    const validator = Schema.array(
      Schema.object({ id: Schema.number().integer() })
    );
    expect(validator.validate([{ id: 1 }, { id: 2 }])).toEqual({ valid: true });
    expect(validator.validate([{ id: 1 }, { id: 2.5 }]).valid).toBe(false);
  });
}); 