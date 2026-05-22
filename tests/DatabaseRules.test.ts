import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Validator } from '../src/Validator';
import { ExistsRule } from '../src/rules/ExistsRule';
import { UniqueRule } from '../src/rules/UniqueRule';

// 🚀 Concrete Mock Implementation of UniqueRule simulating a network delay
class MockUniqueRule extends UniqueRule {
	async isUnique(
		table: string,
		column: string,
		value: unknown
	): Promise<boolean> {
		await new Promise((resolve) => setTimeout(resolve, 300));
		const databaseRecords = ['taken@rbl.dev', 'admin@domain.com'];
		return !databaseRecords.includes(String(value));
	}
}

// 🚀 Concrete Mock Implementation of ExistsRule simulating an API lookup delay
class MockExistsRule extends ExistsRule {
	async existsInDatabase(
		table: string,
		column: string,
		value: unknown
	): Promise<boolean> {
		await new Promise((resolve) => setTimeout(resolve, 300));
		const databaseIds = ['1', '5', '42'];
		return databaseIds.includes(String(value));
	}
}

describe('Database Orchestration Contract Evaluation Suite', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// =========================================================================
	// UNIQUE RULE MOCK TESTS
	// =========================================================================
	describe('unique database abstraction constraints', () => {
		it('should fail if the custom database bridge returns a duplicated match', async () => {
			const v = Validator.make(
				{ email: 'taken@rbl.dev' },
				{ email: [new MockUniqueRule('users', 'email')] }
			);
			const validation = v.validate();

			await vi.advanceTimersByTimeAsync(300);
			await validation;

			expect(v.fails()).toBe(true);
			expect(v.getError('email')).toContain(
				'The email has already been taken.'
			);
		});

		it('should pass if the database bridge finds no conflicting values', async () => {
			const v = Validator.make(
				{ email: 'fresh_user@rbl.dev' },
				{ email: [new MockUniqueRule('users', 'email')] }
			);
			const validation = v.validate();

			await vi.advanceTimersByTimeAsync(300);
			await validation;

			expect(v.passes()).toBe(true);
		});
	});

	// =========================================================================
	// EXISTS RULE MOCK TESTS
	// =========================================================================
	describe('exists database abstraction constraints', () => {
		it('should fail if the value does not exist in the reference records lookup table', async () => {
			const v = Validator.make(
				{ tenant_id: '999' },
				{ tenant_id: [new MockExistsRule('tenants', 'id')] }
			);
			const validation = v.validate();

			await vi.advanceTimersByTimeAsync(300);
			await validation;

			expect(v.fails()).toBe(true);
			expect(v.getError('tenant_id')).toContain(
				'The selected tenant_id is invalid.'
			);
		});

		it('should pass if the matching primary index entry exists in the source matrix', async () => {
			const v = Validator.make(
				{ tenant_id: '42' },
				{ tenant_id: [new MockExistsRule('tenants', 'id')] }
			);
			const validation = v.validate();

			await vi.advanceTimersByTimeAsync(300);
			await validation;

			expect(v.passes()).toBe(true);
		});
	});
});
