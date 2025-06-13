// Schema Builder
class Schema {
  /**
   * Returns a string validator
   */
  static string() { return new StringValidator(); }
  /**
   * Returns a number validator
   */
  static number() { return new NumberValidator(); }
  /**
   * Returns a boolean validator
   */
  static boolean() { return new BooleanValidator(); }
  /**
   * Returns a date validator
   */
  static date() { return new DateValidator(); }
  /**
   * Returns an object validator
   * @param {Object<string, Validator>} schema - The schema definition
   */
  static object(schema) { return new ObjectValidator(schema); }
  /**
   * Returns an array validator
   * @param {Validator} itemValidator - Validator for array items
   */
  static array(itemValidator) { return new ArrayValidator(itemValidator); }
}

/**
 * Base class for all validators
 */
class Validator {
  /**
   * Validates the value
   * @param {*} value
   * @returns {ValidationResult}
   */
  validate(value) { throw new Error('Not implemented'); }
  /**
   * Makes the field optional
   * @returns {this}
   */
  optional() { throw new Error('Not implemented'); }
  /**
   * Sets a custom error message
   * @param {string} message
   * @returns {this}
   */
  withMessage(message) { throw new Error('Not implemented'); }
}

/**
 * String validator
 */
class StringValidator extends Validator {
  constructor() {
    super();
    this._min = null;
    this._max = null;
    this._pattern = null;
    this._optional = false;
    this._message = null;
  }
  /**
   * Set minimum string length
   * @param {number} min
   * @returns {this}
   */
  minLength(min) {
    this._min = min;
    return this;
  }
  /**
   * Set maximum string length
   * @param {number} max
   * @returns {this}
   */
  maxLength(max) {
    this._max = max;
    return this;
  }
  /**
   * Set regex pattern
   * @param {RegExp} pattern
   * @returns {this}
   */
  pattern(pattern) {
    this._pattern = pattern;
    return this;
  }
  /**
   * Make field optional
   * @returns {this}
   */
  optional() {
    this._optional = true;
    return this;
  }
  /**
   * Set custom error message
   * @param {string} message
   * @returns {this}
   */
  withMessage(message) {
    this._message = message;
    return this;
  }
  /**
   * Validate value
   * @param {*} value
   * @returns {ValidationResult}
   */
  validate(value) {
    if (value === undefined || value === null) {
      if (this._optional) return { valid: true };
      return { valid: false, errors: [this._message || 'Value is required'] };
    }
    if (typeof value !== 'string') {
      return { valid: false, errors: [this._message || 'Value must be a string'] };
    }
    if (this._min !== null && value.length < this._min) {
      return { valid: false, errors: [this._message || `Minimum length is ${this._min}`] };
    }
    if (this._max !== null && value.length > this._max) {
      return { valid: false, errors: [this._message || `Maximum length is ${this._max}`] };
    }
    if (this._pattern && !this._pattern.test(value)) {
      return { valid: false, errors: [this._message || 'Value does not match pattern'] };
    }
    return { valid: true };
  }
}

/**
 * Number validator
 */
class NumberValidator extends Validator {
  constructor() {
    super();
    this._min = null;
    this._max = null;
    this._integer = false;
    this._optional = false;
    this._message = null;
  }
  /**
   * Set minimum value
   * @param {number} min
   * @returns {this}
   */
  min(min) {
    this._min = min;
    return this;
  }
  /**
   * Set maximum value
   * @param {number} max
   * @returns {this}
   */
  max(max) {
    this._max = max;
    return this;
  }
  /**
   * Require integer value
   * @returns {this}
   */
  integer() {
    this._integer = true;
    return this;
  }
  /**
   * Make field optional
   * @returns {this}
   */
  optional() {
    this._optional = true;
    return this;
  }
  /**
   * Set custom error message
   * @param {string} message
   * @returns {this}
   */
  withMessage(message) {
    this._message = message;
    return this;
  }
  /**
   * Validate value
   * @param {*} value
   * @returns {ValidationResult}
   */
  validate(value) {
    if (value === undefined || value === null) {
      if (this._optional) return { valid: true };
      return { valid: false, errors: [this._message || 'Value is required'] };
    }
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, errors: [this._message || 'Value must be a number'] };
    }
    if (this._min !== null && value < this._min) {
      return { valid: false, errors: [this._message || `Minimum value is ${this._min}`] };
    }
    if (this._max !== null && value > this._max) {
      return { valid: false, errors: [this._message || `Maximum value is ${this._max}`] };
    }
    if (this._integer && !Number.isInteger(value)) {
      return { valid: false, errors: [this._message || 'Value must be an integer'] };
    }
    return { valid: true };
  }
}

/**
 * Boolean validator
 */
class BooleanValidator extends Validator {
  constructor() {
    super();
    this._optional = false;
    this._message = null;
  }
  /**
   * Make field optional
   * @returns {this}
   */
  optional() {
    this._optional = true;
    return this;
  }
  /**
   * Set custom error message
   * @param {string} message
   * @returns {this}
   */
  withMessage(message) {
    this._message = message;
    return this;
  }
  /**
   * Validate value
   * @param {*} value
   * @returns {ValidationResult}
   */
  validate(value) {
    if (value === undefined || value === null) {
      if (this._optional) return { valid: true };
      return { valid: false, errors: [this._message || 'Value is required'] };
    }
    if (typeof value !== 'boolean') {
      return { valid: false, errors: [this._message || 'Value must be a boolean'] };
    }
    return { valid: true };
  }
}

