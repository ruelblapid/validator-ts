import { describe, expect, it } from 'vitest';
import { Validator } from '../src/Validator';

describe('File and Pattern Validation Evaluation Suite', () => {
	// =========================================================================
	// IMAGE RULE TESTS
	// =========================================================================
	describe('image rule checks', () => {
		it('should pass for string paths with valid image formats', () => {
			const v = Validator.make(
				{ avatar: 'profile.png' },
				{ avatar: 'image' }
			);
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail for unsupported file structures', () => {
			const v = Validator.make(
				{ avatar: 'document.pdf' },
				{ avatar: 'image' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('avatar')).toContain(
				'The avatar must be an image.'
			);
		});
	});

	// =========================================================================
	// MIMES RULE TESTS
	// =========================================================================
	describe('mimes:extensions rule checks', () => {
		it('should pass if the extension is in the allowed whitelist array parameters', () => {
			const v = Validator.make(
				{ doc: 'invoice.pdf' },
				{ doc: 'mimes:pdf,docx' }
			);
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail if the extension is outside the whitelist boundaries', () => {
			const v = Validator.make(
				{ doc: 'backup.zip' },
				{ doc: 'mimes:pdf,docx' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('doc')).toContain(
				'The doc must be a file of type: pdf, docx.'
			);
		});
	});

	// =========================================================================
	// ALPHA RULE TESTS
	// =========================================================================
	describe('alpha rule checks', () => {
		it('should pass for pure string letters', () => {
			const v = Validator.make(
				{ first_name: 'John' },
				{ first_name: 'alpha' }
			);
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail if numbers or spaces exist in the field value', () => {
			const v = Validator.make(
				{ first_name: 'John 2' },
				{ first_name: 'alpha' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('first_name')).toContain(
				'The first_name must only contain letters.'
			);
		});
	});

	// =========================================================================
	// ALPHA NUM RULE TESTS
	// =========================================================================
	describe('alpha_num rule checks', () => {
		it('should pass for mixed letters and digit parameters', () => {
			const v = Validator.make({ sku: 'PROD123' }, { sku: 'alpha_num' });
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail if special punctuation strings are present', () => {
			const v = Validator.make(
				{ sku: 'PROD-123!' },
				{ sku: 'alpha_num' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('sku')).toContain(
				'The sku must only contain letters and numbers.'
			);
		});
	});

	// =========================================================================
	// REGEX RULE TESTS
	// =========================================================================
	describe('regex rule checks', () => {
		it('should pass if data matches a strict format regular expression shortcut string', () => {
			const v = Validator.make(
				{ code: 'ABC-123' },
				{ code: 'regex:/^[A-Z]{3}-\\d{3}$/' }
			);
			v.validateSync();
			expect(v.passes()).toBe(true);
		});

		it('should fail if the pattern format checks diverge from rules specifications', () => {
			const v = Validator.make(
				{ code: 'abc-123' },
				{ code: 'regex:/^[A-Z]{3}-\\d{3}$/' }
			);
			v.validateSync();
			expect(v.fails()).toBe(true);
			expect(v.getError('code')).toContain('The code format is invalid.');
		});
	});
});
