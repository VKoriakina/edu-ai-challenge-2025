# Data Validation Library (Task 8)

A reusable, type-safe data validation library for complex inputs. Supports primitive types, arrays, nested objects, optional fields, and custom error messages.

## Requirements
- Node.js (v14+ recommended)
- npm

## Installation
```bash
cd 8
npm install
```

## Usage

### Primitive Validators
```js
const { Schema } = require('./schema');

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
```

### Complex Validators
```js
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
```

## Running Tests
To run the test suite:
```bash
npx jest 8/schema.test.js
```

To generate a coverage report:
```bash
npx jest --coverage 8/schema.test.js > 8/test_report.txt
```

## Test Coverage
- Statements: **96.64%**
- Branches: **93.44%**
- Functions: **92.5%**
- Lines: **96.45%**

See `test_report.txt` for details.
