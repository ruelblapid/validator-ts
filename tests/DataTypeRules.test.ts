import { describe, expect, it } from 'vitest';
import { Validator } from '../src/Validator';

describe('Data Type Mappings Evaluation Suite', () => {
	// =========================================================================
	// STRING RULE TESTS
	// =========================================================================
	describe('string rule assertion checks', () => {
		it('should pass for valid string values', () => {
			const v = Validator.make({ name: 'Taylor' }, { name: 'string' });
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail for objects, numbers, and arrays', () => {
			const v = Validator.make({ name: 123 }, { name: 'string' });
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('name')).toContain('The name must be a string.');
		});
	});

	// =========================================================================
	// NUMERIC RULE TESTS
	// =========================================================================
	describe('numeric rule assertion checks', () => {
		it('should pass for pure numbers and numeric string inputs', () => {
			const v1 = Validator.make({ price: 45.99 }, { price: 'numeric' });
			const v2 = Validator.make({ price: '123.4' }, { price: 'numeric' });

			v1.validateSync();
			v2.validateSync();

			expect(v1.passes()).toBe(true);
			expect(v2.passes()).toBe(true);
		});

		it('should fail for alphabetical strings', () => {
			const v = Validator.make({ price: 'abc' }, { price: 'numeric' });
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('price')).toContain(
				'The price must be a number.'
			);
		});
	});

	// =========================================================================
	// INTEGER RULE TESTS
	// =========================================================================
	describe('integer rule assertion checks', () => {
		it('should pass for whole numbers and numeric integers', () => {
			const v1 = Validator.make({ count: 10 }, { count: 'integer' });
			const v2 = Validator.make({ count: '42' }, { count: 'integer' });

			v1.validateSync();
			v2.validateSync();

			expect(v1.passes()).toBe(true);
			expect(v2.passes()).toBe(true);
		});

		it('should fail for float/decimal numeric representations', () => {
			const v = Validator.make({ count: 12.34 }, { count: 'integer' });
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('count')).toContain(
				'The count must be an integer.'
			);
		});
	});

	// =========================================================================
	// BOOLEAN RULE TESTS
	// =========================================================================
	describe('boolean rule assertion checks', () => {
		it('should pass for acceptable boolean types and castable representations', () => {
			const forms = [true, false, 1, 0, '1', '0', 'true', 'false'];

			for (const item of forms) {
				const v = Validator.make({ flag: item }, { flag: 'boolean' });
				v.validateSync();
				expect(v.passes()).toBe(true);
			}
		});

		it('should fail for unrelated strings or numerical counts', () => {
			const v = Validator.make(
				{ flag: 'not-a-boolean' },
				{ flag: 'boolean' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('flag')).toContain(
				'The flag field must be true or false.'
			);
		});
	});

	// =========================================================================
	// ARRAY RULE TESTS
	// =========================================================================
	describe('array rule assertion checks', () => {
		it('should pass for structured arrays', () => {
			const v = Validator.make(
				{ options: ['a', 'b'] },
				{ options: 'array' }
			);
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail for plain dictionary mapping blocks', () => {
			const v = Validator.make(
				{ options: { key: 'value' } },
				{ options: 'array' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('options')).toContain(
				'The options must be an array.'
			);
		});
	});

	// =========================================================================
	// NULLABLE INTERCEPTION RULE TESTS
	// =========================================================================
	describe('nullable interception orchestration checks', () => {
		it('should completely pass if a nullable field is null or undefined', () => {
			const v1 = Validator.make(
				{ score: null },
				{ score: 'nullable|integer' }
			);
			const v2 = Validator.make(
				{ score: undefined },
				{ score: 'nullable|integer' }
			);
			const v3 = Validator.make(
				{ score: '' },
				{ score: 'nullable|integer' }
			);

			v1.validateSync();
			v2.validateSync();
			v3.validateSync();

			expect(v1.passes()).toBe(true);
			expect(v2.passes()).toBe(true);
			expect(v3.passes()).toBe(true);
		});

		it('should still run and enforce further rules if a nullable field has data', () => {
			const v = Validator.make(
				{ score: 'not-an-integer' },
				{ score: 'nullable|integer' }
			);
			v.validateSync();

			expect(v.fails()).toBe(true);
			expect(v.getError('score')).toContain(
				'The score must be an integer.'
			);
		});
	});
});