/**
 * Date validator
 */
class DateValidator extends Validator {
  constructor() {
    super();
    this._optional = false;
    this._message = null;
  }
  /**
   * Make field optional
   * @returns {this}
   */
  optional() {
    this._optional = true;
    return this;
  }
  /**
   * Set custom error message
   * @param {string} message
   * @returns {this}
   */
  withMessage(message) {
    this._message = message;
    return this;
  }
  /**
   * Validate value
   * @param {*} value
   * @returns {ValidationResult}
   */
  validate(value) {
    if (value === undefined || value === null) {
      if (this._optional) return { valid: true };
      return { valid: false, errors: [this._message || 'Value is required'] };
    }
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      return { valid: false, errors: [this._message || 'Value must be a valid Date'] };
    }
    return { valid: true };
  }
}

/**
 * Object validator
 */
class ObjectValidator extends Validator {
  /**
   * @param {Object<string, Validator>} schema
   */
  constructor(schema) {
    super();
    this._schema = schema;
    this._optional = false;
    this._message = null;
  }
  /**
   * Make field optional
   * @returns {this}
   */
  optional() {
    this._optional = true;
    return this;
  }
  /**
   * Set custom error message
   * @param {string} message
   * @returns {this}
   */
  withMessage(message) {
    this._message = message;
    return this;
  }
  /**
   * Validate value
   * @param {*} value
   * @returns {ValidationResult}
   */
  validate(value) {
    if (value === undefined || value === null) {
      if (this._optional) return { valid: true };
      return { valid: false, errors: [this._message || 'Value is required'] };
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      return { valid: false, errors: [this._message || 'Value must be an object'] };
    }
    let valid = true;
    let errors = {};
    for (const key in this._schema) {
      const validator = this._schema[key];
      const result = validator.validate(value[key]);
      if (!result.valid) {
        valid = false;
        errors[key] = result.errors;
      }
    }
    if (valid) return { valid: true };
    return { valid: false, errors };
  }
}

/**
 * Array validator
 */
class ArrayValidator extends Validator {
  /**
   * @param {Validator} itemValidator
   */
  constructor(itemValidator) {
    super();
    this._itemValidator = itemValidator;
    this._optional = false;
    this._message = null;
  }
  /**
   * Make field optional
   * @returns {this}
   */
  optional() {
    this._optional = true;
    return this;
  }
  /**
   * Set custom error message
   * @param {string} message
   * @returns {this}
   */
  withMessage(message) {
    this._message = message;
    return this;
  }
  /**
   * Validate value
   * @param {*} value
   * @returns {ValidationResult}
   */
  validate(value) {
    if (value === undefined || value === null) {
      if (this._optional) return { valid: true };
      return { valid: false, errors: [this._message || 'Value is required'] };
    }
    if (!Array.isArray(value)) {
      return { valid: false, errors: [this._message || 'Value must be an array'] };
    }
    let valid = true;
    let errors = {};
    value.forEach((item, idx) => {
      const result = this._itemValidator.validate(item);
      if (!result.valid) {
        valid = false;
        errors[idx] = result.errors;
      }
    });
    if (valid) return { valid: true };
    return { valid: false, errors };
  }
}

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the value is valid
 * @property {Array<string>} [errors] - List of error messages
 */

// Define a complex schema
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
  country: Schema.string()
});

const userSchema = Schema.object({
  id: Schema.string().withMessage('ID must be a string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: addressSchema.optional(),
  metadata: Schema.object({}).optional()
});

// Validate data
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  tags: ["developer", "designer"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "12345",
    country: "USA"
  }
};

const result = userSchema.validate(userData);

// Usage examples for primitive validators
/**
// String
const nameValidator = Schema.string().minLength(2).maxLength(10);
console.log(nameValidator.validate('A')); // { valid: false, errors: ['Minimum length is 2'] }
console.log(nameValidator.validate('Alice')); // { valid: true }

// Number
const ageValidator = Schema.number().min(0).max(120).integer();
console.log(ageValidator.validate(25)); // { valid: true }
console.log(ageValidator.validate(-1)); // { valid: false, errors: ['Minimum value is 0'] }

// Boolean
const activeValidator = Schema.boolean();
console.log(activeValidator.validate(true)); // { valid: true }
console.log(activeValidator.validate('yes')); // { valid: false, errors: ['Value must be a boolean'] }

// Date
const dateValidator = Schema.date();
console.log(dateValidator.validate(new Date())); // { valid: true }
console.log(dateValidator.validate('2020-01-01')); // { valid: false, errors: ['Value must be a valid Date'] }
*/

// Usage examples for complex validators
/**
// Object
const userSchema = Schema.object({
  name: Schema.string().minLength(2),
  age: Schema.number().min(0).optional(),
  isActive: Schema.boolean(),
});
console.log(userSchema.validate({ name: 'Al', isActive: true })); // { valid: true }
console.log(userSchema.validate({ name: 'A', isActive: 'yes' })); // { valid: false, errors: { name: ['Minimum length is 2'], isActive: ['Value must be a boolean'] } }

// Array
const tagsValidator = Schema.array(Schema.string().minLength(2));
console.log(tagsValidator.validate(['dev', 'ai'])); // { valid: true }
console.log(tagsValidator.validate(['d', 123])); // { valid: false, errors: { '0': ['Minimum length is 2'], '1': ['Value must be a string'] } }
*/

module.exports = { Schema };
