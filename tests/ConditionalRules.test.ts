import { describe, expect, it } from 'vitest';
import { Validator } from '../src/Validator';

describe('Advanced Conditional Engine Evaluation Suite', () => {
	// =========================================================================
	// REQUIRED IF RULE TESTS
	// =========================================================================
	describe('required_if:anotherfield,value checks', () => {
		it('should fail if the target field matches but the base field is missing', () => {
			const payload = { is_company: true, company_tax_id: '' };
			const v = Validator.make(payload, {
				company_tax_id: 'required_if:is_company,true',
			});
			v.validateSync();

			expect(v.fails()).toBe(true);
			expect(v.getError('company_tax_id')).toContain(
				'The company_tax_id field is required when is_company is true.'
			);
		});

		it('should safely pass if the target field does not match, making the field optional', () => {
			const payload = { is_company: false, company_tax_id: '' };
			const v = Validator.make(payload, {
				company_tax_id: 'required_if:is_company,true',
			});
			v.validateSync();

			expect(v.passes()).toBe(true);
		});
	});

	// =========================================================================
	// REQUIRED UNLESS RULE TESTS
	// =========================================================================
	describe('required_unless:anotherfield,value checks', () => {
		it('should fail if the target field differs and the base field is missing', () => {
			const payload = { account_type: 'personal', business_name: '' };
			const v = Validator.make(payload, {
				business_name: 'required_unless:account_type,business',
			});
			v.validateSync();

			expect(v.fails()).toBe(true);
			expect(v.getError('business_name')).toContain(
				'The business_name field is required unless account_type is business.'
			);
		});

		it('should pass if the target field matches the target value, keeping the field optional', () => {
			const payload = { account_type: 'business', business_name: '' };
			const v = Validator.make(payload, {
				business_name: 'required_unless:account_type,business',
			});
			v.validateSync();

			expect(v.passes()).toBe(true);
		});
	});

	// =========================================================================
	// SOMETIMES RULE TESTS
	// =========================================================================
	describe('sometimes rule checks', () => {
		it('should completely skip running validation if the field key is entirely absent', () => {
			const payload = { username: 'taylor' }; // 'coupon_code' is missing from data
			const v = Validator.make(payload, {
				coupon_code: 'sometimes|min:5',
			});
			v.validateSync();

			expect(v.passes()).toBe(true);
		});

		it('should enforce subsequent rules if the field key is present in the data payload', () => {
			const payload = { username: 'taylor', coupon_code: 'abc' }; // Present, but too short!
			const v = Validator.make(payload, {
				coupon_code: 'sometimes|min:5',
			});
			v.validateSync();

			expect(v.fails()).toBe(true);
			expect(v.getError('coupon_code')).toContain(
				'The coupon_code must be at least 5 characters.'
			);
		});
	});
});
