import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import { Validator } from '../src/Validator.js';
import { useReactFormValidator } from '../src/integrations/react.js';
import { useVueFormValidator } from '../src/integrations/vue.js';

describe('@rbl/validator-ts Evaluation Suite', () => {
	// =========================================================================
	// CORE ENGINE & BUILT-IN RULES TESTS
	// =========================================================================
	describe('Core Validator Native Logic', () => {
		it('should pass if validation rules are fully satisfied', () => {
			const v = Validator.make(
				{ email: 'test@domain.com', password: 'secure_password' },
				{ email: 'required|email', password: 'required|min:6' }
			);

			expect(v.passes()).toBe(true);
			expect(v.fails()).toBe(false);
		});

		it('should catch invalid inputs and return accurate error structures', () => {
			const v = Validator.make(
				{ email: 'not-an-email', password: '123' },
				{ email: 'required|email', password: 'required|min:6' }
			);

			expect(v.fails()).toBe(true);
			expect(v.invalid()).toContain('email');
			expect(v.invalid()).toContain('password');
			expect(v.getError('email')).toContain(
				'The email must be a valid email address.'
			);
		});

		it('should respect the bail mechanism and break testing loops early', () => {
			const v = Validator.make(
				{ email: '' }, // Required fails, format should be skipped
				{ email: 'bail|required|email' }
			);

			expect(v.getErrors()['email']).toHaveLength(1);
			expect(v.getError('email')?.[0]).toContain('required');
		});

		it('should replace token structures using custom override dictionaries', () => {
			const v = Validator.make(
				{ username: '' },
				{ username: 'required' },
				{
					'username.required':
						'Please provide a unique handle for :attribute.',
				}
			);

			expect(v.getError('username')?.[0]).toBe(
				'Please provide a unique handle for username.'
			);
		});
	});

	// =========================================================================
	// REACT HOOKS INTEGRATION TESTS
	// =========================================================================
	describe('React Hook Lifecycle Integration', () => {
		it('should reflect invalid status reactively upon input state transformation', () => {
			const { result } = renderHook(() =>
				useReactFormValidator(
					{ value: '' },
					{ value: 'required|min:4' }
				)
			);

			// Begins as failed because value is empty
			expect(result.current.fails).toBe(true);

			// Simulate a user typing a valid string
			act(() => {
				result.current.handleChange('value', 'hello');
			});

			// Hook state updates automatically
			expect(result.current.passes).toBe(true);
			expect(result.current.getError('value')).toBeNull();
		});
	});

	// =========================================================================
	// VUE 3 COMPOSABLES INTEGRATION TESTS
	// =========================================================================
	describe('Vue Composable Proxy Integration', () => {
		it('should dynamically update errors using proxy bindings on data changes', async () => {
			const { form, passes, fails, getError } = useVueFormValidator(
				{ content: 'abc' },
				{ content: 'required|min:5' }
			);

			await nextTick();

			expect(fails.value).toBe(true);

			// Mutate the proxy
			form.content = 'long_enough_string';

			// Wait for the change to ripple through the tracking node tree
			await nextTick();

			expect(passes.value).toBe(true);
			expect(getError('content')).toBeNull();
		});
	});
});
