import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Validator } from '../src/Validator';
import { FailCallback, ValidationRule } from '../src/contracts/Validation';

// 1. Define the Async Database Rule within our testing file
class UniqueEmailRule implements ValidationRule {
	public async validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): Promise<void> {
		if (typeof value !== 'string') return;

		// Simulate an async network database query block
		await new Promise((resolve) => setTimeout(resolve, 500));

		const blacklisted = ['taken@rbl.dev', 'admin@domain.com'];
		if (blacklisted.includes(value)) {
			fail('The :attribute has already been taken.');
		}
	}
}

describe('Advanced Async & Nested Validation Extensions', () => {
	// Set up Vitest Fake Timers to instantly control clock cycles
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// =========================================================================
	// NESTED OBJECT DOT-NOTATION TESTS
	// =========================================================================
	describe('Nested Data Extraction Parsing', () => {
		it('should accurately isolate deeply nested attributes via dot-notation', async () => {
			const complexData = {
				organization: {
					departments: {
						engineering: { lead_username: 'jo' }, // Too short (min:4)
					},
				},
			};

			const rules = {
				'organization.departments.engineering.lead_username':
					'required|min:4',
			};

			const v = Validator.make(complexData, rules);
			await v.validate();

			expect(v.fails()).toBe(true);
			expect(
				v.getError('organization.departments.engineering.lead_username')
			).toContain(
				'The organization.departments.engineering.lead_username must be at least 4 characters.'
			);
		});
	});

	// =========================================================================
	// ASYNCHRONOUS RULE MOCK TESTS
	// =========================================================================
	describe('Asynchronous Rule Promise Execution Engine', () => {
		it('should accurately capture async rule rejections with fake timers', async () => {
			const data = { email: 'taken@rbl.dev' };
			const rules = { email: ['required', new UniqueEmailRule()] };

			const v = Validator.make(data, rules);

			// Initialize the async runner block execution promise
			const validationPromise = v.validate();

			// Fast-forward time instantly by 500ms to fire the mocked database response
			await vi.advanceTimersByTimeAsync(500);

			// Resolve the original verification promise
			const isPassed = await validationPromise;

			expect(isPassed).toBe(false);
			expect(v.fails()).toBe(true);
			expect(v.getError('email')).toContain(
				'The email has already been taken.'
			);
		});

		it('should successfully pass when async database checks find no conflicts', async () => {
			const data = { email: 'available_username@rbl.dev' };
			const rules = { email: ['required', new UniqueEmailRule()] };

			const v = Validator.make(data, rules);
			const validationPromise = v.validate();

			await vi.advanceTimersByTimeAsync(500);
			const isPassed = await validationPromise;

			expect(isPassed).toBe(true);
			expect(v.getErrors()['email']).toBeUndefined();
		});
	});
});
