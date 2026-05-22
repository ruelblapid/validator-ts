# @rbl/validator-ts

[![CI](https://github.com)](https://github.com)
[![npm version](https://shields.io)](https://npmjs.com)
[![License: MIT](https://shields.io)](https://opensource.org)

A lightweight, class-based, extensible validation engine for TypeScript applications that mirrors Laravel's native validation architecture. Stop rewriting form validation logic across the stack—reuse your standard pipe-syntax schemas (`required|email|min:8`) natively inside frontend user interfaces.

## ✨ Features

- **Pipe Syntax String Parsing:** Supports classic rule definitions like `required|email|min:6|max:24`.
- **Compatible Lifecycle API:** Exposes familiar helpers like `.passes()`, `.fails()`, `.invalid()`, and `.getError()`.
- **Advanced Engine Features:** Bundled out-of-the-box support for validation short-circuiting (`bail`), implicit validation rule skipping, and tokenized custom error message overrides (`:attribute`).
- **Framework Reactivity Integrations:** Dedicated, optimized reactive hooks for both **React** and **Vue 3**.
- **Highly Extensible:** Write custom rule classes implementing a standard structural contract or register global shortcuts dynamically via `Validator.extend()`.

---

## 📦 Installation

Install the package via your preferred node package manager:

```bash
npm install @rbl/validator-ts
```

---

## 🚀 Basic Core Usage

You can use the standalone validation engine anywhere in your TypeScript or Node.js environment exactly like Laravel's backend implementation:

```typescript
import { Validator } from '@rbl/validator-ts';

const data = {
  email: 'not-an-email',
  password: '123',
};

const rules = {
  email: 'bail|required|email',
  password: 'required|min:8',
};

// Custom messages with token placement overrides
const customMessages = {
  'email.required': 'We absolutely require an email address.',
  'password.min': 'Your chosen password is insecure! It must be at least :min characters.',
};

// 1. Core instantiation using the static make factory
const validator = Validator.make(data, rules, customMessages);

// 2. Evaluate outcomes using structural flags
if (validator.fails()) {
  console.log(validator.invalid()); 
  // Output: ['email', 'password']

  console.log(validator.getError('email')); 
  // Output: ['The email must be a valid email address.']
}
```

---

## 🎨 Frontend Framework Integrations

### 1. React Integration (`useReactFormValidator`)

The React hook tracks state using immutable updates. It auto-evaluates on input cycles via a performance-optimized `useMemo` block.

```tsx
import React from 'react';
import { useReactFormValidator } from '@rbl/validator-ts';

export function RegistrationForm() {
  const { form, handleChange, getError, passes } = useReactFormValidator(
    { email: '', password: '' },
    { email: 'bail|required|email', password: 'required|min:8' },
    { 'email.required': 'Please enter your email address to register.' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passes) {
      console.log('Validation success! Sending payload:', form);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
      <div>
        <label>Email</label>
        <input 
          type="text" 
          value={form.email} 
          onChange={(e) => handleChange('email', e.target.value)} 
        />
        {getError('email') && <p style={{ color: 'red', margin: 0 }}>{getError('email')[0]}</p>}
      </div>

      <div>
        <label>Password</label>
        <input 
          type="password" 
          value={form.password} 
          onChange={(e) => handleChange('password', e.target.value)} 
        />
        {getError('password') && <p style={{ color: 'red', margin: 0 }}>{getError('password')[0]}</p>}
      </div>

      <button type="submit" disabled={!passes}>Register</button>
    </form>
  );
}
```

### 2. Vue 3 Integration (`useVueFormValidator`)

The Vue integration hooks into Vue's native proxy reactivity system via `reactive` states and `computed` properties, validating input fields instantly on every keystroke.

```html
<script setup lang="ts">
import { useVueFormValidator } from '@rbl/validator-ts';

const { form, getError, passes } = useVueFormValidator(
  { email: '', password: '' },
  { email: 'bail|required|email', password: 'required|min:8' }
);

const submitForm = () => {
  if (passes.value) {
    console.log('Validation success! Sending payload:', form);
  }
};
</script>

<template>
  <form @submit.prevent="submitForm" class="form-container">
    <div class="field">
      <label>Email Address</label>
      <input v-model="form.email" type="text" />
      <span v-if="getError('email')" class="error-msg">{{ getError('email')[0] }}</span>
    </div>

    <div class="field">
      <label>Password</label>
      <input v-model="form.password" type="password" />
      <span v-if="getError('password')" class="error-msg">{{ getError('password')[0] }}</span>
    </div>

    <button type="submit" :disabled="!passes">Submit Form</button>
  </form>
</template>

<style scoped>
.form-container { display: flex; flex-direction: column; gap: 1rem; max-width: 300px; }
.error-msg { color: red; font-size: 0.85rem; display: block; }
</style>
```

---

## 🛠 Adding Custom Rules

### Method A: Global Extensions (String Shortcuts)
Register global closures inside your app initialization file to use them anywhere in your string chains:

```typescript
import { Validator } from '@rbl/validator-ts';

// Example: Registering a custom slug format string shortcut rule
Validator.extend('slug', () => {
  return {
    validate(attribute, value, fail) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (typeof value === 'string' && !slugPattern.test(value)) {
        fail('The :attribute field must be a valid url slug format.');
      }
    }
  };
});

// Usage
const rules = { project_name: 'required|slug' };
```

### Method B: Instantiated Contract Rule Classes
For complex rules (like domain-specific checks), create a custom class implementing the `ValidationRule` blueprint contract:

```typescript
import { ValidationRule, FailCallback } from '@rbl/validator-ts';

export class ProhibitDomain implements ValidationRule {
  constructor(protected bannedDomain: string) {}

  public validate(attribute: string, value: unknown, fail: FailCallback): void {
    if (typeof value === 'string' && value.endsWith(`@${this.bannedDomain}`)) {
      fail(`The :attribute cannot use email addresses registered under ${this.bannedDomain}.`);
    }
  }
}

// Usage
import { ProhibitDomain } from './rules/ProhibitDomain';

const rules = {
  email: ['required', new ProhibitDomain('competitor.com')]
};
```
### Method C: Asynchronous Custom Rules (e.g., Database/API Lookups)
For rules that require server interaction—such as checking if an email is unique—implement the `ValidationRule` contract using an `async/await` signature. The engine natively coordinates async promises concurrently:

```typescript
import { ValidationRule, FailCallback } from '@rbl/validator-ts';

export class UniqueEmailRule implements ValidationRule {
  // Simulating an asynchronous database verification query
  private async checkDatabaseAvailability(email: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const registeredEmails = ['admin@site.com', 'hello@rbl.dev'];
        resolve(!registeredEmails.includes(email));
      }, 300); // 300ms network delay simulation
    });
  }

  public async validate(attribute: string, value: unknown, fail: FailCallback): Promise<void> {
    if (typeof value !== 'string') return;

    const isAvailable = await this.checkDatabaseAvailability(value);
    if (!isAvailable) {
      fail(`The :attribute has already been taken.`);
    }
  }
}

// Usage with Async Engine Setup
const validator = Validator.make(
  { email: 'hello@rbl.dev' },
  { email: ['required', 'email', new UniqueEmailRule()] }
);

// Trigger the async processing sequence
await validator.validate();

if (validator.fails()) {
  console.log(validator.getError('email')); 
  // Output: ['The email has already been taken.']
}
```

## 🚀 Full-Stack Usage Examples

### 1. Node.js Backend API Route (Express Example)

Because the core engine supports asynchronous checks, you can use `@rbl/validator-ts` to secure your backend API endpoints. This example shows how to validate incoming request data, use an asynchronous database check, and return structured errors exactly like a Laravel API controller:

```typescript
import express, { Request, Response } from 'express';
import { Validator } from '@rbl/validator-ts';
import { UniqueEmailRule } from './rules/UniqueEmailRule'; // Your custom async rule

const app = express();
app.use(express.json());

app.post('/api/register', async (req: Request, res: Response) => {
  // 1. Define your full-stack shared validation rules layout
  const rules = {
    'user.profile.username': 'bail|required|min:3',
    'email': ['required', 'email', new UniqueEmailRule()],
    'password': 'required|min:8'
  };

  // 2. Custom error messages with dynamic token replacement attributes
  const customMessages = {
    'user.profile.username.min': 'The username must be at least :min characters long.',
    'email.required': 'An email address is strictly required to sign up.'
  };

  // 3. Initialize the style validation instance container
  const validator = Validator.make(req.body, rules, customMessages);

  // 4. Trigger the asynchronous verification pipeline sequence
  await validator.validate();

  // 5. Intercept failures and return an immediate 422 Unprocessable Entity payload
  if (validator.fails()) {
    return res.status(422).json({
      message: 'The given data was invalid.',
      errors: validator.getErrors() // Returns standard structured error maps
    });
  }

  // 6. Execution proceeds safely if all validation parameters pass
  try {
    // Process user registration model database inserts here...
    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => console.log('API Server running on port 3000'));
```

---

### 2. Standalone Synchronous Usage

If you are running a script or validating data locally on the fly without complex asynchronous database checks, use the instant execution method:

```typescript
import { Validator } from '@rbl/validator-ts';

const localData = { username: 'jo' };
const localRules = { username: 'required|min:5' };

const validator = Validator.make(localData, localRules);

// 🚀 Execute calculations immediately without using async/await keywords
validator.validateSync();

if (validator.fails()) {
  console.log(validator.getError('username'));
  // Output: ['The username must be at least 5 characters.']
}
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
