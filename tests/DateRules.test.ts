import { describe, expect, it } from 'vitest';
import { Validator } from '../src/Validator';

describe('Calendar Date Engine Evaluation Suite', () => {
	// =========================================================================
	// DATE RULE TESTS
	// =========================================================================
	describe('date validation rule checks', () => {
		it('should pass for standard recognizable date string patterns', () => {
			const v = Validator.make(
				{ created_at: '2026-12-25' },
				{ created_at: 'date' }
			);
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail for arbitrary text phrases', () => {
			const v = Validator.make(
				{ created_at: 'not-a-valid-date' },
				{ created_at: 'date' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('created_at')).toContain(
				'The created_at is not a valid date.'
			);
		});
	});

	// =========================================================================
	// AFTER DATE RULE TESTS
	// =========================================================================
	describe('after:date validation rule checks', () => {
		it('should pass if the date occurs strictly after the target boundary limit', () => {
			const v = Validator.make(
				{ appointment: '2026-06-15' },
				{ appointment: 'after:2026-06-01' }
			);
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail if the date occurs chronologically before or on the boundary limit', () => {
			const v = Validator.make(
				{ appointment: '2026-05-20' },
				{ appointment: 'after:2026-06-01' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('appointment')).toContain(
				'The appointment must be a date after 2026-06-01.'
			);
		});
	});

	// =========================================================================
	// BEFORE DATE RULE TESTS
	// =========================================================================
	describe('before:date validation rule checks', () => {
		it('should pass if the date occurs strictly preceding the target boundary limit', () => {
			const v = Validator.make(
				{ deadline: '2026-04-10' },
				{ deadline: 'before:2026-05-01' }
			);
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail if the input date equals or surpasses the boundary milestone limit', () => {
			const v = Validator.make(
				{ deadline: '2026-06-01' },
				{ deadline: 'before:2026-05-01' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('deadline')).toContain(
				'The deadline must be a date before 2026-05-01.'
			);
		});
	});

	// =========================================================================
	// DATE FORMAT RULE TESTS
	// =========================================================================
	describe('date_format:format validation rule checks', () => {
		it('should pass if the pattern cleanly matches the required structural layout profile', () => {
			const v = Validator.make(
				{ logged_time: '2026-05-22' },
				{ logged_time: 'date_format:Y-m-d' }
			);
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail if the calendar separators or token digit boundaries differ', () => {
			// Input uses slashes, rule requires dashes
			const v = Validator.make(
				{ logged_time: '2026/05/22' },
				{ logged_time: 'date_format:Y-m-d' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('logged_time')).toContain(
				'The logged_time does not match the format Y-m-d.'
			);
		});
	});
});
